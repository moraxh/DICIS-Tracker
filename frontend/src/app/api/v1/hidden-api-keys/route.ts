import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      error: "Unauthorized access detected",
      message:
        "Seriously? Are you trying to sniff the traffic of an open-source project? 😂",
      hint: "The repo is public, just go read the code!",
      github: "https://github.com/moraxh/dicis-tracker",
    },
    {
      status: 418, // 418 I'm a teapot (classic easter egg status code)
      headers: {
        "X-Easter-Egg": "You found me!",
      },
    },
  );
}
