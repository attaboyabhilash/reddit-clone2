import { Card, Tooltip } from "antd"
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
                        <ArrowUpOutlined onClick={() => vote({ value: 1, postId: post._id })} />,
                        post.points,
                        <ArrowDownOutlined onClick={() => vote({ value: -1, postId: post._id })} /> 
                    ]}
                    hoverable
                >
                    {
                      post.title.length > 27 ?
                        <Tooltip title={post.title} placement="right" color={"#001529"}>
                          <h3>{post.title.slice(0, 27.5) + "..."}</h3>
                        </Tooltip>
                        :
                        <h3>{post.title}</h3>
                    }
                    <div className={styles.meta_data}>
                      <div className={styles.raw}>
                        <small>{post.creator.username}</small>
                        <span></span>
                        <small>{dayjs(new Date(parseInt(post.createdAt)).toLocaleDateString()).fromNow()}</small>
                      </div>
                      <p className={styles.description}>
                        {post.textSnippet + " ..."}
                      </p>
                    </div>
                              
            </Card>
        );
}

export default RedditCard