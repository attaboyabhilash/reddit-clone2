import { useRouter } from "next/router"
import React, { useRef, useState } from 'react';
import styles from "../../../styles/Post.module.scss"
import { Card, Form, Input, Button, Spin, Empty } from "antd"
import { FormInstance } from 'antd/lib/form';
import Layout from "../../../src/components/Layout"
import { createUrqlClient } from "../../../src/utils/createUrqlClient";
import { withUrqlClient } from "next-urql";
import { usePostQuery, useUpdatePostMutation } from "../../../src/generated/graphql";

const EditPost = () => {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const intId = typeof router.query.id === 'string' ? parseInt(router.query.id) : -1
    const [{data, fetching}] = usePostQuery({
        pause: intId === -1,
        variables: {
            _id: intId
        }
    })

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

    const formRef = useRef<FormInstance>();

    const [, updatePost] = useUpdatePostMutation()

    const onFinish = async ( values: { title: string, text: string } ) => {
        setIsLoading(true)
        console.log("Values", values)
        const newTitle = values.title !== "" && values.title !== undefined ? values.title : data.post.title
        const newText = values.text !== "" && values.text !== undefined ? values.title : data.post.text
        await updatePost({ _id: intId, title: newTitle, text: newText })
        setIsLoading(false)
        router.push(`/post/${intId}`)
    };

    return (
        <Layout>
            <div className={styles.container}>
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

export default withUrqlClient(createUrqlClient, { ssr: true })(EditPost)