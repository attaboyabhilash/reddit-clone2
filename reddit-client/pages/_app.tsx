import React, { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Layout from "../src/components/Layout"
import { Spin } from "antd"
import "../styles/globals.scss"

function MyApp({ Component, pageProps }) {
  const router = useRouter()
  const [pageLoading, setPageLoading] = useState(false)

  useEffect(() => {
        const handleStart = () => {
            setPageLoading(true)
        }
        const handleComplete = () => {
            setPageLoading(false)
        }

        router.events.on("routeChangeStart", handleStart)
        router.events.on("routeChangeComplete", handleComplete)
        router.events.on("routeChangeError", handleComplete)
    }, [router])


  return (
        pageLoading ? (
            <div className="spinner"><Spin size="large" /></div>
        ) : (
            <Component {...pageProps} />
        )
  )
}

export default MyApp
