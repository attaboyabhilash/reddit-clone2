import DataLoader from "dataloader"
import { UpVote } from "../entities/UpVote"

export const createUpvoteLoader = () => 
    new DataLoader<{postId: number, userId: number}, UpVote | null>(async keys => {
        const upvotes = await UpVote.findByIds(keys as any)
        const upvoteIdsToUpvote: Record<string, UpVote> = {}
        upvotes.forEach(upvote => {
            upvoteIdsToUpvote[`${upvote.userId} | ${upvote.postId}`] = upvote
        }) 

        return keys.map(key => upvoteIdsToUpvote[`${key.userId} | ${key.postId}`])
    })
