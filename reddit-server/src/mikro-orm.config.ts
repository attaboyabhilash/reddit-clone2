import { MikroORM } from "@mikro-orm/core"
import path from "path";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { User } from "./entities/User";

export default {
    entities: [Post, User],
    dbName: 'lireddit',
    user: 'postgres',
    password: 'Krishnabhiya9@',
    type: 'postgresql',
    debug: !__prod__,
    migrations: {
        path: path.join(__dirname, '/migrations'),
        pattern: /^[\w-]+\d+\.[tj]s$/,  
    }
} as Parameters<typeof MikroORM.init>[0];