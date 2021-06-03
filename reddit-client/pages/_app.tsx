import React, { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { Spin } from "antd"
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client"
import "../styles/globals.scss"

const client = new ApolloClient({
    uri: "http://localhost:4000/graphql",
    cache: new InMemoryCache(),
    credentials: 'include'
    
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
        pageLoading ? (
            <div className="spinner"><Spin size="large" /></div>
        ) : (
            <ApolloProvider client={client}>
                <Component {...pageProps} />
            </ApolloProvider>
        )
  )
}

export default MyApp
