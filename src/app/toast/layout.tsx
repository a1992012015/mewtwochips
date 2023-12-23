"use client";

import { ReactNode } from "react";

import { Toasts } from "@/app/toast/Toast";

interface Props {
  children: ReactNode;
}

export default function ToastLayout({ children }: Props) {
  return <Toasts>{children}</Toasts>;
}
