import React, { useRef, useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { useCreatePostMutation } from '../src/generated/graphql';
import { useRouter } from 'next/router';
import styles from "../styles/CreatePost.module.scss";
import Layout from '../src/components/Layout';
import { useIsAuth } from '../src/utils/useIsAuth';
import { withApollo } from '../src/utils/withApollo';


const CreatePost: React.FC<{}> = ({}) => {
    const [isLoading, setIsLoading] = useState(false)
    const [createPost] = useCreatePostMutation()
    const formRef = useRef<FormInstance>();
    const router = useRouter()
    
    useIsAuth()

    const onFinish = async ( values: { title: string; text: string; } ) => {
        setIsLoading(true)
        //console.log( 'Received values of form: ', values )
        const response = await createPost({
            variables: {input: values},
            update: (cache) => {
                cache.evict({fieldName: "posts:{}"})
            }
        }) 
        if(!response.errors) {
            setIsLoading(false)
            message.success("Post has been created successfully!")
            router.push("/")    
        }
    };
        return (
            <Layout>
                <div className={styles.container}>
                    <h1 className={styles.title}>Create A New Post</h1>
                    <Card hoverable className={styles.create}>
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
                                rules={[
                                {
                                    required: true,
                                    message: 'Please input your title!',
                                }
                                ]}
                            >
                                <Input placeholder="Title" />
                            </Form.Item>
                            <Form.Item
                                label="Description"
                                name="text"
                                rules={[
                                {
                                    required: true,
                                    message: 'Please input your description!',
                                }
                                ]}
                            >
                                <Input.TextArea rows={4} placeholder="Description" />
                            </Form.Item>


                            <Form.Item className={styles.footer}>
                                <Button type="primary" htmlType="submit" className={styles.create_button} loading={isLoading}>
                                    Create Post
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </div>
            </Layout>
        );
}


export default withApollo({ ssr: false })(CreatePost)