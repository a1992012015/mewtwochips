import { Suspense } from "react";

import { Spin } from "@/components/spin";
import { PageHeader } from "@/components/page-header";
import { baseFetchRequest } from "@/lib/fetch-request";
import { PokemonContent } from "@/app/(protected)/pokemon/libs/components";

export default function Pokemon() {
  const commentsPromise = baseFetchRequest<{
    count: number;
  }>("https://pokeapi.co/api/v2/pokemon?offset=0&limit=1");

  return (
    <div className="mx-auto flex w-[1200px] flex-col gap-4 py-4">
      <PageHeader pageTitle="Pokemon" backRoute="/" />

      <Suspense fallback={<Spin className="h-[840px]" loading={true} />}>
        <PokemonContent commentsPromise={commentsPromise} />
      </Suspense>
    </div>
  );
}
