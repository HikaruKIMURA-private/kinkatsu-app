import { z } from "zod";

export const ExerciseSchema = z.object({
  name: z.string().min(1, "種目名を入力してください").max(100, "種目名は100文字以内で入力してください"),
  bodyParts: z
    .array(
      z.enum([
        "CHEST",
        "BACK",
        "LEGS",
        "ABS",
        "ARMS",
        "SHOULDERS",
        "FOREARMS",
        "CALVES",
        "OTHER",
      ])
    )
    .min(1, "少なくとも1つの部位を選択してください"),
});

export type ExerciseInput = z.infer<typeof ExerciseSchema>;
