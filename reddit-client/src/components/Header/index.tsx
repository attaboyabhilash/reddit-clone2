import React from 'react'
import { Layout, Menu, Dropdown, Avatar, Button } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from "next/router"
import styles from "./Header.module.scss"
import { useLogoutMutation, useMeQuery } from '../../generated/graphql';
import { isServer } from '../../utils/isServer';
import { useApolloClient } from "@apollo/client"
import router from 'next/router';

interface headerProps {

}

const Header: React.FC<headerProps> = ({}) => {
    const { Header } = Layout;
    const router = useRouter()
    const [logout, {loading}] = useLogoutMutation()
    const { data } = useMeQuery({
        skip: isServer()
    })

    const apolloClient = useApolloClient()

    const logoutPageChange = async () => {
        await logout()
        await apolloClient.resetStore()
        router.replace("/login")
    }
    const menu = (
        <Menu>
            <Menu.Item key="1">
                Your Profile
            </Menu.Item>
            <Menu.Item key="2">
                <Link href="/create_post"><a>Create New Post</a></Link>
            </Menu.Item>
            <Menu.Item key="3">
                <Button loading={loading} type="primary" size="small" danger onClick={() => logoutPageChange()}>Logout</Button>
            </Menu.Item>
        </Menu>
    );

    return (
        <Header className={styles.header}>
            <Link href="/"><a><h1 className={styles.title}>Reddit Clone</h1></a></Link>
            <Menu theme="dark" mode="horizontal">
                {
                    !data?.me ?
                            <>
                                <Menu.Item key="1"><Link href="/login"><a>LogIn</a></Link></Menu.Item>
                                <Menu.Item key="2"><Link href="/register"><a>Register</a></Link></Menu.Item>    
                            </>
                        :   <Dropdown overlay={menu} placement="bottomCenter" arrow>  
                                <div className={styles.loggedIn}>
                                    <Avatar style={{ backgroundColor: "#1890ff", verticalAlign: 'middle' }} size="large">
                                        {data.me.username[0].toUpperCase()}
                                    </Avatar>
                                    <div className={styles.username}>{data.me.username}</div>
                                    <CaretDownOutlined />
                                </div>
                            </Dropdown>
                }
            </Menu>
        </Header>
    );
}

export default Header