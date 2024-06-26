import { cookies } from "next/headers";

import { FIREBASE_SESSION } from "@/context/constant";
import { adminAuth } from "@/context/firebase/server/firebaseAdmin";
import { LoginProvider, UserProfile } from "@/app/[lng]/features/libs";

export default async function Page() {
  const decodedIdToken = await getUser();
  console.log("home page decodedIdToken => ", decodedIdToken);
  return (
    <main className="flex h-full flex-col items-center justify-center">
      {decodedIdToken ? <UserProfile session={decodedIdToken} /> : <LoginProvider />}
    </main>
  );
}

const getUser = async () => {
  const sessionCookie = cookies().get(FIREBASE_SESSION)?.value;
  if (sessionCookie) {
    return await adminAuth().verifySessionCookie(sessionCookie);
  } else {
    return undefined;
  }
};
