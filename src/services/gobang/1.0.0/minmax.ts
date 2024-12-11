import { Cache } from "./cache";
import { FIVE } from "@/services/gobang/config";
import { randomRange } from "@/lib/random-range";
import { EPiece } from "@/types/gobang/role.type";
import { reversal } from "@/services/gobang/utils";
import { CacheType } from "@/types/gobang/cache.type";
import { ABoard, Point } from "@/types/gobang/board.type";

const MAX = 1000000000;
// 缓存内容：depth, value, move
export const cache_hits = {
  search: 0,
  total: 0,
  hit: 0,
};

const onlyThreeThreshold = 6;
const cache = new Cache<CacheType>(); // 放在这里，则minmax, vct和vcf会共用同一个缓存

const factory = (onlyThree = false, onlyFour = false) => {
  // depth 表示总深度，cDepth表示当前搜索深度
  const helper = (
    board: ABoard,
    role: EPiece,
    depth: number,
    cDepth = 0,
    path: Point[] = [],
    alpha = -MAX, // 当前节点检索的结果
    beta = MAX, // 上一个节点检索的结果
  ): [number, Point | undefined, Point[]] => {
    cache_hits.search++;
    if (cDepth >= depth || board.isGameOver()) {
      return [board.evaluate(role), undefined, [...path]];
    }
    const hash = board.hash();
    const prev = cache.get(hash);
    if (prev && prev.role === role) {
      if (
        (Math.abs(prev.value) >= FIVE || prev.depth >= depth - cDepth) &&
        prev.onlyThree === onlyThree &&
        prev.onlyFour === onlyFour
      ) {
        console.log("prev:", prev);
        // 不能连五的，则minmax 和 vct vcf 的缓存不能通用
        cache_hits.hit++;
        return [prev.value, prev.move, [...path, ...prev.path]];
      }
    }
    let value = -MAX;
    let move = undefined;
    let bestPath = [...path]; // Copy the current path
    let bestDepth = 0;
    const points = board.getValuableMoves(
      role,
      cDepth,
      onlyThree || cDepth > onlyThreeThreshold,
      onlyFour,
    );
    if (cDepth === 0) {
      console.log("points:", points);
    }
    // console.log(board.display(points));
    if (!points.length) {
      // points = board.getValidMoves(role);
      return [board.evaluate(role), undefined, [...path]];
    }

    for (let d = cDepth + 1; d <= depth; d++) {
      // 迭代加深过程中只找己方能赢的解，因此只搜索偶数层即可
      if (d % 2 !== 0) {
        continue;
      }
      let breakAll = false;
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        board.put(point[0], point[1], role);
        const newPath = [...path, point]; // Add current move to path
        const [currentValue, , currentPath] = helper(
          board,
          reversal(role),
          d,
          cDepth + 1,
          newPath,
          -beta,
          -alpha,
        );
        // 因为是用对方的角色计算的分数，所以必须取相反的分数才是自己的分数
        const current = -currentValue;
        board.undo();
        // 迭代加深的过程中，除了能赢的棋和最后一层的分数，其他都不要
        // 原因是：除了必胜的，其他评估不准。比如必输的棋，由于走的步数偏少，也会变成没有输，比如 5步之后输了，但是1步肯定不会输，这时候1步的分数是不准确的，显然不能选择。
        if (current >= FIVE || d === depth) {
          // 必输的棋，也要挣扎一下，选择最长的路径
          if (
            current > value ||
            (current <= -FIVE && value <= -FIVE && currentPath.length > bestDepth)
          ) {
            value = current;
            move = point;
            bestPath = currentPath;
            bestDepth = currentPath.length;
          }
        }
        alpha = Math.max(alpha, value);
        if (alpha >= FIVE) {
          // 自己赢了也结束，但是对方赢了还是要继续搜索的
          breakAll = true;
          break;
        }
        // alpha相当于是当前节点的检索结果
        // beta相当于是上一个节点的检索结果
        // beta相当于在上一层节点检索到的所有点的结果的缓存
        // 假设1️⃣是MAX，这一层已知的alpha是200（MAX层会选择子节点中最大的）
        // 在2️⃣是MIN，beta = -alpha = -200
        // 当2️⃣的alpha = -100大于beta就会被剪枝

        // 由于计算方式，其实在每一层都可以看作是在比较最大值

        // 所以当前的检索结果大于之前的检索结果的时候就不用搜检了
        // 因为也就是在MAX层的时候会把当前层已经搜索到的最大值X（beta）存起来，
        // 如果下一个节点的下一层会产生一个比X（beta）还小的值Y（alpha），
        // 那么之前说过玩家总是会选择最小值的。
        // 也就是说这个节点玩家的分数不会超过Y，
        // 那么这个节点显然没有必要进行计算了。
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
        path: bestPath.slice(cDepth), // 剩余搜索路径
        onlyThree,
        onlyFour,
      });
    }
    return [value, move, bestPath];
  };
  return helper;
};

const _minmax = factory();
// VCT (Victory by Continuous Threats)
// VCT 的意思是 “通过连续威胁取胜”。它是一种更广义的胜利判断方式，涵盖所有通过“威胁点”（不仅仅是冲四）在有限步数内取胜的情况。
const vct = factory(true);
// VCF (Victory by Continuous Four)
// VCF 的意思是 “通过连续冲四取胜”。它指的是一个玩家能够通过连续的“冲四”（即连续制造双三或逼迫对手防守的威胁）最终在有限步数内下出胜利的棋子。
// const vcf = factory(false, true);

const DEFAULT_POINT: Point[] = [
  [3, 3],
  [3, 11],
  [7, 7],
  [11, 3],
  [11, 11],
];

export const minmax = (
  board: ABoard,
  role: EPiece,
  depth = 4,
  enableVCT = true,
): [number, Point | undefined, Point[]] => {
  if (!board.history.length) {
    const index = randomRange(0, 4);
    return [0, DEFAULT_POINT[index], []];
  } else if (enableVCT) {
    const vctDepth = depth + 8;
    // 先看自己有没有杀棋
    let [value, move, bestPath] = vct(board, role, vctDepth);
    if (value >= FIVE) {
      return [value, move, bestPath];
    }
    [value, move, bestPath] = _minmax(board, role, depth);
    // 假设对方有杀棋，先按自己的思路走，走完之后看对方是不是还有杀棋
    // 如果对方没有了，那么就说明走的是对的
    // 如果对方还是有，那么要对比对方的杀棋路径和自己没有走棋时的长短
    // 如果走了棋之后路径变长了，说明走的是对的
    // 如果走了棋之后，对方杀棋路径长度没变，甚至更短，说明走错了，此时就优先封堵对方
    if (move) {
      board.put(move[0], move[1], role);
    }
    const [value2, move2, bestPath2] = vct(board, role, vctDepth);
    board.undo();
    if (value < FIVE && value2 === FIVE && bestPath2.length > bestPath.length) {
      const [, , bestPath3] = vct(board, role, vctDepth);
      if (bestPath2.length <= bestPath3.length) {
        return [value, move2, bestPath2]; // value2 是被挡住的，所以这里还是用value
      }
    }
    return [value, move, bestPath];
  } else {
    return _minmax(board, role, depth);
  }
};
