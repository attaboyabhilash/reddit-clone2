import React, { useRef, useState } from 'react'
import { Form, Input, Button, Card, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd/lib/form';
import Link from 'next/link';
import styles from "../styles/Register.module.scss"
import { register } from '../src/types';
import { useLoginMutation } from '../src/generated/graphql';
import { useRouter } from 'next/router';


const Login: React.FC<{}> = ( { } ) => {
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState([])
  const formRef = useRef<FormInstance>();
  const router = useRouter()

  const [, login] = useLoginMutation()

  const onFinish = async ( values: register ) => {
    setIsLoading(true)
    //console.log( 'Received values of form: ', values )
    const response = await login({options: values})
    if(response.data?.login.errors) {
      setServerError(response.data.login.errors)
    } else if (response.data?.login.user) {
      router.push("/")
    }
    setIsLoading(false)
    formRef.current!.resetFields()
  };


  return (
    <>
      <h1 className={styles.title}>Login</h1>
      <Card hoverable className={styles.register}>
        <Form
        name="register"
        className="register-form"
        layout="vertical"
        ref={formRef}
        onFinish={onFinish}
        scrollToFirstError
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[
              {
                required: true,
                message: 'Please input your Username!',
              }
            ]}
          >
            <Input prefix={<UserOutlined className={styles.icon} />} placeholder="johndoe" />
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
          <Form.Item className={styles.footer}>
            <Button type="primary" htmlType="submit" className={styles.register_button} loading={isLoading}>
              Login
            </Button>
            <p className={styles.footer_text}>Not a member yet? Click <Link href="/register"><a>here</a></Link> to register</p>
          </Form.Item>
        </Form>
      </Card>
    </>
  );
}

export default Login