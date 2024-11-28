"use client";

import { EmailAuthProvider, linkWithCredential } from "firebase/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { z } from "zod";

import { EProviderID } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { firebaseAuth } from "@/firebase/firebase";
import { EmailForm, formSchema } from "@/components/auth/email-form";
import { checkFirebaseProvider } from "@/lib/check-firebase-provider";

export default function Page() {
  const router = useRouter();

  const linkEmailHandle = (values: z.infer<typeof formSchema>) => {
    const credential = EmailAuthProvider.credential(values.email, values.password);

    linkWithCredential(firebaseAuth.currentUser!, credential)
      .then((userCred) => {
        const user = userCred.user;
        toast.success(user.displayName, { description: "Account linking success." });
        router.push("/");
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  return (
    <div className="page-content flex h-full items-center justify-center">
      {checkFirebaseProvider(EProviderID.EMAIL) ? (
        <div className="flex flex-col items-center gap-4">
          <p>Linked with email and password.</p>

          <Link href="/public">
            <Button>Back to home</Button>
          </Link>
        </div>
      ) : (
        <EmailForm text="Link with email and password" callback={linkEmailHandle} />
      )}
    </div>
  );
}
