"use client";

import { forwardRef, HTMLAttributes, ReactNode, Ref, useState } from "react";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { LoaderCircle } from "lucide-react";
import { Slot } from "@radix-ui/react-slot";
import { createPortal } from "react-dom";

import { cn } from "@/common/utils";

export type SpinProps = {
  size?: number;
  loading?: boolean;
  children?: ReactNode;
} & HTMLAttributes<HTMLElement>;

export const Spin = forwardRef<HTMLElement, Readonly<SpinProps>>(function SpinRef(props, ref) {
  const { children } = props;

  if (children) {
    return <WithChildren {...props} ref={ref} />;
  } else {
    return <OutChildren {...props} ref={ref as Ref<HTMLDivElement>} />;
  }
});

const WithChildren = forwardRef<HTMLElement, Readonly<SpinProps>>(
  function WithChildren(props, ref) {
    const { size = 30, className, loading = false, children, ...other } = props;

    const [container, setContainer] = useState<HTMLElement | null>(null);

    const show = !!container && loading;

    return (
      <>
        <Slot {...other} ref={composeRefs(ref, setContainer)} className={cn("relative", className)}>
          {children}
        </Slot>

        {show &&
          createPortal(
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <LoaderCircle className="animate-spin" size={size} />
            </div>,
            container,
          )}
      </>
    );
  },
);

const OutChildren = forwardRef<HTMLDivElement, Readonly<SpinProps>>(
  function OutChildren(props, ref) {
    const { size = 30, className, loading = false } = props;

    if (loading) {
      return (
        <div
          ref={ref}
          className={cn("fixed inset-0 flex items-center justify-center bg-black/50", className)}
        >
          <LoaderCircle className="animate-spin" size={size} />
        </div>
      );
    } else {
      return null;
    }
  },
);
