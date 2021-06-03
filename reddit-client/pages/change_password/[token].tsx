import { NextPage } from "next"
import React, { useRef, useState } from 'react'
import { Form, Input, Button, Card, Alert } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { useRouter } from 'next/router';
import { LockOutlined } from '@ant-design/icons';
import styles from "../../styles/ChangePassword.module.scss"
import { MeDocument, MeQuery, useChangePasswordMutation } from "../../src/generated/graphql";
import { withApollo } from "../../src/utils/withApollo";


const ChangePassword: NextPage = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [serverError, setServerError] = useState([])
    const router = useRouter()
    const formRef = useRef<FormInstance>();
    const [changePassword] = useChangePasswordMutation()

    const onFinish = async ( values: any ) => {
        setIsLoading(true)
        //console.log( 'Received values of form: ', values.newPassword )
        const response = await changePassword({ variables: { 
            newPassword: values.newPassword, 
            token: typeof router.query.token === 'string' ?  router.query.token : "" },
            update: (cache, {data}) => {
                cache.writeQuery<MeQuery>({
                    query: MeDocument,
                    data: {
                        __typename: 'Query',
                        me: data?.changePassword.user
                    }
                })
            }  
        })
        if(response.data?.changePassword.errors) {
            setServerError(response.data.changePassword.errors)
        } else if (response.data?.changePassword.user) {
            router.push("/")
        }
        setIsLoading(false)
        formRef.current!.resetFields()
    };

        return (
            <div className={styles.container}>
            <h1 className={styles.title}>Reset Your Password</h1>
            <Card hoverable className={styles.password}>
                <Form
                    name="password-form"
                    layout="vertical"
                    ref={formRef}
                    onFinish={onFinish}
                    scrollToFirstError
                >    
                    <Form.Item
                        label="New Password"
                        name="newPassword"
                        rules={[() => ({
                            validator(_, value) {
                            if (value.search(/[a-z]/i) < 0) {
                                return Promise.reject(new Error("Password must contain at least one letter."));
                            }
                            if (value.search(/[0-9]/) < 0) {
                                return Promise.reject(new Error("Password must contain at least one digit.")); 
                            }
                            if (value.search(/[!#@$%^&*]/) < 0) {
                                return Promise.reject(new Error("Password must contain at least one special character.")); 
                            }
                            if (value.length < 6) {
                                return Promise.reject(new Error('Password must be greater than 6 characters')); 
                            }
                            return Promise.resolve();
                            },
                        }),
                        { required: true, message: 'Please input your new Password!' }]}
                        hasFeedback
                    >
                        <Input
                            prefix={<LockOutlined className={styles.icon} />}
                            type="password"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Confirm New Password"
                        name="confirmPassword"
                        dependencies={['newPassword']}
                        rules={[({ getFieldValue }) => ({
                            validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('The passwords that you entered do not match!'));
                            },
                        }),
                        { required: true, message: 'Please confirm your new Password!' }]}
                        hasFeedback
                    >
                        <Input
                            prefix={<LockOutlined className={styles.icon} />}    
                        />
                    </Form.Item>

                    {serverError[0] !== "" ? serverError.map(err => {
                        return <Alert key={err.field} message={err.message} type="error" showIcon closable className={styles.alertBox} />
                    }) : null }

                    <Form.Item className={styles.footer}>
                        <Button type="primary" htmlType="submit" className={styles.password_button} loading={isLoading}>
                            Reset Password
                        </Button>
                    </Form.Item>
                    </Form>
                </Card>
            </div>
        );
}

export default withApollo({ ssr: false })(ChangePassword)