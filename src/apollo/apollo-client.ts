import { ApolloClient, InMemoryCache } from "@apollo/experimental-nextjs-app-support";
import { ApolloLink, from } from "@apollo/client";

import { httpLink } from "@/apollo/links/http-link";
import { multipartLink } from "@/apollo/links/SSR-multipart-link";

// have a function to create a client for you
export const makeClient = () => {
  let links: ApolloLink;

  if (typeof window === "undefined") {
    links = from([multipartLink, httpLink]);
  } else {
    links = httpLink;
  }

  // use the `ApolloClient` from "@apollo/experimental-nextjs-app-support"
  return new ApolloClient({
    // use the `InMemoryCache` from "@apollo/experimental-nextjs-app-support"
    cache: new InMemoryCache(),
    link: links,
  });
};
