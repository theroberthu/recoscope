import { cache } from "react";
import { getPublicSitemapRuns } from "./queries";
import { publicWatchVideos } from "./video-watch.mjs";

// The same published/public database gate applies to pages and their metadata.
// A failed read propagates rather than exposing an unchecked registry entry.
export const getWatchVideos = cache(async () => publicWatchVideos(await getPublicSitemapRuns()));
