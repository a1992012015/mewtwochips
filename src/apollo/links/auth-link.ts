import { setContext } from "@apollo/client/link/context";

export const authLink = setContext(async (_, { headers }) => {
  console.log(
    "=========> apollo authLink => ",
    typeof window === "undefined" ? "server" : "client",
  );

  return { headers: { ...headers } };
});
