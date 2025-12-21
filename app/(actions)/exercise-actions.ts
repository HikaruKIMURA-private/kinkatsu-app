"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidateTag } from "next/cache";
import { TAG } from "@/lib/tags";
import { getSessionUserId } from "@/lib/auth";
import { ExerciseSchema } from "@/lib/schemas/exercise-schema";

type ActionResult =
  | { status: "success"; data: { id: string } }
  | { status: "error"; error: string; issues?: z.ZodIssue[] };

export async function createExerciseAction(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  // #region agent log
  const fs = await import("fs/promises").catch(() => null);
  if (fs)
    await fs
      .appendFile(
        "/Users/hikaru/kinkatsu/kinkatsu-app/.cursor/debug.log",
        JSON.stringify({
          location: "app/(actions)/exercise-actions.ts:32",
          message: "Server Action called",
          data: { formDataEntries: Array.from(formData.entries()) },
          timestamp: Date.now(),
          sessionId: "debug-session",
          runId: "run1",
          hypothesisId: "C",
        }) + "\n",
      )
      .catch(() => {});
  // #endregion
  try {
    // 認証チェック
    const userId = await getSessionUserId();
    // #region agent log
    if (fs)
      await fs
        .appendFile(
          "/Users/hikaru/kinkatsu/kinkatsu-app/.cursor/debug.log",
          JSON.stringify({
            location: "app/(actions)/exercise-actions.ts:39",
            message: "getSessionUserId result",
            data: { userId: userId || null },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "D",
          }) + "\n",
        )
        .catch(() => {});
    // #endregion
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
    // #region agent log
    if (fs)
      await fs
        .appendFile(
          "/Users/hikaru/kinkatsu/kinkatsu-app/.cursor/debug.log",
          JSON.stringify({
            location: "app/(actions)/exercise-actions.ts:50",
            message: "Raw form data extracted",
            data: { rawData },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "C",
          }) + "\n",
        )
        .catch(() => {});
    // #endregion

    const result = ExerciseSchema.safeParse(rawData);
    // #region agent log
    if (fs)
      await fs
        .appendFile(
          "/Users/hikaru/kinkatsu/kinkatsu-app/.cursor/debug.log",
          JSON.stringify({
            location: "app/(actions)/exercise-actions.ts:53",
            message: "Schema validation result",
            data: {
              success: result.success,
              errors: result.success ? null : result.error.issues,
            },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "B",
          }) + "\n",
        )
        .catch(() => {});
    // #endregion
    if (!result.success) {
      return {
        status: "error",
        error: "入力内容に誤りがあります",
        issues: result.error.issues,
      };
    }

    const { name: validatedName, bodyParts: validatedBodyParts } = result.data;

    // 同名の重複チェック
    // #region agent log
    if (fs)
      await fs
        .appendFile(
          "/Users/hikaru/kinkatsu/kinkatsu-app/.cursor/debug.log",
          JSON.stringify({
            location: "app/(actions)/exercise-actions.ts:64",
            message: "Checking for duplicate exercise",
            data: { name: validatedName },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "E",
          }) + "\n",
        )
        .catch(() => {});
    // #endregion
    const existing = await prisma.exercise.findUnique({
      where: {
        name: validatedName,
      },
    });
    // #region agent log
    if (fs)
      await fs
        .appendFile(
          "/Users/hikaru/kinkatsu/kinkatsu-app/.cursor/debug.log",
          JSON.stringify({
            location: "app/(actions)/exercise-actions.ts:72",
            message: "Duplicate check result",
            data: { exists: !!existing },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "E",
          }) + "\n",
        )
        .catch(() => {});
    // #endregion

    if (existing) {
      return {
        status: "error",
        error: "同じ名前の種目が既に存在します",
      };
    }

    // データベースに保存
    // #region agent log
    if (fs)
      await fs
        .appendFile(
          "/Users/hikaru/kinkatsu/kinkatsu-app/.cursor/debug.log",
          JSON.stringify({
            location: "app/(actions)/exercise-actions.ts:81",
            message: "Creating exercise in database",
            data: {
              name: validatedName,
              bodyParts: validatedBodyParts,
              createdBy: userId,
            },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "E",
          }) + "\n",
        )
        .catch(() => {});
    // #endregion
    const exercise = await prisma.exercise.create({
      data: {
        name: validatedName,
        bodyParts: validatedBodyParts,
        createdBy: userId,
      },
    });
    // #region agent log
    if (fs)
      await fs
        .appendFile(
          "/Users/hikaru/kinkatsu/kinkatsu-app/.cursor/debug.log",
          JSON.stringify({
            location: "app/(actions)/exercise-actions.ts:88",
            message: "Exercise created successfully",
            data: { exerciseId: exercise.id },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "E",
          }) + "\n",
        )
        .catch(() => {});
    // #endregion

    // キャッシュを再検証
    revalidateTag(TAG.EXERCISES, "max");

    return {
      status: "success",
      data: { id: exercise.id },
    };
  } catch (error) {
    // #region agent log
    const fsErr = await import("fs/promises").catch(() => null);
    if (fsErr)
      await fsErr
        .appendFile(
          "/Users/hikaru/kinkatsu/kinkatsu-app/.cursor/debug.log",
          JSON.stringify({
            location: "app/(actions)/exercise-actions.ts:97",
            message: "Error caught",
            data: {
              errorMessage:
                error instanceof Error ? error.message : String(error),
              errorStack: error instanceof Error ? error.stack : undefined,
            },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "ALL",
          }) + "\n",
        )
        .catch(() => {});
    // #endregion
    console.error("Failed to create exercise:", error);
    return {
      status: "error",
      error: "種目の作成に失敗しました",
    };
  }
}
