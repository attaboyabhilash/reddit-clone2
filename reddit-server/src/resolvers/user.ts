import { Arg, Ctx, Field, Mutation, ObjectType, Resolver, Query, FieldResolver, Root } from "type-graphql";
import { MyContext } from "src/types";
import { User } from "../entities/User";
import argon2 from "argon2"
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "../utils/UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import sendEmail from "../utils/sendEmail";
import { v4 as uuid } from 'uuid'
import { getConnection } from "typeorm";
@ObjectType()
class FieldError {
    @Field()
    field: string
    @Field()
    message: string
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], {nullable: true})
    errors?: FieldError[]
    @Field(() => User, {nullable: true})
    user?: User
}

@Resolver(User)
export class UserResolvers {

    @FieldResolver(() => String) 
    email(
        @Root() user: User,
        @Ctx() { req } : MyContext
    ){
        if(req.session.userId === user._id) {
            return user.email
        }
        return ""
    }

    @Mutation(() => UserResponse)
    async changePassword(
        @Arg('token') token: string,
        @Arg('newPassword') newPassword: string,
        @Ctx() {redis, req} : MyContext
    ): Promise<UserResponse> {
        if(newPassword.length <= 3) {
            return {
                errors: [{
                    field: "newPassword",
                    message: "password length must be greater than 3"
                }]
            }
        }

        const key = FORGOT_PASSWORD_PREFIX + token

        const userId = await redis.get(key)
        if(!userId) {
            return {
                errors: [{
                    field: "token",
                    message: "token expired"
                }]
            }
        }

        const _id = parseInt(userId)
        const user = await User.findOne(_id)
        if(!user) {
            return {
                errors: [{
                    field: "token",
                    message: "user not found"
                }]
            }
        }

        const newPass = await argon2.hash(newPassword)
        await User.update(_id, { password: newPass })
        
        req.session.userId = user._id
        
        await redis.del(key)

        return { user }
    }

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() {redis}: MyContext
    ) {
        const user = await User.findOne({where : {email}})
        if(!user) {
            return true
        }
        const token = uuid()
        redis.set(FORGOT_PASSWORD_PREFIX + token, user._id, 'ex', 1000 * 60 * 60 * 24 * 3)
        
        await sendEmail(email, `<a target="__blank" href="http://localhost:3000/change_password/${token}">reset password</a>`)
        return true
    }

    @Query(() => User, { nullable: true })
    me(@Ctx() { req }: MyContext) {
        // you are not logged in
        if (!req.session.userId) {
            return null;
        }

        return User.findOne({ _id: req.session.userId })
    }

    @Mutation(() => UserResponse) 
    async register(
        @Arg('options') options: UsernamePasswordInput, 
        @Ctx() { req }: MyContext): Promise<UserResponse> {
        
        const errors = validateRegister(options)

        if(errors) {
            return {errors}
        }
        
        const hashedPassword = await argon2.hash(options.password)
        let user
        try {
            const result = await getConnection().createQueryBuilder().insert().into(User).values({
                username: options.username, 
                email: options.email, 
                password: hashedPassword
            }).returning('*').execute()
            user = result.raw[0]
        } catch (error) {
            console.log("Error", error)
            if(error.code === '23505' || error.detail.includes('already exists')) {
                return {
                    errors: [{
                        field: 'username',
                        message: 'username already exists'
                    }]
                }
            }   
            if(error.detail.includes('Key (email)=')) {
                return {
                    errors: [{
                        field: 'email',
                        message: 'email already exists'
                    }]
                }
            }
        }

        req.session.userId = user._id 

        return {user}
    }

    @Mutation(() => UserResponse) 
    async login(
        @Arg('usernameOrEmail') usernameOrEmail: string,
        @Arg('password') password: string,  
        @Ctx() { req }: MyContext): Promise<UserResponse> {
        const user = await User.findOne(usernameOrEmail.includes('@') 
                                            ? {where : {email: usernameOrEmail}} 
                                            : {where: {username: usernameOrEmail}}
                                        )
        if(!user) {
            return {
                errors: [{
                    field: 'usernameOrEmail',
                    message: 'username does not exist'
                }]
            }
        }
        const valid = await argon2.verify(user.password, password)
        if(!valid) {
            return {
                errors: [{
                    field: 'password',
                    message: 'password is incorrect'
                }]
            }
        }

        req.session.userId = user._id 
    
        return {user}
    }

    @Mutation(() => Boolean)
    logout(
        @Ctx() {req, res} : MyContext
    ) {
        return new Promise(resolve => req.session.destroy(err => {
            res.clearCookie(COOKIE_NAME)
            if(err){
                console.log(err)
                resolve(false)
                return
            } 
            resolve(true)
        }))
    } 
}