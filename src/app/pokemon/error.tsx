"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void; }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="w-[1200px] mx-auto flex flex-col justify-center items-center my-9">
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}