import { Card, Tooltip, Button } from "antd"
import Link from "next/link"
import styles from "./RedditCard.module.scss"
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useUpVoteMutation, PostsQuery } from "../../generated/graphql"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

interface Post {
    post: PostsQuery['posts']['posts'][0]
}

const RedditCard: React.FC<Post> = ({ post }) => {
    dayjs.extend(relativeTime)
    const [, vote] = useUpVoteMutation()
        return (
            <Card 
                className={styles.card}
                    style={{width: "300px"}}
                    actions={[
                        <Button 
                          className={styles.upVote} 
                          style={post.voteStatus === 1 ? {borderColor: "#27ae60"}: {}}
                          icon={<ArrowUpOutlined style={post.voteStatus === 1 ? {color: "#27ae60"}: {}} />} 
                          onClick={() => {
                            if(post.voteStatus === 1) {
                              return
                            }
                            vote({ value: 1, postId: post._id })
                          }}
                        />,
                        post.points,
                        <Button 
                          className={styles.downVote}
                          style={post.voteStatus === -1 ? {borderColor: "#c0392b"} : {}}
                          icon={<ArrowDownOutlined style={post.voteStatus === -1 ? {color: "#c0392b"} : {}} />}
                          onClick={() => {
                            if(post.voteStatus === -1) {
                              return
                            }
                            vote({ value: -1, postId: post._id })
                          }}
                        /> 
                    ]}
                    hoverable
                >
                    {
                      post.title.length > 27 ?
                        <Tooltip title={post.title} placement="right" color={"#001529"}>
                          <Link href="/post/[id]" as={`/post/${post._id}`}><a><h3>{post.title.slice(0, 27.5) + "..."}</h3></a></Link>
                        </Tooltip>
                        :
                        <Link href="/post/[id]" as={`/post/${post._id}`}><a><h3>{post.title}</h3></a></Link>
                    }
                    <div className={styles.meta_data}>
                      <div className={styles.raw}>
                        <small>{post.creator.username}</small>
                        <span></span>
                        <small>{dayjs(new Date(parseInt(post.createdAt))).fromNow()}</small>
                      </div>
                      <p className={styles.description}>
                        {post.textSnippet + " ..."}
                      </p>
                    </div>
                              
            </Card>
        );
}

export default RedditCard