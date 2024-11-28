import { frameStore, generateFrameId } from "@/app/frames/store";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { title } = await request.json();

  if (!title || title.length > 20) {
    return NextResponse.json({ error: "Invalid title" }, { status: 400 });
  }

  const frameId = generateFrameId();
  frameStore.set(frameId, title);

  return NextResponse.json({ frameId });
}
