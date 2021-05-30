import React, { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { Provider, createClient, dedupExchange, fetchExchange } from 'urql'
import Layout from "../src/components/Layout"
import { Spin } from "antd"
import "../styles/globals.scss"
import { Cache, cacheExchange, QueryInput } from "@urql/exchange-graphcache"
import { LoginMutation, LogoutMutation, MeDocument, MeQuery, RegisterMutation } from "../src/generated/graphql"

function betterUpdateQuery<Result, Query> (
    cache: Cache, 
    qi: QueryInput, 
    result: any, 
    fn: (r: Result, q: Query) => Query) {
        return cache.updateQuery(qi, data => fn(result, data as any) as any)
}   

const client = createClient({ 
    url: "http://localhost:4000/graphql",
    fetchOptions: {
        credentials: 'include'
    },
    exchanges: [dedupExchange, cacheExchange({
        updates: {
            Mutation: {
                logout: (_result, args, cache, info) => {
                    betterUpdateQuery<LogoutMutation, MeQuery>(
                        cache,
                        {query: MeDocument},
                        _result,
                        () => ({me: null})
                    )
                },
                login: (_result, args, cache, info) => {
                    betterUpdateQuery<LoginMutation, MeQuery>(
                        cache, 
                        {query: MeDocument}, 
                        _result, 
                        (result, query) => {
                            if(result.login.errors) {
                                return query
                            } else {
                                return {
                                    me: result.login.user
                                }
                            }
                        }
                    )
                },
                register: (_result, args, cache, info) => {
                    betterUpdateQuery<RegisterMutation, MeQuery>(
                        cache, 
                        {query: MeDocument}, 
                        _result, 
                        (result, query) => {
                            if(result.register.errors) {
                                return query
                            } else {
                                return {
                                    me: result.register.user
                                }
                            }
                        }
                    )
                }
            }
        }
    }), fetchExchange]
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
