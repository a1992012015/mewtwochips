import Image from "next/image";
import Link from "next/link";

import { getPhotoList } from "@/services/data.service";
import PageHeader from "@/app/components/page-header/page-header";

export default async function Photos() {
  console.log("Photos");
  const photos = await getPhotoList();
  return (
    <main className="w-[1200px] mx-auto bg-white mt-5">
      {/* @ts-expect-error Server Component */}
      <PageHeader pageTitle="Photos" backRoute="/"/>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 auto-rows-max	 gap-6 m-10">
        {photos.map(({ id, imageSrc }) => (
          <Link key={id} href={`/photos/${id}`}>
            <Image alt="photo" src={imageSrc} height={500} width={500} className="w-full object-cover aspect-square"/>
          </Link>
        ))}
      </div>
    </main>
  );
}
