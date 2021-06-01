import { Post } from "../entities/Post";
import { Arg, Ctx, Field, FieldResolver, InputType, Int, Mutation, ObjectType, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { MyContext } from "../types";
import isAuth from "../middleware/isAuth";
import { getConnection } from "typeorm";


@InputType()
class PostInput {
    @Field()
    title: string
    @Field()
    text: string
}

@ObjectType()
class PaginatedPosts {
    @Field(() => [Post])
    posts: Post[]
    @Field()
    hasMore: boolean
}

@Resolver(Post)
export class PostResolvers {

    @FieldResolver(() => String) 
    textSnippet(
        @Root() root: Post
    ){
        return root.text.slice(0, 60)
    }


    @Query( () => PaginatedPosts) 
    async posts(
        @Arg('limit', () => Int) limit: number,
        @Arg('cursor', () => String, { nullable: true }) cursor: string | null
    ): Promise<PaginatedPosts> {
        const realLimit = Math.min(50, limit)
        const realLimitPlusOne = realLimit + 1
        const qb = getConnection()
                    .getRepository(Post)
                    .createQueryBuilder("post")
                    .orderBy('"createdAt"', 'DESC')
                    .take(realLimitPlusOne)
        if(cursor) {
            qb.where('"createdAt" < :cursor', { cursor: new Date(parseInt(cursor)) })
        }

        const posts = await qb.getMany()

        return { posts: posts.slice(0, realLimit), hasMore: posts.length === realLimitPlusOne }
    }

    @Query( () => Post, { nullable: true }) 
    post( 
        @Arg('_id') _id: number
    ): Promise<Post | undefined> {
        return Post.findOne(_id)
    }

    @Mutation( () => Post)
    @UseMiddleware(isAuth) 
    async createPost( 
        @Arg('input') input: PostInput,
        @Ctx() {req}: MyContext
    ): Promise<Post> {
        return Post.create({
            ...input,
            creatorId: req.session.userId 
        }).save()
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