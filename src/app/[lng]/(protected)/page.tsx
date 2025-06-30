import { getT } from "@/libs/i18n";
import { UserAvatar } from "@/components/home/user-avatar";
import { UserActions } from "@/components/home/user-actions";
import { LinkProviders } from "@/components/home/link-providers";
import { firebaseServerUser } from "@/libs/firebase/firebase-server";

export default async function HomePage() {
  const { t } = await getT("home");

  const user = await firebaseServerUser();

  console.log("user", user);

  return (
    <div className="page-content flex h-full items-center justify-center">
      <div className="flex flex-col justify-center gap-4">
        <div className="flex items-center gap-4">
          <div className="flex justify-center">
            <UserAvatar className="h-24 w-24" user={user} />
          </div>

          <div className="grid w-96 grid-cols-[auto_1fr] gap-2">
            <div className="contents">
              <p>{t("username", { ns: "home" })}:</p>
              <p>{user?.displayName}</p>
            </div>

            <div className="contents">
              <p>{t("email", { ns: "home" })}:</p>
              <p>{user?.email}</p>
            </div>

            <div className="contents">
              <p>{t("email-verified", { ns: "home" })}:</p>
              <p>{user?.emailVerified ? "true" : "false"}</p>
            </div>

            <div className="contents">
              <p>{t("access-token", { ns: "home" })}:</p>
              <p className="truncate">{user?.uid}</p>
            </div>
          </div>
        </div>

        <UserActions />

        <LinkProviders />
      </div>
    </div>
  );
}
