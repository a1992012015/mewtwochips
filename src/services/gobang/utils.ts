import { EPiece } from "@/types/gobang/role.type";
import { DIRECTIONS } from "@/services/gobang/config";
import { EventResType } from "@/types/gobang/bridge.type";
import { ABoard, PlayPoint, Point } from "@/types/gobang/board.type";

/**
 * 反转当前的棋子角色
 *
 * @param role 当前的棋子角色
 * @return 反转后的棋子角色
 */
export const reversal = (role: EPiece): EPiece.WHITE | EPiece.BLACK => {
  return role === EPiece.WHITE ? EPiece.BLACK : EPiece.WHITE;
};

/**
 * 收集当前棋盘的数据
 *
 * @param board 当前的棋盘
 * @param score 当前走的最后一步的分数
 * @param move 当前走的最后一步
 * @param bestPath 当前走的最后一步的路线
 * @return 收集到的数据
 */
export const getBoardData = (
  board: ABoard,
  score?: number,
  move?: Point,
  bestPath?: Point[],
): EventResType["payload"] => {
  return {
    // board: JSON.parse(JSON.stringify(board.board)),
    winner: board.getWinner(),
    currentPlayer: board.role,
    // history: JSON.parse(JSON.stringify(board.history)),
    size: board.size,
    score,
    bestPath,
    move: move ? [move[1], move[0]] : move,
  };
};

/**
 * 创建指定大小的数组和添加数组的默认值
 *
 * @param size 创建数组的大小
 * @param value 数组的默认值或者默认值创建函数
 * @return 创建的数组
 */
export const createArrayByValue = <T, D extends T>(
  size: number,
  value: ((p: Point) => D) | D,
): Array<Array<T>> => {
  return new Array(size).fill(0).map((_, x) => {
    return new Array(size).fill(0).map((_, y) => {
      return value instanceof Function ? value([y, x]) : value;
    });
  });
};

/**
 * 从当前棋盘所有的棋子里面寻找胜利者
 *
 * @param move 当前走的点
 * @param paths 当前棋盘所有棋子的点
 * @param role 要需要的胜利者的角色
 * @return {Point[]} 胜利的路线
 */
export const searchWinnerPath = (move: Point, paths: PlayPoint[], role: EPiece): Point[] => {
  const [x, y] = move;
  for (const [ox, oy] of DIRECTIONS) {
    const path = [move];
    for (const sign of [1, -1]) {
      for (let step = 1; step < 5; step++) {
        const [nx, ny] = [x + sign * step * ox, y + sign * step * oy];
        const findPoint = paths.find(([x, y, p]) => {
          return x === nx && y === ny && p === role;
        });
        if (findPoint) {
          path.push([findPoint[0], findPoint[1]]);
        } else {
          break;
        }
      }
      if (path.length >= 5) {
        return path;
      }
    }
  }
  return [];
};
