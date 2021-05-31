import { Field, InputType } from "type-graphql";

// import sendEmail from "src/utils/sendEmail";
@InputType()
export class UsernamePasswordInput {
    @Field()
    email: string;
    @Field()
    username: string;
    @Field()
    password: string;
}
