"use client";

import { createSelector } from "reselect";

import { cn } from "@/lib/utils";
import { RootState } from "@/redux-store/store";
import { EPiece } from "@/types/gobang/role.type";
import { useAppSelector } from "@/redux-store/hooks";
import { ControlActions } from "@/components/gobang/control-actions";

export function Control() {
  const { player, winner, loading } = useAppSelector(
    createSelector([(s: RootState) => s.gobang], (gobang) => ({
      loading: gobang.loading,
      winner: gobang.winner,
      player: gobang.player,
    })),
  );

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn("text-sm text-foreground", { "animate-pulse": loading })}>
        {player === EPiece.BLACK
          ? "Your move."
          : player === EPiece.WHITE
            ? "The computer is thinking."
            : winner !== EPiece.NONE
              ? `${winner === EPiece.BLACK ? "Black" : "White"} is winner!!!`
              : "Please start the game."}
      </div>

      <ControlActions player={player} loading={loading} />
    </div>
  );
}
