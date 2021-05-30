import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Resolver } from "type-graphql";
import { MyContext } from "src/types";
import { User } from "../entities/User";
import argon2 from "argon2"

@InputType()
class UsernamePasswordInput {
    @Field()
    username: string
    @Field()
    password: string
}

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
    @Mutation(() => UserResponse) 
    async register(
        @Arg('options') options: UsernamePasswordInput, 
        @Ctx() { em, req }: MyContext): Promise<UserResponse> {
        if(options.username.length <= 3) {
            return {
                errors: [{
                    field: 'username',
                    message: 'username must be greater than 3 characters'
                }]
            }
        }
        if(options.password.length <= 3) {
            return {
                errors: [{
                    field: 'password',
                    message: 'password must be greater than 3 characters'
                }]
            }
        }
        const hashedPassword = await argon2.hash(options.password)
        const user = em.create(User, {username: options.username, password: hashedPassword})
        try {
           await em.persistAndFlush(user) 
        } catch (error) {
            if(error.code === '23505' || error.detail.includes('already exists')) {
                return {
                    errors: [{
                        field: 'username',
                        message: 'username already exists'
                    }]
                }
            }   
        }

        req.session.userId = user._id 

        return {user}
    }

    @Mutation(() => UserResponse) 
    async login(
        @Arg('options') options: UsernamePasswordInput, 
        @Ctx() { em, req }: MyContext): Promise<UserResponse> {
        const user = await em.findOne(User, {username: options.username})
        if(!user) {
            return {
                errors: [{
                    field: 'username',
                    message: 'username does not exist'
                }]
            }
        }
        const valid = await argon2.verify(user.password, options.password)
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
}