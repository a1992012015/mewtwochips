"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { randomRange } from "@/lib/random-range";
import { startGame } from "@/redux-store/reducer";
import { useAppDispatch } from "@/redux-store/hooks";
import { EPiece, EPlayer } from "@/types/gobang/role.type";
import { ControlActionsConcede } from "../control-actions-concede";
import { ControlActionsWithdraw } from "../control-actions-withdraw";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";

enum EDifficulty {
  SIMPLE = "4",
  MEDIUM = "6",
  DIFFICULTY = "8",
}

const startSchema = z.object({
  first: z.nativeEnum(EPlayer),
  deep: z.nativeEnum(EDifficulty),
});

interface IProps {
  player: EPiece;
  loading: boolean;
}

export function ControlActions(props: IProps) {
  const { player, loading } = props;

  const dispatch = useAppDispatch();

  // 1. Define your form.
  const form = useForm<z.infer<typeof startSchema>>({
    resolver: zodResolver(startSchema),
    defaultValues: { first: EPlayer.HUMAN, deep: EDifficulty.SIMPLE },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof startSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log("=========> onSubmit", values);
    if (values.first === EPlayer.RANDOM) {
      dispatch(startGame({ first: !!randomRange(0, 1), depth: Number(values.deep) }));
    } else {
      dispatch(startGame({ first: values.first === EPlayer.HUMAN, depth: Number(values.deep) }));
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-2">
          <Button type="submit" disabled={player !== EPiece.EMPTY || loading}>
            Start
          </Button>

          <ControlActionsWithdraw {...props} />

          <ControlActionsConcede {...props} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="first"
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem className="flex items-center gap-1 space-y-0">
                <FormLabel>First:</FormLabel>
                <Select {...field} onValueChange={onChange} defaultValue={value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value={EPlayer.HUMAN}>Human</SelectItem>
                      <SelectItem value={EPlayer.COMPUTER}>Computer</SelectItem>
                      <SelectItem value={EPlayer.RANDOM}>Random</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="deep"
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem className="flex items-center gap-1 space-y-0">
                <FormLabel>Difficulty:</FormLabel>
                <Select {...field} onValueChange={onChange} defaultValue={value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value={EDifficulty.SIMPLE}>Simple</SelectItem>
                      <SelectItem value={EDifficulty.MEDIUM}>Medium</SelectItem>
                      <SelectItem value={EDifficulty.DIFFICULTY}>Difficulty</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
