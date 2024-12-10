import {
  BLOCK_FOUR,
  BLOCK_THREE,
  BLOCK_TWO,
  BOARD_SIZE,
  CONFIG,
  DIRECTIONS,
  FOUR,
  ONE,
  THREE,
  THREE_THREE,
  TWO,
  TWO_TWO,
} from "../config";
import { EPiece } from "@/types/gobang/role.type";
import { createArrayByValue, reversal } from "../utils";
import { coordinate2Position, hasInLine, position2Coordinate } from "./position";
import { getAllShapesOfPoint, getShapeFast, isFive, isFour, shapes } from "./shape";

/**
 * 形状转换分数，注意这里的分数是当前位置还没有落子的分数
 *
 * @since 1.0.0
 * @param {number} shape - number
 * @returns shape of number
 */
export const getRealShapeScore = (shape: number) => {
  switch (shape) {
    case shapes.FIVE:
      return FOUR;
    case shapes.BLOCK_FIVE:
      return BLOCK_FOUR;
    case shapes.FOUR:
      return THREE;
    case shapes.FOUR_FOUR:
      return THREE;
    case shapes.FOUR_THREE:
      return THREE;
    case shapes.BLOCK_FOUR:
      return BLOCK_THREE;
    case shapes.THREE:
      return TWO;
    case shapes.THREE_THREE:
      return THREE_THREE / 10;
    case shapes.BLOCK_THREE:
      return BLOCK_TWO;
    case shapes.TWO:
      return ONE;
    case shapes.TWO_TWO:
      return TWO_TWO / 10;
    default:
      return 0;
  }
};

const direction2index = (ox: number, oy: number) => {
  if (ox === 0) return 0; // |
  if (oy === 0) return 1; // -
  if (ox === oy) return 2; // \
  if (ox !== oy) return 3; // /
};

// const shape2score = {
//   [shapes.FIVE]: FIVE,
//   [shapes.BLOCK_FIVE]: BLOCK_FIVE,
//   [shapes.FOUR]: FOUR,
//   [shapes.FOUR_FOUR]: FOUR_FOUR, // 双冲四
//   [shapes.FOUR_THREE]: FOUR_THREE, // 冲四活三
//   [shapes.THREE_THREE]: THREE_THREE, // 双三
//   [shapes.BLOCK_FOUR]: BLOCK_FOUR,
//   [shapes.THREE]: THREE,
//   [shapes.BLOCK_THREE]: BLOCK_THREE,
//   [shapes.TWO_TWO]: TWO_TWO, // 双活二
//   [shapes.TWO]: TWO,
//   [shapes.NONE]: 0,
// };

const performance = {
  updateTime: 0,
  getPointsTime: 0,
};

export class Evaluate {
  size = BOARD_SIZE;
  history: Array<[number, EPiece]> = [];
  board: EPiece[][] = createArrayByValue(this.size + 2, ([x, y]) =>
    x === 0 || y === 0 || x === this.size + 1 || y === this.size + 1 ? EPiece.NONE : EPiece.EMPTY,
  );
  blackScores: number[][] = createArrayByValue(this.size, 0);
  whiteScores: number[][] = createArrayByValue(this.size, 0);
  shapeCache: Record<string, Record<number, Array<Array<number>>>> = {};
  pointsCache: Record<string, Record<number, Set<number>>> = {};

  constructor() {
    this.initPoints();
  }

  initPoints() {
    // 缓存每个点位的分数，避免重复计算
    // 结构： [role][direction][x][y] = shape
    this.shapeCache = {};
    for (const role of [EPiece.WHITE, EPiece.BLACK]) {
      this.shapeCache[role] = {};
      for (const direction of [0, 1, 2, 3]) {
        this.shapeCache[role][direction] = createArrayByValue(this.size, shapes.NONE);
      }
    }
    // 缓存每个形状对应的点位
    // 结构： pointsCache[role][shape] = Set(direction1, direction2);
    this.pointsCache = {};
    for (const role of [1, -1]) {
      this.pointsCache[role] = {};
      for (const shape of Object.values(shapes)) {
        this.pointsCache[role][shape] = new Set();
      }
    }
  }

  move(x: number, y: number, role: EPiece) {
    // 清空记录
    for (const d of [0, 1, 2, 3]) {
      this.shapeCache[role][d][x][y] = 0;
      this.shapeCache[reversal(role)][d][x][y] = 0;
    }
    this.blackScores[x][y] = 0;
    this.whiteScores[x][y] = 0;

    // 更新分数
    this.board[x + 1][y + 1] = role; // Adjust for the added wall
    this.updatePoint(x, y);
    this.history.push([coordinate2Position(x, y, this.size), role]);
  }

  undo(x: number, y: number) {
    this.board[x + 1][y + 1] = EPiece.EMPTY; // Adjust for the added wall
    this.updatePoint(x, y);
    this.history.pop();
  }

  // 只返回和最后几步在一条直线上的点位。
  // 这么做有一点问题：
  // 1. 因为己方可能会由于防守暂时离开原来的线，这样就会导致己方被中断，只能增加最后几步的长度，比如不是取最后一步，而不是最后3步
  // 2. 如果不是取最后1步，取的步数太多了，反而还不如直接返回所有点位。
  getPointsInLine(role: EPiece) {
    const pointsInLine: Record<number, Set<number>> = {}; // 在一条线上的点位
    let hasPointsInLine = false;
    Object.values(shapes).forEach((shape) => {
      pointsInLine[shape] = new Set();
    });
    const last2Points = this.history.slice(-CONFIG.inlineCount).map(([position]) => position);
    const processed: Record<number, EPiece> = {}; // 已经处理过的点位
    // 在last2Points中查找是否有点位在一条线上
    for (const r of [role, reversal(role)]) {
      for (const point of last2Points) {
        const [x, y] = position2Coordinate(point, this.size);
        for (const [ox, oy] of DIRECTIONS) {
          for (const sign of [1, -1]) {
            // -1 for negative direction, 1 for positive direction
            for (let step = 1; step <= CONFIG.inLineDistance; step++) {
              const [nx, ny] = [x + sign * step * ox, y + sign * step * oy]; // +1 to adjust for wall
              const position = coordinate2Position(nx, ny, this.size);

              // 检测是否到达边界
              if (nx < 0 || nx >= this.size || ny < 0 || ny >= this.size) {
                break;
              }
              if (this.board[nx + 1][ny + 1] !== EPiece.EMPTY) {
                continue;
              }
              if (processed[position] === r) continue;
              processed[position] = r;
              for (const direction of [0, 1, 2, 3]) {
                const shape = this.shapeCache[r][direction][nx][ny];
                // 到达边界停止，但是注意到达对方棋子不能停止
                if (shape) {
                  pointsInLine[shape].add(coordinate2Position(nx, ny, this.size));
                  hasPointsInLine = true;
                }
              }
            }
          }
        }
      }
    }
    if (hasPointsInLine) {
      return pointsInLine;
    }
    return false;
  }

  getPoints(role: EPiece, depth: number, vct: boolean, vcf: boolean) {
    const first = depth % 2 === 0 ? role : reversal(role); // 先手
    const start = new Date().getTime();
    if (CONFIG.onlyInLine && this.history.length >= CONFIG.inlineCount) {
      const pointsInLine = this.getPointsInLine(role);
      if (pointsInLine) {
        performance.getPointsTime += new Date().getTime() - start;
        return pointsInLine;
      }
    }

    const points: Record<number, Set<number>> = {}; // 全部点位
    Object.values(shapes).forEach((shape) => {
      points[shape] = new Set();
    });

    const lastPoints = this.history.slice(-4).map(([position]) => position);
    // const last2Points = this.history.slice(-2).map(([position, role]) => position);

    // 在 shapeCache中查找对应的 shape
    for (const r of [role, reversal(role)]) {
      for (let x = 0; x < this.size; x++) {
        for (let y = 0; y < this.size; y++) {
          let fourCount = 0;
          let threeCount = 0;
          let blockFourCount = 0;
          for (const direction of [0, 1, 2, 3]) {
            if (this.board[x + 1][y + 1] !== EPiece.EMPTY) {
              continue;
            }
            const shape = this.shapeCache[r][direction][x][y];
            if (!shape) {
              continue;
            }
            // const scores = r === 1 ? this.blackScores : this.whiteScores;
            // 冲四，考虑自己的冲四，连五和对方的连五
            if (vcf) {
              if (r === first && !isFour(shape) && !isFive(shape)) {
                continue;
              }
              if (r === reversal(first) && isFive(shape)) {
                continue;
              }
            }
            const point = x * this.size + y;
            if (vct) {
              // 自己只进攻, 只考虑自己的活三，自己和对面的冲四、活四
              if (depth % 2 === 0) {
                if (depth === 0 && r !== first) {
                  continue; // 并且第一步一定是从自己进攻开始，而不是一上来就防守
                }
                if (shape !== shapes.THREE && !isFour(shape) && !isFive(shape)) {
                  continue;
                }
                // 对面的活三不考虑
                if (shape === shapes.THREE && r !== first) {
                  continue;
                }
                // 第一步只考虑自己的棋
                if (depth === 0 && r !== first) {
                  continue;
                }
                if (depth > 0) {
                  // 为了优化速度，这里增加了一个有损剪枝逻辑： 从第二步开始，只有 能形成活二以上的活三和冲四才考虑，这样可以过滤掉大部分无效的活三和冲四，但是也存在极少情况的错误剪枝
                  if (
                    shape === shapes.THREE &&
                    getAllShapesOfPoint(this.shapeCache, x, y, r).length === 1
                  ) {
                    continue;
                  }
                  if (
                    shape === shapes.BLOCK_FOUR &&
                    getAllShapesOfPoint(this.shapeCache, x, y, r).length === 1
                  ) {
                    continue;
                  }
                }
              }
              // 对面只防守，只考虑自己的冲四，活四，和对方的活三
              else {
                if (shape !== shapes.THREE && !isFour(shape) && !isFive(shape)) {
                  continue;
                }
                if (shape === shapes.THREE && r === reversal(first)) {
                  continue; // 不考虑防守方的活三
                }
                if (depth > 1) {
                  // 有损剪枝，如果单纯冲四无法和任何棋子联系在一起，则直接剪掉
                  if (
                    shape === shapes.BLOCK_FOUR &&
                    getAllShapesOfPoint(this.shapeCache, x, y).length === 1
                  ) {
                    continue;
                  }
                  // 从防守方的第二步开始，只有和最近两步连成一条线才行
                  if (shape === shapes.BLOCK_FOUR && !hasInLine(point, lastPoints, this.size)) {
                    continue;
                  }
                }
              }
            }
            if (vcf) {
              if (!isFour(shape) && !isFive(shape)) {
                continue;
              }
            }
            // 优化方式，从第3步开始，不考虑 在当前路径之外的活三以下的点位
            if (
              depth > 2 &&
              (shape === shapes.TWO || shape === shapes.TWO_TWO || shape === shapes.BLOCK_THREE) &&
              !hasInLine(point, lastPoints, this.size)
            ) {
              continue;
            }
            points[shape].add(point);
            if (shape === shapes.FOUR) {
              fourCount++;
            } else if (shape === shapes.BLOCK_FOUR) {
              blockFourCount++;
            } else if (shape === shapes.THREE) {
              threeCount++;
            }
            let unionShape: number | undefined = undefined;
            if (fourCount >= 2) {
              unionShape = shapes.FOUR_FOUR;
            } else if (blockFourCount && threeCount) {
              unionShape = shapes.FOUR_THREE;
            } else if (threeCount >= 2) {
              unionShape = shapes.THREE_THREE;
            }
            if (unionShape) {
              points[unionShape].add(point);
            }
          }
        }
      }
    }

    // 否则继续返回所有的点位

    performance.getPointsTime += new Date().getTime() - start;

    return points;
  }

  // 当一个位置发生变时候，要更新这个位置的四个方向上得分，更新规则是：
  // 1. 如果这个位置是空的，那么就重新计算这个位置的得分
  // 2. 如果碰到了边界或者对方的棋子，那么就停止计算
  // 3. 如果超过2个空位，那么就停止计算
  // 4. 要更新自己的和对方的得分
  updatePoint(x: number, y: number) {
    const start = new Date().getTime();
    this.updateSinglePoint(x, y, EPiece.BLACK);
    this.updateSinglePoint(x, y, EPiece.WHITE);

    for (const [ox, oy] of DIRECTIONS) {
      for (const sign of [1, -1]) {
        // -1 for negative direction, 1 for positive direction
        // let emptyCount = 0;
        for (let step = 1; step <= 5; step++) {
          let reachEdge = false;
          for (const role of [EPiece.BLACK, EPiece.WHITE]) {
            const [nx, ny] = [x + sign * step * ox + 1, y + sign * step * oy + 1]; // +1 to adjust for wall
            // 到达边界停止
            if (this.board[nx][ny] === EPiece.NONE) {
              // Stop if wall or opponent's piece is found
              reachEdge = true;
              break;
            } else if (this.board[nx][ny] === reversal(role)) {
              // 达到对方棋子，则转换角色
            } else if (this.board[nx][ny] === EPiece.EMPTY) {
              this.updateSinglePoint(nx - 1, ny - 1, role, [sign * ox, sign * oy]); // -1 to adjust back from wall
              // 这里不能跳过，可能会在悔棋时漏掉一些待更新的点位
              // emptyCount++;
              // if (emptyCount >= 3) {
              //   // Stop if more than 2 empty spaces
              //   break;
              // }
            }
          }

          if (reachEdge) {
            break;
          }
        }
      }
    }
    performance.updateTime += new Date().getTime() - start;
  }

  /*
   计算单个点的得分
   计算原理是：
   在当前位置放一个当前角色的棋子，遍历四个方向，生成四个方向上的字符串，用patters来匹配字符串, 匹配到的话，就将对应的得分加到scores上
   四个方向的字符串生成规则是：向两边都延伸5个位置，如果遇到边界或者对方的棋子，就停止延伸
   在更新周围棋子时，只有一个方向需要更新，因此可以传入direction参数，只更新一个方向
   */
  updateSinglePoint(x: number, y: number, role: EPiece, direction?: number[]) {
    if (this.board[x + 1][y + 1] !== EPiece.EMPTY) return; // Not an empty spot

    // Temporarily place the piece
    this.board[x + 1][y + 1] = role;

    let directions: number[][] = [];
    if (direction) {
      directions.push(direction);
    } else {
      directions = DIRECTIONS;
    }
    const shapeCache = this.shapeCache[role];

    // 先清除缓存
    for (const [ox, oy] of directions) {
      shapeCache[direction2index(ox, oy)!][x][y] = shapes.NONE;
    }

    let score = 0;
    let blockfourCount = 0;
    let threeCount = 0;
    let twoCount = 0;
    // 再计算已有得分
    for (const intDirection of [0, 1, 2, 3]) {
      const shape = shapeCache[intDirection][x][y];
      if (shape > shapes.NONE) {
        score += getRealShapeScore(shape);
        if (shape === shapes.BLOCK_FOUR) blockfourCount += 1;
        if (shape === shapes.THREE) threeCount += 1;
        if (shape === shapes.TWO) twoCount += 1;
      }
    }
    for (const [ox, oy] of directions) {
      const intDirection = direction2index(ox, oy);
      let [shape] = getShapeFast(this.board, x, y, ox, oy, role);
      if (!shape) continue;
      if (shape) {
        // 注意只缓存单个的形状，双三等复合形状不要缓存，因为这种缓存起来其实依赖两个形状，太复杂，所以在这里直接根据缓存的单个形状来计算双三等复合形状
        shapeCache[intDirection!][x][y] = shape;
        if (shape === shapes.BLOCK_FOUR) blockfourCount += 1;
        if (shape === shapes.THREE) threeCount += 1;
        if (shape === shapes.TWO) twoCount += 1;
        if (blockfourCount >= 2) {
          shape = shapes.FOUR_FOUR;
        } else if (blockfourCount && threeCount) {
          shape = shapes.FOUR_THREE;
        } else if (threeCount >= 2) {
          shape = shapes.THREE_THREE;
        } else if (twoCount >= 2) {
          shape = shapes.TWO_TWO;
        }
        score += getRealShapeScore(shape);
      }
    }

    this.board[x + 1][y + 1] = EPiece.EMPTY; // Remove the temporary piece

    if (role === EPiece.BLACK) {
      this.blackScores[x][y] = score;
    } else {
      this.whiteScores[x][y] = score;
    }

    return score;
  }

  // 计算整个棋盘的得分
  evaluate(role: EPiece) {
    let blackScore = 0;
    let whiteScore = 0;
    for (let i = 0; i < this.blackScores.length; i++) {
      for (let j = 0; j < this.blackScores[i].length; j++) {
        blackScore += this.blackScores[i][j];
      }
    }
    for (let i = 0; i < this.whiteScores.length; i++) {
      for (let j = 0; j < this.whiteScores[i].length; j++) {
        whiteScore += this.whiteScores[i][j];
      }
    }
    // 对MAX是正分数，对MIN是负分数
    return role === EPiece.BLACK ? blackScore - whiteScore : whiteScore - blackScore;
  }

  /**
   * 获取有价值的点位
   * @param {EPiece} role - 当前角色
   * @param {number} depth - 当前角色
   * @param {boolean} onThree - 只返回 活三、冲四、活四
   * @param {boolean} onlyFour - 最多返回多少个点位，这个参数只会裁剪活三以下的点位
   * @returns {[number, number][]} - 所有的位置
   */
  getMoves(
    role: EPiece,
    depth: number,
    onThree: boolean = false,
    onlyFour: boolean = false,
  ): [number, number][] {
    return Array.from(this._getMoves(role, depth, onThree, onlyFour)).map((move) => [
      Math.floor(move / this.size),
      move % this.size,
    ]);
  }

  private _getMoves(role: EPiece, depth: number, onlyThree = false, onlyFour = false) {
    const points = this.getPoints(role, depth, onlyThree, onlyFour);
    const fives = points[shapes.FIVE];
    const blockFives = points[shapes.BLOCK_FIVE];
    if (fives?.size || blockFives?.size) {
      return new Set([...fives, ...blockFives]);
    }

    const fours = points[shapes.FOUR];
    const blockFours = points[shapes.BLOCK_FOUR]; // 冲四比较特殊，在活四的时候要考虑，在活三的时候也要考虑
    if (onlyFour || fours?.size) {
      return new Set([...fours, ...blockFours]);
    }

    const fourFours = points[shapes.FOUR_FOUR];
    if (fourFours.size) {
      return new Set([...fourFours, ...blockFours]);
    }

    // 双三和活三
    const threes = points[shapes.THREE];
    const fourThrees = points[shapes.FOUR_THREE];
    if (fourThrees?.size) {
      return new Set([...fourThrees, ...blockFours, ...threes]);
    }
    const threeThrees = points[shapes.THREE_THREE];
    if (threeThrees?.size) {
      return new Set([...threeThrees, ...blockFours, ...threes]);
    }

    if (onlyThree) {
      return new Set([...blockFours, ...threes]);
    }

    const blockThrees = points[shapes.BLOCK_THREE];
    const twoTwos = points[shapes.TWO_TWO];
    const twos = points[shapes.TWO];
    return new Set(
      [...blockFours, ...threes, ...blockThrees, ...twoTwos, ...twos].slice(0, CONFIG.pointsLimit),
    );
  }

  display() {
    let result = "";
    for (let i = 1; i < this.size + 1; i++) {
      for (let j = 1; j < this.size + 1; j++) {
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
    console.log(result);
  }
}
