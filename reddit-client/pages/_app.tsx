import React, { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { Provider, createClient } from 'urql'
import Layout from "../src/components/Layout"
import { Spin } from "antd"
import "../styles/globals.scss"

const client = createClient({ 
    url: "http://localhost:4000/graphql",
    fetchOptions: {
        credentials: 'include'
    }
})

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
      <Provider value={client}>
        <Layout>
            {pageLoading ? (
                <div className="spinner"><Spin size="large" /></div>
            ) : (
                <Component {...pageProps} />
            )}
        </Layout>
    </Provider>
  )
}

export default MyApp
