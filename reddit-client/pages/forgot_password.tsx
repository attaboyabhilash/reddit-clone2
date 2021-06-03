import React, { useRef, useState } from 'react'
import { Form, Input, Button, Card, Result } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd/lib/form';
import styles from "../styles/Login.module.scss"
import { Exact, useForgotPasswordMutation } from '../src/generated/graphql';
import { useRouter } from 'next/router';
import Layout from "../src/components/Layout"
import { withApollo } from '../src/utils/withApollo';


const ForgotPassword: React.FC<{}> = ({}) => {
        const [isLoading, setIsLoading] = useState(false)
        const [isCompleted, setIsCompleted] = useState(false)
        const [email, setEmail] = useState("")
        const formRef = useRef<FormInstance>();
        const router = useRouter()

        const [forgotPassword] = useForgotPasswordMutation()

        const onFinish = async ( values: Exact<{ email: string; }> ) => {
            setIsLoading(true)
            setEmail(values.email)
            await forgotPassword({variables: {email: values.email}})
            setIsCompleted(true)
            setIsLoading(false)
        };


        return (
            <Layout>
            <div className={styles.container}>
                <h1 className={styles.title}>Forgot Password?</h1>
                {
                    !isCompleted ?
                        <Card hoverable className={styles.login}>
                            <Form
                                name="reset-form"
                                layout="vertical"
                                ref={formRef}
                                onFinish={onFinish}
                                scrollToFirstError
                            >
                                <Form.Item
                                    label="Email"
                                    name="email"
                                    rules={[
                                        {
                                            type: 'email',
                                            message: 'Email address is invalid'
                                        },
                                        {
                                            required: true,
                                            message: 'Please input your Email!',
                                        }
                                    ]}
                                >
                                    <Input prefix={<MailOutlined className={styles.icon} />} placeholder="john@example.com" />
                                </Form.Item>

                                <Form.Item className={styles.footer}>
                                    <Button type="primary" htmlType="submit" className={styles.login_button} loading={isLoading}>
                                        Send Email
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Card>
                        :
                        <Card hoverable className={styles.result}>
                            <Result
                                status="success"
                                title="Email Sent Successfully!"
                                subTitle={`An email with reset password link has been sent to ${email}`}
                                extra={[
                                    <Button type="primary" key="login" onClick={() => router.push('/login')}>
                                        LogIn
                                    </Button>,
                                    <Button key="try" onClick={() => setIsCompleted(false)}>Try Again</Button>,
                                ]}
                            />
                        </Card>
                }
            </div>
            </Layout>
        );
}

export default withApollo({ ssr: false })(ForgotPassword)