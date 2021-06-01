import { usePostsQuery } from '../src/generated/graphql'
import { Card } from "antd"
import styles from '../styles/Home.module.scss'
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../src/utils/createUrqlClient';
import Layout from '../src/components/Layout';

const index = () => {
  const { Meta } = Card;
  const [{data}] = usePostsQuery()
  return (
      <Layout>
        <div className={styles.container2}>
          <h1>Posts</h1>
          {!data ? <p>Loading...</p> : data.posts.map(post => {
            return (
                  <Card 
                    key={post._id} 
                    style={{width: "300px"}}
                    actions={[
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>,
                      <span>{new Date(post.updatedAt).toLocaleDateString()}</span>
                    ]}
                    hoverable
                  >
                    <Meta
                      title={post.title}
                      description={post.text}
                    />
                  </Card>
            )
          })}
        </div>
      </Layout>
  )
}

export default withUrqlClient(createUrqlClient, {ssr: true})(index)
