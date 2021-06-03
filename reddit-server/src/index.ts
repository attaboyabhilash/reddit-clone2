import 'reflect-metadata'
import 'dotenv-safe/config'
import express from "express"
import { ApolloServer } from "apollo-server-express"
import { buildSchema } from "type-graphql"
import { PostResolvers } from "./resolvers/post"
import { UserResolvers } from "./resolvers/user"
import Redis from 'ioredis'
import session from 'express-session'
import connectRedis from 'connect-redis'
import { COOKIE_NAME, __prod__ } from "./constants"
import { MyContext } from "./types"
import cors from 'cors'
import { createConnection } from 'typeorm'
import { User } from "./entities/User"
import { Post } from "./entities/Post"
import path from "path"
import { UpVote } from './entities/UpVote'
import { createUserLoader } from './utils/createUserLoader'
import { createUpvoteLoader } from './utils/createUpvoteLoader'


const main = async () => {
    const conn = await createConnection({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        logging: true,
        synchronize: true,
        migrations: [path.join(__dirname, './migrations/*')],
        entities: [Post, User, UpVote]
    })

    //await conn.runMigrations()

    // await Post.delete({})

    const app = express()

    const RedisStore = connectRedis(session)
    const redis = new Redis(process.env.REDIS_URL)

    app.use (cors({
        origin: 'http://localhost:3000',
        credentials: true
    }))
    
    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({ 
                client: redis,
                disableTouch: true 
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
                httpOnly: true,
                sameSite: 'lax',
                secure: __prod__
            },
            saveUninitialized: false,
            secret: String(process.env.SECRET),
            resave: false,
        })
    )

    const apolloServer = new ApolloServer({ 
        schema: await buildSchema({
            resolvers: [PostResolvers, UserResolvers],
            validate: false
        }),
        context: ({req, res}): MyContext => ({ 
            req, 
            res, 
            redis, 
            userLoader: createUserLoader(),
            upvoteLoader: createUpvoteLoader() 
        })
    });

    apolloServer.applyMiddleware({ app, cors: false})

    app.listen(Number(process.env.PORT), () => {
        console.log(`server started on localhost:${process.env.PORT}`)
    })
}

main().catch(err => console.error(err))


