"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import type { z } from "zod";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WorkoutSchema } from "@/lib/schemas/workout-schema";
import { TAG } from "@/lib/tags";

type ActionResult =
  | { status: "success"; data: { id: string } }
  | { status: "error"; error: string; issues?: z.ZodIssue[] };

export async function saveWorkoutAction(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    // 認証チェック
    const userId = await getSessionUserId();
    if (!userId) {
      return {
        status: "error",
        error: "ログインが必要です",
      };
    }

    // フォームデータの取得
    const date = formData.get("date");
    const bodyWeight = formData.get("bodyWeight");
    const dayRpe = formData.get("dayRpe");
    const notes = formData.get("notes");

    // 種目とセットのデータを取得
    const items: Array<{
      exerciseId: string;
      sets: Array<{ weightKg: string; reps: string; rpe?: string }>;
    }> = [];

    // 種目のIDを取得（exerciseId-0, exerciseId-1, ... の形式）
    const exerciseIds = Array.from(formData.keys())
      .filter((key) => key.startsWith("exerciseId-"))
      .map((key) => {
        const index = parseInt(key.replace("exerciseId-", ""), 10);
        return { index, exerciseId: formData.get(key) as string };
      })
      .sort((a, b) => a.index - b.index);

    // 各種目のセットを取得
    for (const { index, exerciseId } of exerciseIds) {
      const sets: Array<{ weightKg: string; reps: string; rpe?: string }> = [];
      const setCount =
        parseInt(formData.get(`setCount-${index}`) as string, 10) || 0;

      for (let i = 0; i < setCount; i++) {
        const weightKg = formData.get(`weightKg-${index}-${i}`) as string;
        const reps = formData.get(`reps-${index}-${i}`) as string;
        const rpe = formData.get(`rpe-${index}-${i}`) as string;

        if (weightKg && reps) {
          sets.push({ weightKg, reps, rpe: rpe || undefined });
        }
      }

      if (sets.length > 0) {
        items.push({ exerciseId, sets });
      }
    }

    // バリデーション
    const rawData = {
      date,
      bodyWeight: bodyWeight || undefined,
      dayRpe: dayRpe || undefined,
      notes: notes || undefined,
      items,
    };

    const result = WorkoutSchema.safeParse(rawData);
    if (!result.success) {
      return {
        status: "error",
        error: "入力内容に誤りがあります",
        issues: result.error.issues,
      };
    }

    const {
      date: validatedDate,
      bodyWeight: validatedBodyWeight,
      dayRpe: validatedDayRpe,
      notes: validatedNotes,
      items: validatedItems,
    } = result.data;

    // 日付をDateオブジェクトに変換（YYYY-MM-DD形式をUTCで解釈）
    // PrismaはUTCで保存するため、UTCの0時に設定する
    // "2025-12-19" -> 2025-12-19T00:00:00.000Z (UTC)
    const workoutDate = new Date(`${validatedDate}T00:00:00.000Z`);

    // ワークアウトのupsert
    const workout = await prisma.workout.upsert({
      where: {
        userId_date: {
          userId,
          date: workoutDate,
        },
      },
      create: {
        userId,
        date: workoutDate,
        bodyWeight: validatedBodyWeight ? validatedBodyWeight : null,
        dayRpe: validatedDayRpe ? validatedDayRpe : null,
        notes: validatedNotes || null,
      },
      update: {
        bodyWeight: validatedBodyWeight ? validatedBodyWeight : null,
        dayRpe: validatedDayRpe ? validatedDayRpe : null,
        notes: validatedNotes || null,
      },
    });

    // 既存のアイテムとセットを削除
    await prisma.workoutSet.deleteMany({
      where: {
        workoutItem: {
          workoutId: workout.id,
        },
      },
    });
    await prisma.workoutItem.deleteMany({
      where: {
        workoutId: workout.id,
      },
    });

    // 新しいアイテムとセットを作成
    for (let i = 0; i < validatedItems.length; i++) {
      const item = validatedItems[i];
      await prisma.workoutItem.create({
        data: {
          workoutId: workout.id,
          exerciseId: item.exerciseId,
          orderIndex: i,
          sets: {
            create: item.sets.map((set) => ({
              weightKg: set.weightKg,
              reps: set.reps,
              rpe: set.rpe || null,
            })),
          },
        },
      });
    }

    // キャッシュを再検証（即座に無効化）
    revalidateTag(TAG.WORKOUTS_BY_USER(userId), "max");
    // パスも再検証（より確実にキャッシュを無効化）
    revalidatePath("/workouts/today");
    // 日付キーも含めて再検証（unstable_cacheのキャッシュキー）
    const dateKey = workoutDate.toISOString().split("T")[0];
    revalidateTag(`workout:${userId}:${dateKey}`, "max");

    return {
      status: "success",
      data: { id: workout.id },
    };
  } catch (error) {
    console.error("Failed to save workout:", error);
    return {
      status: "error",
      error: "ワークアウトの保存に失敗しました",
    };
  }
}
