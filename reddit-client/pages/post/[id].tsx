import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import {Spin, Empty, Card, Button} from 'antd'
import { useDeletePostMutation, useMeQuery, usePostQuery } from "../../src/generated/graphql";
import { createUrqlClient } from "../../src/utils/createUrqlClient";
import Layout from "../../src/components/Layout";
import styles from '../../styles/Post.module.scss'
import { DeleteOutlined, EditFilled } from '@ant-design/icons'


const post: React.FC<{}> = ({}) => {
    const router = useRouter() 
    const intId = typeof router.query.id === 'string' ? parseInt(router.query.id) : -1
    const [{data, fetching}] = usePostQuery({
        pause: intId === -1,
        variables: {
            _id: intId
        }
    })

    const [{ data: meData }] = useMeQuery()

    const [, deletePost] = useDeletePostMutation()

    const handleDelete = () => {
        deletePost({_id: data.post._id})
        router.replace("/")
    }

    if(fetching) {
        return (
            <Layout>
                <div className={styles.spinner}>
                    <Spin size="large"/>
                </div>
            </Layout>
        )
    }

    if(!data?.post) {
        return (
            <Layout>
                <div className={styles.spinner}>
                    <Empty
                        description={
                        <span className={styles.no_data}>
                            No Data Found!
                        </span>
                        }
                    />
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className={styles.container}>
                <Card hoverable 
                    className={styles.card}
                    actions={[
                        <Button className={styles.edit_btn} icon={<EditFilled />} onClick={() => router.replace(`/post/edit/${intId}`)}>Edit</Button>
                    ]}
                >
                    <div className={styles.flexer}>
                        <h2>{data.post.title}</h2>
                        {meData?.me?._id === data.post._id ? <Button type="primary" icon={<DeleteOutlined />} danger onClick={handleDelete}/> : <></>}
                    </div>
                    <p>{data.post.text}</p>
                </Card>
            </div>
        </Layout>
    );
}

export default withUrqlClient(createUrqlClient, { ssr: true })(post)