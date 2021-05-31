import { Post } from "../entities/Post";
import { Arg, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolvers {
    @Query( () => [Post]) 
    posts(): Promise<Post[]> {
        return Post.find()
    }

    @Query( () => Post, { nullable: true }) 
    post( 
        @Arg('_id') _id: number
    ): Promise<Post | undefined> {
        return Post.findOne(_id)
    }

    @Mutation( () => Post) 
    async createPost( 
        @Arg('title') title: string,
    ): Promise<Post> {
        return Post.create({title}).save()
    }

    @Mutation( () => Post, { nullable: true }) 
    async updatePost( 
        @Arg('_id') _id: number,
        @Arg('title') title: string
    ): Promise<Post | null> {
        const post = await Post.findOne(_id)
        if(!post) {
            return null
        }
        if(typeof title !== undefined) {
            await Post.update({_id}, {title})
        }
        return post
    }

    @Mutation( () => Boolean) 
    async deletePost( 
        @Arg('_id') _id: number
    ): Promise<boolean> {
        const post = await Post.delete(_id)
        if(!post) {
            return false
        }
        return true
    }
}