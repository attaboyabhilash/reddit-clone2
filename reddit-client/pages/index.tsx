import { useState } from "react"
import { usePostsQuery } from '../src/generated/graphql'
import { Card, Spin, Button, Tooltip } from "antd"
import styles from '../styles/Home.module.scss'
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../src/utils/createUrqlClient';
import Layout from '../src/components/Layout';
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const index = () => {
  dayjs.extend(relativeTime)
  const [variables, setVariables] = useState({limit: 10, cursor: null as null | string})
  const [{data, fetching}] = usePostsQuery({
    variables: variables
  })
  if(!fetching && !data) {
    return <h1>Something went wrong!</h1>
  }

  return (
      <Layout>
        <div className={styles.container}>
          <h1>Posts</h1>
          <div className={styles.posts}>
            {!data && fetching ? 
              <div className={styles.spinner}>
                <Spin size="large" />              
              </div> 
            : data.posts.posts.map(post => {
              return (
                    <Card 
                      className={styles.card}
                      key={post._id} 
                      style={{width: "300px"}}
                      actions={[
                        <ArrowUpOutlined />,
                        0,
                        <ArrowDownOutlined />
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
              )
            })}
          </div>
          <div className={styles.footer}>
            {data && data.posts.posts.length > 0 && data.posts.hasMore ? (
              <div className={styles.flexer}>
                <div></div>
                <Button className={styles.read_more} onClick={() => setVariables({
                  limit: variables.limit, 
                  cursor: data.posts.posts[data.posts.posts.length - 1].createdAt 
                })}>
                  Load More
                </Button>
              </div>
            ) : <p className={styles.footer_para}>--No More Posts to show--</p>}
          </div>
        </div>
      </Layout>
  )
}

export default withUrqlClient(createUrqlClient, {ssr: true})(index)

