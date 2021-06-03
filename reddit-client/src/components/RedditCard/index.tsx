import { Card, Tooltip } from "antd"
import Link from "next/link"
import styles from "./RedditCard.module.scss"
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useUpVoteMutation, PostsQuery, PostFragmentFragment, UpVoteMutation } from "../../generated/graphql"
import dayjs from "dayjs"
import gql from 'graphql-tag'
import relativeTime from "dayjs/plugin/relativeTime"
import { ApolloCache } from "@apollo/client";

interface Post {
    post: PostsQuery['posts']['posts'][0]
}

const updateAfterVote = (value: number, postId: number, cache: ApolloCache<UpVoteMutation>) => {
    const data = cache.readFragment<PostFragmentFragment>({
      id: 'Post:' + postId,
      fragment: gql`
          fragment _ on Post {
              _id
              points
              voteStatus
          }
      `
    })

    if(data) {
        if(data.voteStatus === value) {
            return
        }
        const newPoints = data.points + ((!data.voteStatus ? 1 : 2) * value)
        cache.writeFragment({
            id: 'Post:' + postId,
            fragment: gql`
                fragment __ on Post {
                    points
                    voteStatus
                }
            `,
            data: { points: newPoints, voteStatus: value }
        })
    }
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
                            onClick={async () => {
                              if(post.voteStatus === 1) {
                                return
                              }
                              await vote({ 
                                    variables: {value: 1, postId: post._id}, 
                                    update: (cache) => updateAfterVote(1, post._id, cache)
                              })
                          }}
                        >
                          <ArrowUpOutlined style={post.voteStatus === 1 ? {color: "#27ae60"}: {}} />  
                        </div>,
                        post.points,
                        <div className={styles.downVote}
                            onClick={async () => {
                              if(post.voteStatus === -1) {
                                return
                              }
                              await vote({ 
                                variables: {value: -1, postId: post._id},
                                update: (cache) => updateAfterVote(-1, post._id, cache)
                              })
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