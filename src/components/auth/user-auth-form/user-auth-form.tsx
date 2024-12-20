import { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";
import { SignInEmail } from "@/components/auth/sign-in-email";
import { SignInGoogle } from "@/components/auth/sign-in-google";
import { SignInGithub } from "@/components/auth/sign-in-github";

interface IProps extends HTMLAttributes<HTMLDivElement> {
  a?: string;
}

export function UserAuthForm({ className, ...props }: Readonly<IProps>) {
  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <div className="mx-auto text-sm">
        <SignInEmail />
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <SignInGoogle />

      <SignInGithub />
    </div>
  );
}
