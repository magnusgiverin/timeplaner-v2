import { NextRequest, NextResponse } from "next/server";

// Temporary in-memory store
export const stateStore = new Map<string, {
  courses: string[];
  semester: string;
  state: Record<string, Record<string, boolean>>;
  alias: Record<string, string>;
}>();

function saveState(data: {
  courses: string[];
  semester: string;
  state: Record<string, Record<string, boolean>>;
  alias: Record<string, string>;
}) {
  const key = crypto.randomUUID();
  stateStore.set(key, data);

  // Optional: expire after 10 minutes
  setTimeout(() => stateStore.delete(key), 10 * 60 * 1000);

  return key;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { courses, semester, state, alias } = body;

    if (!courses || !semester) {
      return NextResponse.json(
        { error: "Missing courses or semester" },
        { status: 400 }
      );
    }

    const key = saveState({
      courses,
      semester,
      state: state || {},
      alias: alias || {},
    });

    return NextResponse.json({ key });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

// Optional: export GET to check keys (debug)
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });

  const data = stateStore.get(key);
  if (!data) return NextResponse.json({ error: "Invalid or expired key" }, { status: 404 });

  return NextResponse.json({ key, data });
}
