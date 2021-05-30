import { useContext } from "react"
import Header from "../Header"
import styles from "./Layout.module.scss"

interface layoutProps {

}

const Layout: React.FC<layoutProps> = (props: any) => {
    
    return (
        <>
            <Header />
            <div className={styles.layout}>{props.children}</div>
        </>
    )
}

export default Layout

