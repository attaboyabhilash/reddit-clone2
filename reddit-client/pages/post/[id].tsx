import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import {Spin, Empty, Card, Button, message} from 'antd'
import { useDeletePostMutation, useMeQuery, usePostQuery } from "../../src/generated/graphql";
import { createUrqlClient } from "../../src/utils/createUrqlClient";
import Layout from "../../src/components/Layout";
import styles from '../../styles/Post.module.scss'
import { DeleteOutlined, EditFilled, ArrowLeftOutlined } from '@ant-design/icons'
import Link from "next/link"


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

    const handleDelete = async () => {
        const {error} = await deletePost({_id: data.post._id})
        if(error) {
            message.error("Post could not be deleted! Try again")
        } else {
            message.success("Post deleted successfully!")
        }
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
                <div className={styles.backLink}><Link href="/"><a><ArrowLeftOutlined /> back</a></Link></div>
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
                <div className={styles.backLink}><Link href="/"><a><ArrowLeftOutlined /> back</a></Link></div>
                <Card hoverable 
                    className={styles.card}
                    actions={meData?.me?._id === data.post.creatorId ? [
                        <Button className={styles.edit_btn} icon={<EditFilled />} onClick={() => router.replace(`/post/edit/${intId}`)}>Edit</Button>
                    ] : []}
                >
                    <div className={styles.flexer}>
                        <h2>{data.post.title}</h2>
                        {meData?.me?._id === data.post.creatorId ? <Button type="primary" icon={<DeleteOutlined />} danger onClick={handleDelete}/> : <></>}
                    </div>
                    <p>{data.post.text}</p>
                </Card>
            </div>
        </Layout>
    );
}

export default withUrqlClient(createUrqlClient, { ssr: true })(post)