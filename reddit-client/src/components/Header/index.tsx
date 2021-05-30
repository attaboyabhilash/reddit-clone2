import React from 'react'
import { Layout, Menu } from 'antd';
import Link from 'next/link';
import styles from "./Header.module.scss"
import { useRouter } from 'next/router';

interface headerProps {

}

const Header: React.FC<headerProps> = ({}) => {
    const { Header } = Layout;
    const router = useRouter()
    return (
        <Header className={styles.header}>
            <Link href="/"><a><h1 className={styles.title}>Reddit Clone</h1></a></Link>
            <Menu theme="dark" mode="horizontal" defaultSelectedKeys={router.pathname === "/" ? ['1'] : router.pathname === "/login" ? ['2'] : router.pathname === "/register" ? ['3'] : ['']}>
                <Menu.Item key="1"><Link href="/"><a>Home</a></Link></Menu.Item>
                <Menu.Item key="2"><Link href="/login"><a>LogIn</a></Link></Menu.Item>
                <Menu.Item key="3"><Link href="/register"><a>SignUp</a></Link></Menu.Item>
            </Menu>
        </Header>
    );
}

export default Header