import { Post } from "../entities/Post";
import { Arg, Ctx, Field, FieldResolver, InputType, Int, Mutation, ObjectType, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { MyContext } from "../types";
import isAuth from "../middleware/isAuth";
import { getConnection } from "typeorm";
import { UpVote } from "../entities/UpVote";

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

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async vote(
        @Arg('postId', () => Int) postId: number,
        @Arg('value', () => Int) value: number,
        @Ctx() {req}: MyContext  
    ) {
        const isUpvote = value !== -1
        const newValue = isUpvote ? 1 : -1
        const { userId } = req.session

        const vote = await UpVote.findOne({where: {postId, userId}})

        if(vote && vote.value !== newValue) {
            await getConnection().transaction(async tm => {
                await tm.query(`
                    update "up_vote"
                    set value = $1
                    where "postId" = $2 and "userId" = $3
                `, [newValue, postId, userId])

                await tm.query(`
                    update post
                    set points = points + $1
                    where _id = $2;
                `, [2 * newValue, postId])
            })
        } else if (!vote) {
            await getConnection().transaction(async tm => {
                await tm.query(`
                    insert into "up_vote" ("userId", "postId", value)
                    values ($1, $2, $3);
                `, [userId, postId, newValue])

                await tm.query(`
                    update post
                    set points = points + $1
                    where _id = $2;
                `, [newValue, postId])
            })
        }

        return true
    }

    @Query( () => PaginatedPosts) 
    async posts(
        @Arg('limit', () => Int) limit: number,
        @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
        @Ctx() {req}: MyContext
    ): Promise<PaginatedPosts> {

        const { userId } = req.session
        const realLimit = Math.min(50, limit)
        const realLimitPlusOne = realLimit + 1

        const replacements: any[] = [realLimitPlusOne]

        if(userId) {
            replacements.push(userId)
        }
        
        let cursorIndex = 3

        if(cursor) {
            replacements.push(new Date(parseInt(cursor)))
            cursorIndex = replacements.length
        }
        
        const posts = await getConnection().query(`
            select p.* ,
            json_build_object(
                '_id', u._id,
                'username', u.username,
                'email', u.email
            ) creator
            ${userId ? ',(select value from "up_vote" where "userId" = $2 and "postId" = p._id) "voteStatus"' : 'null as "voteStatus"'}
            from post p
            inner join public.user u on u._id = p."creatorId"
            ${cursor ? `where p."createdAt" < $${cursorIndex}` : ''}
            order by p."createdAt" DESC
            limit $1
        `, replacements)

        return { posts: posts.slice(0, realLimit), hasMore: posts.length === realLimitPlusOne }
    }

    @Query(() => Post, { nullable: true }) 
    post( 
        @Arg('_id', () => Int) _id: number
    ): Promise<Post | undefined> {
        return Post.findOne(_id, {relations: ['creator']})
    }

    @Mutation(() => Post)
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
    @UseMiddleware(isAuth)
    async updatePost( 
        @Arg('_id', () => Int) _id: number,
        @Arg('title') title: string,
        @Arg('text') text: string,
        @Ctx() {req}: MyContext 
    ): Promise<Post | null> {
        const { userId } = req.session
        
        const post = await getConnection()
                            .createQueryBuilder()
                            .update(Post)
                            .set({title, text})
                            .where('_id = :_id and "creatorId" = :creatorId', {_id, creatorId: userId})
                            .returning('*')
                            .execute()
        
        return post.raw[0]
    }

    @Mutation(() => Boolean) 
    @UseMiddleware(isAuth)
    async deletePost( 
        @Arg('_id', () => Int) _id: number,
        @Ctx() {req}: MyContext 
    ): Promise<boolean> {
        const { userId } = req.session
        const post = await Post.delete({ _id, creatorId: userId })
        
        if(!post) {
            return false
        }

        return true
    }
}