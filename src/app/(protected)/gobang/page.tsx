import { Board } from "@/components/gobang/board";
import { Control } from "@/components/gobang/control";
import { PageHeader } from "@/components/page-header";
// import { GobangWorker } from "@/components/gobang/gobang-worker";

export const metadata = {
  title: "Gobang - 五子棋",
};

export default function Page() {
  return (
    <div className="page-content flex flex-col">
      <PageHeader pageTitle="Gobang" backRoute="/" />

      <div className="space-y-4 pt-4">
        <Board />

        <Control />
      </div>
    </div>
  );
}
