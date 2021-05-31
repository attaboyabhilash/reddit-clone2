import { usePostsQuery } from '../src/generated/graphql'
import { Card } from "antd"
import Layout from "../src/components/Layout"
import styles from '../styles/Home.module.scss'
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../src/utils/createUrqlClient';

const index = () => {
  const { Meta } = Card;
  const [{data}] = usePostsQuery()
  return (
    <Layout>
      <div className={styles.container}>
        <h1>Posts</h1>
        {!data ? <p>Loading...</p> : data.posts.map(post => {
          return (
                <Card 
                  key={post._id} 
                  style={{width: "300px"}}
                  actions={[
                    <p>{post.createdAt}</p>
                  ]}
                  hoverable
                >
                  <Meta
                    title={post.title}
                  />
                </Card>
          )
        })}
      </div>
    </Layout>
  )
}

export default withUrqlClient(createUrqlClient, {ssr: true})(index)
