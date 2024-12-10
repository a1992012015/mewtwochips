import {
  EventResType,
  EventType,
  EWorkerAction,
  PlayType,
  StartType,
} from "@/types/gobang/bridge.type";
import { Point } from "@/types/gobang/board.type";
import { Board } from "@/services/gobang/1.0.0/board";
import { getBoardData } from "@/services/gobang/utils";
import { cache_hits, minmax } from "@/services/gobang/1.0.0/minmax";

onmessage = function (event: MessageEvent<EventType>) {
  console.log("event", event);
  const { data } = event;
  let res: EventResType["payload"] | null = null;
  switch (data.action) {
    case EWorkerAction.START:
      res = start(data.payload);
      break;
    case EWorkerAction.PLAY:
      res = play(data.payload);
      break;
    case EWorkerAction.UNDO:
      res = undo();
      break;
    case EWorkerAction.END:
      res = end();
      break;
    default:
      break;
  }
  postMessage({ action: data.action, payload: res });
};

let board = new Board();

const start = (payload: StartType["payload"]): EventResType["payload"] => {
  console.log("start ===>", payload);
  const { depth, first } = payload;
  let move: Point | undefined = undefined;
  let score: number | undefined = undefined;
  let bestPath: Point[] | undefined = undefined;
  board = new Board(depth);
  if (!first) {
    [score, move, bestPath] = minmax(board, board.role, depth);
    console.log("move", move);
    console.log("cache_hits =>", cache_hits);
    if (move) {
      board.put(move[0], move[1]);
    }
  }
  return getBoardData(board, score, move, bestPath);
};

const play = (payload: PlayType["payload"]): EventResType["payload"] => {
  console.log("play ===>", payload);
  const { position } = payload;
  let move: Point | undefined = undefined;
  let score: number | undefined = undefined;
  let bestPath: Point[] | undefined = undefined;
  try {
    board.put(position[1], position[0]);
  } catch (e) {
    console.log(e);
  }
  if (!board.isGameOver()) {
    [score, move, bestPath] = minmax(board, board.role, board.depth);
    console.log("cache_hits =>", cache_hits);

    if (move) {
      board.put(move[0], move[1]);
    }
  }
  console.log(board.display());
  return getBoardData(board, score, move, bestPath);
};

const undo = (): EventResType["payload"] => {
  console.log("undo ===>");
  return getBoardData(board);
};

const end = (): EventResType["payload"] => {
  console.log("end ===>");
  board.undo();
  board.undo();
  return getBoardData(board);
};
