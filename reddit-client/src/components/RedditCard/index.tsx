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
    const [vote] = useUpVoteMutation()
        return (
            <Card 
                className={styles.card}
                    style={{width: "300px"}}
                    actions={[
                        <div className={styles.upVote} 
                            onClick={() => {
                              if(post.voteStatus === 1) {
                                return
                              }
                              vote({ variables: {value: 1, postId: post._id} })
                          }}
                        >
                          <ArrowUpOutlined style={post.voteStatus === 1 ? {color: "#27ae60"}: {}} />  
                        </div>,
                        post.points,
                        <div className={styles.downVote}
                            onClick={() => {
                              if(post.voteStatus === -1) {
                                return
                              }
                              vote({ variables: {value: -1, postId: post._id} })
                            }}
                        >
                          <ArrowDownOutlined style={post.voteStatus === -1 ? {color: "#c0392b"} : {}} />
                        </div>
                    ]}
                    hoverable
                >
                    {
                      post.title.length > 27 ?
                        <Link href="/post/[id]" as={`/post/${post._id}`}>
                          <a>
                            <Tooltip title={post.title} placement="right" color={"#001529"}>
                              <h3>{post.title.slice(0, 27.5) + "..."}</h3>
                            </Tooltip>
                          </a>
                        </Link>
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