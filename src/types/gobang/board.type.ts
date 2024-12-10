import { z } from "zod";

import { EPiece } from "@/types/gobang/role.type";

export const PointSchema = z.tuple([z.number(), z.number()]);

export type Point = z.infer<typeof PointSchema>;

export const PlayPointSchema = z.tuple([...PointSchema.items, z.nativeEnum(EPiece)]);

export type PlayPoint = z.infer<typeof PlayPointSchema>;

export abstract class ABoard {
  abstract role: EPiece;
  abstract size: number;
  abstract depth: number;
  abstract board: EPiece[][];
  abstract history: Array<{ x: number; y: number; role: EPiece }>;

  abstract put(x: number, y: number, role: EPiece): boolean;

  abstract undo(): boolean;

  abstract hash(): bigint;

  abstract getWinner(): EPiece;

  abstract isGameOver(): boolean;

  abstract evaluate(role: EPiece): number;

  abstract display(points: Point[]): string;

  abstract getValuableMoves(
    role: EPiece,
    currentDepth: number,
    onlyThree: boolean,
    onlyFour: boolean,
  ): Point[];
}
