/// <reference lib="webworker" />
import { FirebaseOptions, getApps, initializeApp } from "firebase/app";
import { precacheAndRoute } from "workbox-precaching";
import { getAuth } from "firebase/auth";

declare const self: ServiceWorkerGlobalScope;
declare const clients: Clients;

export const initFirebaseSw = () => {
  precacheAndRoute(self.__WB_MANIFEST);

  const CUSTOM_HEADER_KEY = "x-from-sw";

  const firebaseConfig: FirebaseOptions = {
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  };

  const firebaseApp = getApps()[0] ?? initializeApp(firebaseConfig, `mewtwochips`);
  const firebaseAuth = getAuth(firebaseApp);

  /**
   * Returns a promise that resolves with an ID token if available.
   * @return {void} The promise that resolves with an ID token if available. Otherwise, the promise resolves with null.
   */
  const getIdToken = (): Promise<string | null> => {
    return new Promise((resolve) => {
      try {
        const unsubscribe = firebaseAuth.onIdTokenChanged((user) => {
          unsubscribe();

          if (user) {
            user?.getIdToken().then((idToken) => {
              resolve(idToken);
            });
          } else {
            resolve(null);
          }
        });
      } catch {
        resolve(null);
      }
    });
  };

  /**
   * @param {string} url The URL whose origin is to be returned.
   * @return {string} The origin corresponding to given URL.
   */
  const getOriginFromUrl = (url: string): string => {
    // https://stackoverflow.com/questions/1420881/how-to-extract-base-url-from-a-string-in-javascript
    const pathArray = url.split("/");
    const protocol = pathArray[0];
    const host = pathArray[2];
    return `${protocol}//${host}`;
  };

  /**
   * For same origin https requests, append idToken to header.
   */
  const checkOriginHttps = async (event: FetchEvent) => {
    if (
      location.origin === getOriginFromUrl(event.request.url) &&
      (location.protocol === "https:" || location.hostname === "localhost") &&
      !event.request.headers.get(CUSTOM_HEADER_KEY)
    ) {
      return await getIdToken();
    } else {
      return "";
    }
  };

  self.addEventListener("fetch", (event) => {
    const requestProcessor = async () => {
      let req = event.request;

      const idToken = await checkOriginHttps(event);

      // // For same origin https requests, append idToken to header.
      if (idToken) {
        // Clone headers as request headers are immutable.
        const headers = new Headers(req.headers);
        // Add ID token to header. We can't add to Authentication header as it
        // will break HTTP basic authentication.
        headers.append("Authorization", `Bearer ${idToken}`);
        headers.append(CUSTOM_HEADER_KEY, "firebase-auth");

        // const body = await getBodyContent(req);

        req = new Request(req, { headers: headers, mode: "same-origin" });
      }

      return fetch(req);
    };
    // Try to fetch the resource first after checking for the ID token.
    event.respondWith(requestProcessor());
  });

  self.addEventListener("activate", (event) => {
    event.waitUntil(clients.claim());
  });
};
