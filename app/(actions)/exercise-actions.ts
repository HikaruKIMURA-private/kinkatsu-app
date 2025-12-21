"use server";

import { revalidateTag } from "next/cache";
import type { z } from "zod";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ExerciseSchema } from "@/lib/schemas/exercise-schema";
import { TAG } from "@/lib/tags";

type ActionResult =
  | { status: "success"; data: { id: string } }
  | { status: "error"; error: string; issues?: z.ZodIssue[] };

export async function createExerciseAction(
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

    // フォームデータの取得とバリデーション
    const name = formData.get("name");
    const bodyParts = formData.getAll("bodyParts");
    const rawData = {
      name,
      bodyParts: bodyParts.filter((bp): bp is string => typeof bp === "string"),
    };

    const result = ExerciseSchema.safeParse(rawData);
    if (!result.success) {
      return {
        status: "error",
        error: "入力内容に誤りがあります",
        issues: result.error.issues,
      };
    }

    const { name: validatedName, bodyParts: validatedBodyParts } = result.data;

    // 同名の重複チェック
    const existing = await prisma.exercise.findUnique({
      where: {
        name: validatedName,
      },
    });

    if (existing) {
      return {
        status: "error",
        error: "同じ名前の種目が既に存在します",
      };
    }

    // データベースに保存
    const exercise = await prisma.exercise.create({
      data: {
        name: validatedName,
        bodyParts: validatedBodyParts,
        createdBy: userId,
      },
    });

    // キャッシュを再検証
    revalidateTag(TAG.EXERCISES, "max");

    return {
      status: "success",
      data: { id: exercise.id },
    };
  } catch (error) {
    console.error("Failed to create exercise:", error);
    return {
      status: "error",
      error: "種目の作成に失敗しました",
    };
  }
}
