// Initialize an instance of `FirebaseServerApp`.
// Retrieve your own options values by adding a web app on
// https://console.firebase.google.com
import { initializeServerApp } from "firebase/app";
import { getAuth, User } from "firebase/auth";
import { headers } from "next/headers";

import { firebaseConfig } from "@/libs/firebase/configs";

export const firebaseServerIdToken = async () => {
  const headersList = await headers();
  const idToken = headersList.get("authorization")?.split(" ")[1];
  return { idToken, headersList };
};

export const firebaseServerApp = async () => {
  const { idToken, headersList } = await firebaseServerIdToken();

  return initializeServerApp(firebaseConfig, {
    authIdToken: idToken,
    appCheckToken: idToken,
    releaseOnDeref: headersList,
  });
};

export const firebaseServerUser = async (): Promise<User | null> => {
  const serverApp = await firebaseServerApp();
  const auth = getAuth(serverApp);
  await auth.authStateReady();

  if (auth.currentUser) {
    return auth.currentUser.toJSON() as User;
  } else {
    return null;
  }
};
