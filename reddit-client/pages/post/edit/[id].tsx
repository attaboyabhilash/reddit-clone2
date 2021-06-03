import { useRouter } from "next/router"
import Link from "next/link"
import React, { useRef, useState } from 'react';
import styles from "../../../styles/Post.module.scss"
import { Card, Form, Input, Button, Spin, Empty, message } from "antd"
import { FormInstance } from 'antd/lib/form';
import Layout from "../../../src/components/Layout"
import { ArrowLeftOutlined } from '@ant-design/icons'
import { usePostQuery, useUpdatePostMutation } from "../../../src/generated/graphql";

const EditPost = () => {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const intId = typeof router.query.id === 'string' ? parseInt(router.query.id) : -1
    const {data, loading} = usePostQuery({
        skip: intId === -1,
        variables: {
            _id: intId
        }
    })

    if(loading) {
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

    const formRef = useRef<FormInstance>();

    const [updatePost] = useUpdatePostMutation()

    const onFinish = async ( values: { title: string, text: string } ) => {
        setIsLoading(true)
        console.log("Values", values)
        const newTitle = values.title !== "" && values.title !== undefined ? values.title : data.post.title
        const newText = values.text !== "" && values.text !== undefined ? values.title : data.post.text
        await updatePost({variables: { _id: intId, title: newTitle, text: newText }})
        setIsLoading(false)
        if(newTitle !== data.post.title && newText !== data.post.text) {
            message.success("Post updated successfully!")
        }
        if(newTitle !== data.post.title && newText === data.post.text) {
            message.success("Title updated successfully!")
        }
        if(newTitle === data.post.title && newText !== data.post.text) {
            message.success("Description updated successfully!")
        }
        if(newTitle === data.post.title && newText === data.post.text) {
            message.warning("No Post Updated!")
        }
        router.replace(`/post/${intId}`)
    };

    return (
        <Layout>
            <div className={styles.container}>
                <div className={styles.backLink}><Link href={`/post/${intId}`}><a><ArrowLeftOutlined /> back</a></Link></div>
                <Card className={styles.card} hoverable>
                    <Form
                        name="create-post-form"
                        layout="vertical"
                        ref={formRef}
                        onFinish={onFinish}
                        scrollToFirstError
                    >
                        <Form.Item
                            label="Title"
                            name="title"
                        >
                            <Input placeholder="Title" defaultValue={data.post.title} />
                        </Form.Item>
                        <Form.Item
                            label="Description"
                            name="text"
                        >
                            <Input.TextArea rows={4} placeholder="Description" defaultValue={data.post.text} />
                        </Form.Item>


                        <Form.Item className={styles.footer}>
                            <Button type="primary" htmlType="submit" className={styles.create_button} loading={isLoading}>
                                Update Post
                            </Button>
                        </Form.Item>
                        </Form>
                </Card>
            </div>
        </Layout>
    );
}

export default EditPost