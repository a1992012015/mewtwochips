import { z } from "zod";

import { EPiece } from "@/types/gobang/role.type";
import { PointSchema } from "@/types/gobang/board.type";

export enum EWorkerAction {
  START = "Start",
  PLAY = "Play",
  UNDO = "Undo",
  END = "End",
}

export const ResponseSchema = z.object({
  action: z.nativeEnum(EWorkerAction),
  payload: z.object({
    // board: z.nativeEnum(EPiece).array().array(),
    winner: z.nativeEnum(EPiece).optional(),
    currentPlayer: z.nativeEnum(EPiece),
    // history: z.object({ x: z.number(), y: z.number(), role: z.nativeEnum(EPiece) }).array(),
    size: z.number(),
    score: z.number().optional(),
    bestPath: PointSchema.array().optional(),
    move: PointSchema.optional(),
  }),
});

export const StartSchema = z.object({
  action: z.literal(EWorkerAction.START),
  payload: z.object({
    depth: z.number().multipleOf(2),
    first: z.boolean(),
  }),
});

export type StartType = z.infer<typeof StartSchema>;

export const PlaySchema = z.object({
  action: z.literal(EWorkerAction.PLAY),
  payload: z.object({
    position: PointSchema,
  }),
});

export type PlayType = z.infer<typeof PlaySchema>;

export const UndoSchema = z.object({
  action: z.literal(EWorkerAction.UNDO),
});

export type UndoType = z.infer<typeof UndoSchema>;

export const EndSchema = z.object({
  action: z.literal(EWorkerAction.END),
});

export type EndType = z.infer<typeof EndSchema>;

export type EventType = StartType | PlayType | UndoType | EndType;
export type EventResType = z.infer<typeof ResponseSchema>;
