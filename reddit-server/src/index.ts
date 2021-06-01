import 'reflect-metadata'
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


const main = async () => {
    const conn = await createConnection({
        type: 'postgres',
        database: 'lireddit2',
        username: 'postgres',
        password: 'Krishnabhiya9@',
        logging: true,
        synchronize: true,
        migrations: [path.join(__dirname, './migrations/*')],
        entities: [Post, User]
    })

    //await conn.runMigrations()

    //await Post.delete({})

    const app = express()

    const RedisStore = connectRedis(session)
    const redis = new Redis()

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
            secret: 'qwewedfvfgnghmytdfvsddfaf',
            resave: false,
        })
    )

    const apolloServer = new ApolloServer({ 
        schema: await buildSchema({
            resolvers: [PostResolvers, UserResolvers],
            validate: false
        }),
        context: ({req, res}): MyContext => ({ req, res, redis })
    });

    apolloServer.applyMiddleware({ app, cors: false})

    app.listen(4000, () => {
        console.log("server started on localhost:4000")
    })
}

main().catch(err => console.error(err))


