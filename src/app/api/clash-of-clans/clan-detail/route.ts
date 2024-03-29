import { NextResponse } from "next/server";

import { apiFetchRequest } from "@/context/apiFetchRequest";
import { IClanDetail, IClanError } from "@/types/clashOfClans";
import { env } from "../../../../../env.mjs";

export async function POST(request: Request) {
  console.log("request clash of clans POST: /clan-detail");
  const { tag } = await request.json();
  console.log("tag", tag);

  return apiFetchRequest<IClanDetail | IClanError>(
    `https://api.clashofclans.com/v1/clans/${encodeURIComponent(tag)}`,
    { headers: { Authorization: `Bearer ${env.CLASH_OF_CLANS_API_TOKEN}` } },
  ).then((clan) => {
    if (clan.hasOwnProperty("reason")) {
      switch ((clan as IClanError).reason) {
        case "accessDenied.invalidIp":
          return NextResponse.json({
            code: 200,
            success: false,
            message: (clan as IClanError).message,
            data: null,
          });
        default:
          return NextResponse.json({ code: 200, success: false, message: "not error", data: null });
      }
    } else {
      return NextResponse.json({
        code: 200,
        success: true,
        message: "success",
        data: clan as IClanDetail,
      });
    }
  });
}
