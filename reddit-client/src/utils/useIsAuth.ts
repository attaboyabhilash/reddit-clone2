import { useRouter } from 'next/router';
import { useEffect } from "react"
import { useMeQuery } from '../generated/graphql';

export const useIsAuth = () => {
    const router = useRouter()
    const [{data, fetching}] = useMeQuery()

    useEffect(() => {
        if(!fetching && !data?.me){
            router.replace("/login")
        }
    }, [data, fetching, router])
}