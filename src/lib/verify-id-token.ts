import { NextResponse } from "next/server";
import { auth } from "firebase-admin";
import { Session } from "next-auth";

import { Maybe } from "@/types/maybe";
import { firebaseAdmin } from "@/firebase/firebase-admin";

import DecodedIdToken = auth.DecodedIdToken;

type VerifyCallback = (decoded: DecodedIdToken) => Response | Promise<Response>;

export const verifyIdToken = async (auth: Maybe<Session>, callback: VerifyCallback) => {
  try {
    const decoded = await firebaseAdmin.auth().verifyIdToken(auth?.user.idToken ?? "");

    console.log("<========= verifyIdToken decoded user", decoded.name);

    return await callback(decoded);
  } catch (e) {
    console.warn(e);
    return NextResponse.json(
      {
        code: 401,
        success: false,
        message: "Unauthorized",
        data: null,
      },
      { status: 401 },
    );
  }
};
