import { useState } from "react"
import { usePostsQuery } from '../src/generated/graphql'
import { Card, Spin, Button } from "antd"
import styles from '../styles/Home.module.scss'
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../src/utils/createUrqlClient';
import Layout from '../src/components/Layout';

const index = () => {
  const { Meta } = Card;
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
            : data.posts.map(post => {
              return (
                    <Card 
                      className={styles.card}
                      key={post._id} 
                      style={{width: "300px"}}
                      actions={[
                        <span className={styles.action}>{`Published - ${new Date(post.createdAt).toLocaleDateString()}`}</span>
                      ]}
                      hoverable
                    >
                      <Meta
                        title={post.title}
                        description={post.textSnippet + "..."}
                      />
                    </Card>
              )
            })}
          </div>
          {data ? (
            <div className={styles.footer}>
              <div></div>
              <Button className={styles.read_more} onClick={() => setVariables({
                limit: variables.limit, 
                cursor: data.posts[data.posts.length - 1].createdAt 
              })}>
                Load More
              </Button>
            </div>
          ) : null}
        </div>
      </Layout>
  )
}

export default withUrqlClient(createUrqlClient, {ssr: true})(index)
