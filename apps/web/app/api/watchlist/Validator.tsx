import { z } from "zod";

export const createWatchlistSchema = z.object({
    userID: z.string(),
    watchlistName: z.string(),
});

// Declare a type for the schema
export type CreateWatchlistType = z.infer<typeof createWatchlistSchema>;