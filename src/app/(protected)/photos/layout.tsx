import { ReactNode } from "react";

export const metadata = {
  title: "Photo",
};

interface IProps {
  children: ReactNode;
}

export default function Layout({ children }: Readonly<IProps>) {
  return <div className="page-content relative">{children}</div>;
}
