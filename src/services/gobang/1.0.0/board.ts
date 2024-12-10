import { Cache } from "./cache";
import { Evaluate } from "./eval";
import { EPiece } from "@/types/gobang/role.type";
import { Zobrist } from "@/services/gobang/zobrist";
import { ABoard, Point } from "@/types/gobang/board.type";
import { BOARD_SIZE, FIVE } from "@/services/gobang/config";
import { createArrayByValue, reversal } from "@/services/gobang/utils";

export class Board extends ABoard {
  size = BOARD_SIZE;
  depth = 2;
  role: EPiece = EPiece.BLACK;
  board: EPiece[][] = createArrayByValue(this.size, EPiece.EMPTY);
  history: Array<{ x: number; y: number; role: EPiece }> = [];
  zobrist = new Zobrist();
  evaluator = new Evaluate();
  winnerCache = new Cache<EPiece>();
  gameOverCache = new Cache<boolean>();
  evaluateCache = new Cache<{ role: EPiece; score: number }>();
  valuableMovesCache = new Cache<{
    role: EPiece;
    moves: [number, number][];
    depth: number;
    onlyFour: boolean;
    onlyThree: boolean;
  }>();

  constructor(depth: number = 2) {
    console.log("Board constructor init: ", { depth });
    super();
    this.depth = depth;
  }

  put(x: number, y: number, role: EPiece = this.role) {
    if (role === undefined) {
      role = this.role;
    }
    if (this.board[x][y] !== EPiece.EMPTY) {
      console.log("Invalid move!", x, y);
      return false;
    }
    this.board[x][y] = role;
    this.history.push({ x, y, role });
    this.zobrist.togglePiece(x, y, role);
    this.evaluator.move(x, y, role);
    this.role = reversal(role); // Switch role
    return true;
  }

  undo() {
    if (this.history.length === 0) {
      console.log("No moves to undo!");
      return false;
    }

    const lastMove = this.history.pop()!;

    this.board[lastMove.x][lastMove.y] = EPiece.EMPTY; // Remove the piece from the board
    this.role = lastMove.role; // Switch back to the previous player
    this.zobrist.togglePiece(lastMove.x, lastMove.y, lastMove.role);
    this.evaluator.undo(lastMove.x, lastMove.y);
    return true;
  }

  hash() {
    return this.zobrist.getHash();
  }

  isGameOver() {
    const hash = this.hash();
    const cacheOver = this.gameOverCache.get(hash);
    if (cacheOver) {
      return cacheOver;
    }
    const winner = this.getWinner();
    if (winner && winner !== EPiece.EMPTY) {
      this.gameOverCache.put(hash, true);
      return true; // Someone has won
    }
    // Game is over when there is no empty space on the board or someone has won
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (this.board[i][j] === EPiece.EMPTY) {
          this.gameOverCache.put(hash, false);
          return false;
        }
      }
    }
    this.gameOverCache.put(hash, true);
    return true;
  }

  // 根据角色获取当前角色的分数
  evaluate(role: EPiece) {
    const hash = this.hash();
    const prev = this.evaluateCache.get(hash);
    if (prev) {
      if (prev.role === role) {
        return prev.score;
      }
    }
    const winner = this.getWinner();
    let score: number;
    if (winner !== EPiece.EMPTY) {
      // 已有胜利者返回的分数
      score = FIVE * (winner === EPiece.BLACK ? 1 : -1) * (role === EPiece.BLACK ? 1 : -1);
    } else {
      // 没有胜利者得到的分数
      score = this.evaluator.evaluate(role);
    }
    this.evaluateCache.put(hash, { role, score });
    return score;
  }

  getValuableMoves(
    role: EPiece,
    depth: number,
    onlyThree: boolean,
    onlyFour: boolean,
  ): Array<Point> {
    const hash = this.hash();
    const prev = this.valuableMovesCache.get(hash);
    if (prev) {
      if (
        prev.role === role &&
        prev.depth === depth &&
        prev.onlyThree === onlyThree &&
        prev.onlyFour === onlyFour
      ) {
        return prev.moves;
      }
    }
    const moves = this.evaluator.getMoves(role, depth, onlyThree, onlyFour);
    // TODO: 存疑不清楚为什么有这个判断
    // 处理一个特殊情况，如果中间点没有落子，则默认加上中间点
    // if (!onlyThree && !onlyFour) {
    //   const center = Math.floor(this.size / 2);
    //   if (this.board[center][center] == EPiece.EMPTY) {
    //     moves.push([center, center]);
    //   }
    // }
    this.valuableMovesCache.put(hash, {
      role,
      moves,
      depth,
      onlyThree,
      onlyFour,
    });
    return moves;
  }

  getWinner() {
    const hash = this.hash();
    const winner = this.winnerCache.get(hash);
    if (winner) {
      return winner;
    }
    // Horizontal, Vertical, Diagonal
    const directions = [
      [1, 0],
      [0, 1],
      [1, 1],
      [1, -1],
    ];
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (this.board[i][j] === EPiece.EMPTY) continue;
        for (const direction of directions) {
          let count = 0;
          while (
            i + direction[0] * count >= 0 &&
            i + direction[0] * count < this.size &&
            j + direction[1] * count >= 0 &&
            j + direction[1] * count < this.size &&
            this.board[i + direction[0] * count][j + direction[1] * count] === this.board[i][j]
          ) {
            count++;
          }
          if (count >= 5) {
            this.winnerCache.put(hash, this.board[i][j]);
            return this.board[i][j];
          }
        }
      }
    }
    this.winnerCache.put(hash, EPiece.EMPTY);
    return EPiece.EMPTY;
  }

  // 显示棋盘，可以传入一个位置列表显示成问号，用来辅助调试
  display(extraPoints: Point[] = []) {
    const extraPosition = extraPoints.map((point) => this.coordinate2position(point));
    let result = "";
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const position = this.coordinate2position([i, j]);
        if (extraPosition.includes(position)) {
          result += "? ";
          continue;
        }
        switch (this.board[i][j]) {
          case EPiece.BLACK:
            result += "O ";
            break;
          case EPiece.WHITE:
            result += "X ";
            break;
          default:
            result += "- ";
            break;
        }
      }
      result += "\n"; // New line at the end of each row
    }
    return result;
  }

  coordinate2position(coordinate: Point) {
    return coordinate[0] * this.size + coordinate[1];
  }
}
