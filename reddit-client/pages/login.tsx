import React, { useRef, useState } from 'react'
import { Form, Input, Button, Card, Alert, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd/lib/form';
import Link from 'next/link';
import styles from "../styles/Login.module.scss"
import { Exact, useLoginMutation } from '../src/generated/graphql';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../src/utils/createUrqlClient';
import Layout from '../src/components/Layout';


const Login: React.FC<{}> = ( { } ) => {
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState([])
  const formRef = useRef<FormInstance>();
  const router = useRouter()

  const [, login] = useLoginMutation()

  const onFinish = async ( values: Exact<{ usernameOrEmail: string; password: string; }> ) => {
    setIsLoading(true)
    //console.log( 'Received values of form: ', values )
    const response = await login(values)
    if(response.data?.login.errors) {
      setServerError(response.data.login.errors)
    } else if (response.data?.login.user) {
      router.push("/")
    }
    setIsLoading(false)
    formRef.current!.resetFields()
  };


  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>Login</h1>
        <Card hoverable className={styles.login}>
          <Form
            name="login-form"
            layout="vertical"
            ref={formRef}
            onFinish={onFinish}
            scrollToFirstError
          >
            <Form.Item
              label="Username/Email"
              name="usernameOrEmail"
              rules={[
                {
                  required: true,
                  message: 'Please input your Username/Email!',
                }
              ]}
            >
              <Input prefix={<UserOutlined className={styles.icon} />} placeholder="johndoe or john@example.com" />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[
                  { 
                    required: true, 
                    message: 'Please input your Password!' 
                  }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className={styles.icon} />}
                type="password"
                placeholder="test123#"
              />
            </Form.Item>

            {serverError[0] !== "" ? serverError.map(err => {
                return <Alert key={err.field} message={err.message} type="error" showIcon closable className={styles.alertBox} />
            }) : null }

            <Form.Item>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Remember me</Checkbox>
              </Form.Item>

              <Link href="/forgot_password">
                <a className={styles.remember}>
                  Forgot password
                </a>
              </Link>
            </Form.Item>

            <Form.Item className={styles.footer}>
              <Button type="primary" htmlType="submit" className={styles.login_button} loading={isLoading}>
                Login
              </Button>
              <p className={styles.footer_text}>Not a member yet? Click <Link href="/register"><a>here</a></Link> to register</p>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </Layout>
  );
}

export default withUrqlClient(createUrqlClient)(Login)