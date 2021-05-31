import { Arg, Ctx, Field, Mutation, ObjectType, Resolver, Query } from "type-graphql";
import { MyContext } from "src/types";
import { User } from "../entities/User";
import argon2 from "argon2"
import { COOKIE_NAME } from "../constants";
import { UsernamePasswordInput } from "../utils/UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
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

@Resolver()
export class UserResolvers {

    // @Mutation(() => Boolean)
    // async forgotPassword(
    //     @Arg('email') email: string,
    //     @Ctx() {em}: MyContext
    // ) {
    //     //const user = await em.findOne(User, {})
    //     return true
    // }

    @Query(() => User, { nullable: true })
    me(@Ctx() { em, req }: MyContext) {
        // you are not logged in
        if (!req.session.userId) {
            return null;
        }

        return em.findOne(User, { _id: req.session.userId })
    }

    @Mutation(() => UserResponse) 
    async register(
        @Arg('options') options: UsernamePasswordInput, 
        @Ctx() { em, req }: MyContext): Promise<UserResponse> {
        
        const errors = validateRegister(options)

        if(errors) {
            return {errors}
        }
        
        const hashedPassword = await argon2.hash(options.password)
        const user = em.create(User, {username: options.username, email: options.email, password: hashedPassword})
        try {
           await em.persistAndFlush(user) 
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
        @Ctx() { em, req }: MyContext): Promise<UserResponse> {
        const user = await em.findOne(User, usernameOrEmail.includes('@') ? {email: usernameOrEmail} : {username: usernameOrEmail})
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