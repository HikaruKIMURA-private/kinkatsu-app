import { z } from "zod";

// セットのスキーマ
export const WorkoutSetSchema = z.object({
  weightKg: z.coerce
    .number({ required_error: "重量を入力してください" })
    .positive("重量は0より大きい値を入力してください")
    .max(1000, "重量は1000kg以下で入力してください"),
  reps: z.coerce
    .number({ required_error: "回数を入力してください" })
    .int("回数は整数で入力してください")
    .positive("回数は1以上で入力してください")
    .max(1000, "回数は1000回以下で入力してください"),
  rpe: z.coerce
    .number()
    .min(1, "RPEは1以上で入力してください")
    .max(10, "RPEは10以下で入力してください")
    .optional(),
});

export type WorkoutSetInput = z.infer<typeof WorkoutSetSchema>;

// ワークアウトアイテム（種目）のスキーマ
export const WorkoutItemSchema = z.object({
  exerciseId: z.string().min(1, "種目を選択してください"),
  sets: z.array(WorkoutSetSchema).min(1, "少なくとも1セットを追加してください"),
});

export type WorkoutItemInput = z.infer<typeof WorkoutItemSchema>;

// ワークアウトヘッダのスキーマ
export const WorkoutHeaderSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "日付はYYYY-MM-DD形式で入力してください"),
  bodyWeight: z.coerce
    .number()
    .positive("体重は0より大きい値を入力してください")
    .max(500, "体重は500kg以下で入力してください")
    .optional(),
  dayRpe: z.coerce
    .number()
    .min(1, "RPEは1以上で入力してください")
    .max(10, "RPEは10以下で入力してください")
    .optional(),
  notes: z
    .string()
    .max(1000, "メモは1000文字以内で入力してください")
    .optional(),
});

export type WorkoutHeaderInput = z.infer<typeof WorkoutHeaderSchema>;

// ワークアウト全体のスキーマ
export const WorkoutSchema = WorkoutHeaderSchema.extend({
  items: z.array(WorkoutItemSchema).default([]),
});

export type WorkoutInput = z.infer<typeof WorkoutSchema>;
