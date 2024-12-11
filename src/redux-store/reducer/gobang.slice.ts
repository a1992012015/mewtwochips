import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { Point } from "@/types/gobang/board.type";
import { EPiece, EPlayer } from "@/types/gobang/role.type";
import { PlayType, StartType } from "@/types/gobang/bridge.type";
import { end, play, reversal, searchWinnerPath, start, undo } from "@/services/gobang";

export interface IGobangState {
  first: EPlayer;
  player: EPiece;
  winner: EPiece;
  winPath: Point[];
  loading: boolean;
  board: [number, number, EPiece][];
}

const initialState: IGobangState = {
  first: EPlayer.HUMAN,
  player: EPiece.EMPTY,
  winner: EPiece.EMPTY,
  loading: false,
  winPath: [],
  board: [],
};

export const startGame = createAsyncThunk(
  "gobang/start",
  async ({ first, depth }: StartType["payload"]) => {
    return await start(first, depth);
  },
);

export const playGame = createAsyncThunk(
  "gobang/play",
  async ({ position }: PlayType["payload"]) => {
    return await play(position);
  },
);

export const undoMove = createAsyncThunk("gobang/undo", async () => {
  return await undo();
});

export const endGame = createAsyncThunk("gobang/end", async () => {
  return await end();
});

const gobangSlice = createSlice({
  name: "gobang",
  initialState,
  reducers: {
    move: (state, action: PayloadAction<[number, number, EPiece]>) => {
      state.board.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(startGame.pending, () => {
      return { ...initialState, loading: true };
    });
    builder.addCase(startGame.fulfilled, (state, { payload }) => {
      console.log("startGame fulfilled payload:", payload);
      const { currentPlayer, move } = payload;
      state.player = currentPlayer;
      state.first = currentPlayer === EPiece.BLACK ? EPlayer.COMPUTER : EPlayer.HUMAN;
      console.log("move", move);
      if (move) {
        state.board.push([move[0], move[1], reversal(currentPlayer)]);
      }
      state.loading = false;
    });

    builder.addCase(playGame.pending, (state, action) => {
      console.log("playGame action:", action);
      state.loading = true;
    });
    builder.addCase(playGame.fulfilled, (state, { payload }) => {
      console.log("playGame fulfilled", payload);
      const { currentPlayer, move, winner } = payload;
      state.player = currentPlayer;

      if (move) {
        const [x, y] = move;
        state.board.push([x, y, reversal(currentPlayer)]);
        state.winner = winner || state.winner;
        if (state.winner !== EPiece.EMPTY) {
          state.player = EPiece.EMPTY;
          state.winPath = searchWinnerPath(move, state.board, reversal(currentPlayer));
        }
      }
      state.loading = false;
    });

    builder.addCase(undoMove.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(undoMove.fulfilled, (state, action) => {
      console.log("undoMove fulfilled", action);
      state.board.pop();
      state.board.pop();
      state.loading = false;
    });

    builder.addCase(endGame.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(endGame.fulfilled, (_, action) => {
      console.log("endGame fulfilled", action);
      return initialState;
    });
  },
});

export const { move } = gobangSlice.actions;

export default gobangSlice.reducer;
