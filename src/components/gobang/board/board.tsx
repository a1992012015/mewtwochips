"use client";

import { MouseEvent, useCallback, useMemo, useRef, useState } from "react";
import { createSelector } from "reselect";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { GobangBoard } from "@/components/svgs";
import { RootState } from "@/redux-store/store";
import { EPiece } from "@/types/gobang/role.type";
import { move, playGame } from "@/redux-store/reducer";
import { calculatePoint, piecePoint } from "@/lib/calculate-point";
import { useAppDispatch, useAppSelector } from "@/redux-store/hooks";

export function Board() {
  const boardRef = useRef<SVGSVGElement>(null);
  const [{ x, y }, setPoint] = useState({ x: 7, y: 7 });

  const dispatch = useAppDispatch();

  const { board, player, loading, winPath } = useAppSelector(
    createSelector([(s: RootState) => s.gobang], (gobang) => ({
      loading: gobang.loading,
      winPath: gobang.winPath,
      player: gobang.player,
      board: gobang.board,
    })),
  );

  const isControl = useMemo(() => {
    return !loading && player !== EPiece.EMPTY;
  }, [loading, player]);

  const mouseMoveHandle = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      if (isControl && boardRef.current) {
        const { x: segmentX, y: segmentY } = calculatePoint(e, boardRef.current);
        setPoint((s) => {
          const { x, y } = s;
          const newX = piecePoint(segmentX);
          const newY = piecePoint(segmentY);
          if (x !== newX || y !== newY) {
            return { x: newX, y: newY };
          } else {
            return s;
          }
        });
      }
    },
    [isControl],
  );

  const clickHandle = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      if (isControl) {
        if (player === EPiece.EMPTY) {
          toast.warning("Don't start.");
        } else {
          if (boardRef.current) {
            const { x: segmentX, y: segmentY } = calculatePoint(e, boardRef.current);
            if (board.some(([x, y]) => x === segmentX && y === segmentY)) {
              toast.warning("Have pieces.");
            } else {
              console.log([segmentX, segmentY, player]);
              dispatch(move([segmentX, segmentY, player]));
              dispatch(playGame({ position: [segmentX, segmentY] }));
            }
          }
        }
      }
    },
    [board, dispatch, isControl, player],
  );

  return (
    <div className="relative mx-auto w-full max-w-[800px] border bg-white p-2">
      <div className="absolute left-0 top-0 h-full w-full">
        <GobangBoard
          ref={boardRef}
          onClick={clickHandle}
          onMouseMove={mouseMoveHandle}
          className="group absolute left-0 top-0 h-full w-full"
        >
          {/*定义渐变*/}
          <defs>
            {/*白色棋子的渐变效果*/}
            <radialGradient id="whiteGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#f0f0f0" />
              <stop offset="100%" stopColor="#d9d9d9" />
            </radialGradient>

            {/*黑色棋子的渐变效果*/}
            <radialGradient id="blackGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#4d4d4d" />
              <stop offset="70%" stopColor="#000000" />
              <stop offset="100%" stopColor="#1a1a1a" />
            </radialGradient>
          </defs>

          <circle
            className={cn("hidden", { "group-hover:inline": isControl })}
            cx={x}
            cy={y}
            r="10"
            fill="none"
            stroke="red"
            strokeWidth="3"
          />

          {winPath.map(([x, y], index) => {
            return (
              <circle
                key={index}
                cx={piecePoint(x)}
                cy={piecePoint(y)}
                r="10"
                fill="none"
                stroke="black"
                strokeWidth="10"
              >
                <animate attributeName="r" from="5" to="11" dur="1s" repeatCount="indefinite" />
                <animate
                  attributeName="opacity"
                  from="1"
                  to="0"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>
            );
          })}

          {board.map(([x, y, p]) => {
            return (
              <circle
                key={`board-piece-${x}-${y}`}
                cx={piecePoint(x)}
                cy={piecePoint(y)}
                r="10"
                fill={p === EPiece.WHITE ? "url(#whiteGradient)" : "url(#blackGradient)"}
              />
            );
          })}
        </GobangBoard>
      </div>

      <div className="pt-[100%]" />
    </div>
  );
}
