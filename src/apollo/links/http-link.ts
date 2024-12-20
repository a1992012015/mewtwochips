import { HttpLink } from "@apollo/client";

import { env } from "@/env";

export const httpLink = new HttpLink({
  // this needs to be an absolute url, as relative urls cannot be used in SSR
  uri: `${env.NEXT_PUBLIC_BASE_URL}/api/graphql`,
  // you can disable result caching here if you want to
  // (this does not work if you are rendering your page with `export const dynamic = "force-static"`)
  // fetchOptions: { cache: "no-store" },
  // you can override the default `fetchOptions` on a per query basis
  // via the `context` property on the options passed as a second argument
  // to an Apollo Client data fetching hook, e.g.:
  // const { data } = useSuspenseQuery(MY_QUERY, { context: { fetchOptions: { cache: "force-cache" }}});
});
