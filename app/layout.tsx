import { Roboto } from "next/font/google";
import { ReactNode } from "react";

import "./globals.css";
import Header from "@/app/components/header/header";
import ReduxProvider from "@/providers/redux.provider";
import { ApolloWrapper } from "@/providers/apollo.provider";
import FirebaseProvider from "@/providers/firebase.provider";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  fallback: ["Helvetica", "Arial", "sans-serif"]
});

export const metadata = {
  title: "Next Learn App",
  description: "Generated by create next app"
};

interface ILayoutProps {
  children: ReactNode;
  modal: ReactNode;
}

export default function RootLayout({ children, modal }: ILayoutProps) {
  console.log("Root Layout");
  return (
    <html lang="en">
    <body className={roboto.className}>
    <ReduxProvider>
      <ApolloWrapper>
        <FirebaseProvider>
          <div className="min-h-screen relative">
            <Header/>
            <div className="overflow-hidden">
              {children}
              {modal}
            </div>
          </div>
        </FirebaseProvider>
      </ApolloWrapper>
    </ReduxProvider>
    </body>
    </html>
  );
}
