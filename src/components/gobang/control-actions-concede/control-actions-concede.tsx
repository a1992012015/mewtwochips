"use client";

import { useCallback } from "react";

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
import { endGame } from "@/redux-store/reducer";
import { EPiece } from "@/types/gobang/role.type";
import { useAppDispatch } from "@/redux-store/hooks";

interface IProps {
  player: EPiece;
  loading: boolean;
}

export function ControlActionsConcede(props: IProps) {
  const { player, loading } = props;

  const dispatch = useAppDispatch();

  const concedeHandle = useCallback(() => {
    dispatch(endGame());
  }, [dispatch]);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild disabled={player === EPiece.EMPTY || loading}>
        <Button type="button">Concede</Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your account and remove your
            data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={concedeHandle}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
