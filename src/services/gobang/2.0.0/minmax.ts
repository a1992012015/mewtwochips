import { Cache } from "../cache";
import { FIVE } from "@/services/gobang/config";
import { EPiece } from "@/types/gobang/role.type";
import { reversal } from "@/services/gobang/utils";
import { CacheType } from "@/types/gobang/cache.type";
import { ABoard, Point } from "@/types/gobang/board.type";

const MAX = 1000000000;
// 缓存内容
export const cache_hits = {
  search: 0, // 检索的次数
  total: 0, //缓存的数量
  hit: 0, // 缓存利用次数
};

const onlyThreeThreshold = 6;
const cache = new Cache<CacheType>(); // 放在这里，则minmax, vct和vcf会共用同一个缓存

const factory = (onlyThree = false, onlyFour = false) => {
  /**
   * 极大极小值检索函数
   *
   * @param {ABoard} board - 当前的棋盘
   * @param {EPiece} role - 当前角色
   * @param {number} depth - 总检索深度
   * @param {number} cDepth - 当前检索深度
   * @param {Point[]} path - 最后一步走的路径
   * @param {number} alpha - 对方当前的分数
   * @param {number} beta - 自己当前的分数
   * @returns {[number, Point ｜ undefined, Point[]]} - 当前可以走的最好的位置
   */
  const helper = (
    board: ABoard,
    role: EPiece,
    depth: number,
    cDepth: number = 0,
    path: Point[] = [],
    alpha: number = -MAX,
    beta: number = MAX,
  ): [number, Point | undefined, Point[]] => {
    cache_hits.search++;
    if (depth <= cDepth || board.isGameOver()) {
      // 深入到指定层数 or 棋盘出现胜者
      return [board.evaluate(role), undefined, [...path]];
    }
    const hash = board.hash();
    const prev = cache.get(hash);
    if (prev && prev.role === role) {
      console.log("prev", prev);
      if (
        (Math.abs(prev.value) >= FIVE || prev.depth >= depth - cDepth) &&
        prev.onlyThree === onlyThree &&
        prev.onlyFour === onlyFour
      ) {
        // 不能连五的，则minmax 和 vct vcf 的缓存不能通用
        cache_hits.hit++;
        return [prev.value, prev.move, [...path, ...prev.path]];
      }
    }
    let value = -MAX;
    let move = undefined;
    let basePath = [...path]; // Copy the current path
    let baseDepth = 0;
    const points = board.getValuableMoves(
      role,
      cDepth,
      onlyThree || cDepth > onlyThreeThreshold,
      onlyFour,
    );
    if (cDepth === 0) {
      console.log("points:", points);
    }
    console.log(board.display(points));
    if (!points.length) {
      // 没有找到可以走的位置
      return [board.evaluate(role), undefined, [...path]];
    }

    // 迭代加深：将所有的可以走的点一层一层的检索，当某一层返回了必赢的棋就不继续检索到指定的深度，反之则检索到指定的深度
    // 因为会使用已经检索过的缓存，所以不会造成太大的开销，反而会节约时间
    for (let d = cDepth + 1; d <= depth; d++) {
      // 迭代加深过程中只找己方能赢的解，因此只搜索偶数层即可
      // 这是考虑到检索必须是偶数层，需要考虑防御
      // 这个层数是迭代加深每次的总层数
      if (d % 2 !== 0) {
        continue;
      }
      let breakAll = false;

      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        board.put(point[0], point[1], role);
        const [currentValue, , currentPath] = helper(
          board,
          reversal(role),
          d,
          cDepth + 1,
          [...path, point],
          -beta,
          -alpha,
        );
        board.undo();
        // 迭代加深的过程中，除了能赢的棋，其他都不要
        // 原因是：除了必胜的，其他评估不准。比如必输的棋，由于走的步数偏少，也会变成没有输，比如 5步之后输了，但是1步肯定不会输，这时候1步的分数是不准确的，显然不能选择。
        if (currentValue >= FIVE || d === depth) {
          // 必输的棋，也要挣扎一下，选择最长的路径
          if (
            currentValue > value ||
            (currentValue <= -FIVE && value <= -FIVE && currentPath.length > baseDepth)
          ) {
            value = currentValue;
            move = point;
            basePath = currentPath;
            baseDepth = currentPath.length;
          }
        }
        alpha = Math.max(alpha, value);
        if (alpha >= FIVE) {
          // 自己赢了也结束，但是对方赢了还是要继续搜索的
          breakAll = true;
          break;
        }
        if (alpha >= beta) {
          break;
        }
      }

      if (breakAll) {
        break;
      }
    }
    // 缓存
    if (
      (cDepth < onlyThreeThreshold || onlyThree || onlyFour) &&
      (!prev || prev.depth < depth - cDepth)
    ) {
      cache_hits.total += 1;
      cache.put(hash, {
        depth: depth - cDepth, // 剩余搜索深度
        value,
        move,
        role,
        path: basePath.slice(cDepth), // 剩余搜索路径
        onlyThree,
        onlyFour,
      });
    }
    return [value, move, basePath];
  };
  return helper;
};

export const _minmax = factory();
