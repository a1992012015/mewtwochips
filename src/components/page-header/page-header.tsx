import { Maybe } from "@/types/maybe";
import { BackRoute } from "./back-route/back-route";

interface IPageHeaderProps {
  pageTitle: Maybe<string>;
  backRoute: string;
}

export function PageHeader({ pageTitle, backRoute }: IPageHeaderProps) {
  return (
    <div className="relative flex items-center gap-3">
      <BackRoute href={backRoute} />

      <div className="flex-1">{pageTitle}</div>
    </div>
  );
}
