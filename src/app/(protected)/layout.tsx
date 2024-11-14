import { ReactNode } from "react";

import { RouteGuard } from "@/components/route-guard";
import { Navigation } from "@/components/home/navigation";

interface IProps {
  children: ReactNode;
}

export default function Layout({ children }: Readonly<IProps>) {
  return (
    <RouteGuard>
      <Navigation />

      {children}
    </RouteGuard>
  );
}
