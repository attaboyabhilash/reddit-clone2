import { BaseEntity, Column, PrimaryColumn, Entity, ManyToOne } from "typeorm";
import { Post } from "./Post";
import { User } from "./User";


@Entity()
export class UpVote extends BaseEntity {
 
  @Column({ type: 'int' })
  value: number

  @PrimaryColumn()
  userId: number;

  @ManyToOne(() => User, user => user.upvotes)
  user: User

  @PrimaryColumn()
  postId: number;

  @ManyToOne(() => Post, post => post.upvotes)
  post: Post

}
