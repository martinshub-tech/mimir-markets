import { NextResponse } from "next/server";

import { apiError } from "@/lib/api/errors";
import { getVsFeedSnapshot } from "@/lib/server/vs-index";
import { VS_CACHE_HEADERS } from "@/lib/server/vs-cache";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const refreshValue = searchParams.get("refresh");
    if (refreshValue && refreshValue !== "1") {
      const err = apiError("invalid_request", "refresh must be 1 when provided", { field: "refresh" });
      return NextResponse.json(err.body, { status: err.status, headers: err.headers });
    }

    const shouldRefresh = refreshValue === "1";
    const { items, cache } = await getVsFeedSnapshot({ forceRefresh: shouldRefresh });

    return NextResponse.json(
      {
        items,
        count: items.length,
        cache,
      },
      {
        headers: VS_CACHE_HEADERS,
      }
    );
  } catch {
    const err = apiError("internal_error", "Unable to load VS feed");
    return NextResponse.json(err.body, { status: err.status, headers: err.headers });
  }
}
