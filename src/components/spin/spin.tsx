"use client";

import { LoaderCircle } from "lucide-react";
import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface Props {
  show?: boolean;
  loading: boolean;
  children?: ReactNode;
  className?: string;
}

export function Spin(props: Readonly<Props>) {
  const { show = true, loading, children, className } = props;
  return (
    <main className={cn("relative h-full w-full", className)}>
      {loading ? (
        <>
          {show ? children : null}

          <div className="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-white/25">
            <LoaderCircle className="animate-spin" size={24} />
          </div>
        </>
      ) : (
        children
      )}
    </main>
  );
}
