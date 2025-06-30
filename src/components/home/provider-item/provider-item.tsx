"use client";

import { ReactNode, useCallback } from "react";
import { unlink } from "firebase/auth";
import { toast } from "sonner";
import Link from "next/link";

import { useT } from "@/libs/i18n/client";
import { Button } from "@/components/ui/button";
import { EProviderID, providers } from "@/types/auth";
import { firebaseAuth } from "@/libs/firebase/firebase-client";
import { checkFirebaseProvider } from "@/common/check-firebase-provider";

interface IProps {
  providerId: EProviderID;
  icon: ReactNode;
}

export function ProviderItem(props: IProps) {
  const { icon, providerId } = props;

  const { t } = useT("home");

  const unlinkProviderHandle = useCallback(() => {
    unlink(firebaseAuth.currentUser!, providerId).then(
      () => {
        // Auth provider unlinked from account
        toast("Unlink success.");
      },
      (error) => {
        // An error happened
        toast.error("Unlink error.", { description: error.messages });
      },
    );
  }, [providerId]);

  const name = providers.get(providerId);

  if (!name) {
    return null;
  }

  if (checkFirebaseProvider(providerId)) {
    return (
      <Button variant="destructive" onClick={unlinkProviderHandle} className="flex-1">
        {icon} {t("unlink", { ns: "home" })}
      </Button>
    );
  } else {
    return (
      <Link className="flex-1" href={`/auth/(protected)/link/${name}`}>
        <Button className="w-full">
          {icon} {t("link", { ns: "home" })}
        </Button>
      </Link>
    );
  }
}
