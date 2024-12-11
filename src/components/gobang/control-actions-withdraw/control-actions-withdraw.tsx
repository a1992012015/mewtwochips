"use client";

import { MouseEvent, useCallback, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { undoMove } from "@/redux-store/reducer";
import { EPiece } from "@/types/gobang/role.type";
import { useAppDispatch, useAppSelector } from "@/redux-store/hooks";

interface IProps {
  player: EPiece;
  loading: boolean;
}

export function ControlActionsWithdraw(props: IProps) {
  const { player, loading } = props;

  const [open, setOpen] = useState(false);

  const { board } = useAppSelector((s) => s.gobang);

  console.log({ board, player });

  const dispatch = useAppDispatch();

  const withdrawHandle = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      await dispatch(undoMove());
      setOpen(false);
    },
    [dispatch],
  );

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild disabled={player === EPiece.EMPTY || !board.length || loading}>
        <Button type="button">Withdraw</Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you withdraw?</AlertDialogTitle>

          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your account and remove your
            data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <AlertDialogAction onClick={withdrawHandle}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
