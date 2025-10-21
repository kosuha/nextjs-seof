import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { buildingQuerySchema } from "@/lib/data/filters";
import { fetchBuildings } from "@/lib/data/buildings";

class InvalidRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidRequestError";
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  try {
    const params = buildingQuerySchema.parse({
      sort: url.searchParams.get("sort") ?? undefined,
      search: url.searchParams.get("q") ?? undefined,
      limit: parseIntegerParam(url.searchParams.get("limit"), "limit"),
      offset: parseIntegerParam(url.searchParams.get("offset"), "offset"),
    });

    const { items, count, hasMore, nextOffset } = await fetchBuildings(params);

    return NextResponse.json({
      items,
      totalCount: count,
      hasMore,
      nextOffset: hasMore ? nextOffset : null,
      params,
    });
  } catch (error) {
    if (error instanceof InvalidRequestError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.flatten() },
        { status: 400 },
      );
    }

    console.error("Failed to load buildings", error);
    return NextResponse.json({ error: "Failed to load buildings" }, { status: 500 });
  }
}

function parseIntegerParam(value: string | null, key: string) {
  if (value === null) {
    return undefined;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  const parsed = Number(trimmed);

  if (!Number.isInteger(parsed)) {
    throw new InvalidRequestError(`"${key}" must be an integer value.`);
  }

  return parsed;
}
