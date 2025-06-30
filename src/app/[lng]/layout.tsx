import { Analytics } from "@vercel/analytics/react";
import localFont from "next/font/local";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { dir } from "i18next";

import { LngParams } from "@/types/lng-params";
import { languages } from "@/libs/i18n/settings";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/libs/firebase/auth-provider";
import { ThemeProvider } from "@/components/home/theme-provider";
import { ApolloProvider } from "@/components/home/apollo-provider";
import { firebaseServerUser } from "@/libs/firebase/firebase-server";

import "./globals.css";

const geistSans = localFont({
  src: "../../libs/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "../../libs/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const metadata: Metadata = {
  title: "Mewtwochips",
  description: "A site for lovers of Pokémon and chips",
};

interface IProps extends LngParams {
  modal: ReactNode;
  children: ReactNode;
}

export default async function RootLayout({ children, modal, params }: Readonly<IProps>) {
  const { lng } = await params;

  const user = await firebaseServerUser();

  console.log("Root user", !!user);

  return (
    <html
      lang={lng}
      dir={dir(lng)}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          enableSystem={true}
          defaultTheme="system"
          disableTransitionOnChange
        >
          <AuthProvider user={user}>
            <ApolloProvider>
              <div className="h-screen w-screen">
                {children}
                {modal}
              </div>
            </ApolloProvider>
          </AuthProvider>
        </ThemeProvider>

        <Analytics />
        <Toaster />
      </body>
    </html>
  );
}
