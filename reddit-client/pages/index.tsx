import { useState } from "react"
import { usePostsQuery } from '../src/generated/graphql'
import { Spin, Button } from "antd"
import styles from '../styles/Home.module.scss'
import Layout from '../src/components/Layout';
import RedditCard from '../src/components/RedditCard'

const index = () => {
  const [variables, setVariables] = useState({limit: 10, cursor: null as null | string})
  const {data, loading} = usePostsQuery({
    variables: variables
  })
  
  if(!loading && !data) {
    return <h1>Something went wrong!</h1>
  }

  return (
      <Layout>
        <div className={styles.container}>
          <h1>Posts</h1>
          <div className={styles.posts}>
            {!data && loading ? 
              <div className={styles.spinner}>
                <Spin size="large" />              
              </div> 
            : data.posts.posts.map(post => !post ? null : <RedditCard key={post._id} post={post} />)
            }
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

export default index

