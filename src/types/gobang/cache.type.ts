import { z } from "zod";

import { EPiece } from "@/types/gobang/role.type";
import { PointSchema } from "@/types/gobang/board.type";

export const CacheSchema = z.object({
  depth: z.number(),
  value: z.number(),
  move: PointSchema.optional(),
  role: z.nativeEnum(EPiece),
  path: PointSchema.array(),
  onlyThree: z.boolean(),
  onlyFour: z.boolean(),
});

export type CacheType = z.infer<typeof CacheSchema>;
