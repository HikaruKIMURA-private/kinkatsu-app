"use client";

import { useActionState, useEffect, useState } from "react";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { createExerciseAction } from "@/app/(actions)/exercise-actions";
import { ExerciseSchema } from "@/lib/schemas/exercise-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Check } from "lucide-react";

const BODY_PART_OPTIONS = [
  { value: "CHEST", label: "胸" },
  { value: "BACK", label: "背中" },
  { value: "LEGS", label: "脚" },
  { value: "ABS", label: "腹筋" },
  { value: "ARMS", label: "腕" },
  { value: "SHOULDERS", label: "肩" },
  { value: "FOREARMS", label: "前腕" },
  { value: "CALVES", label: "ふくらはぎ" },
  { value: "OTHER", label: "その他" },
] as const;

export default function NewExercisePage() {
  const router = useRouter();
  const [state, formAction] = useActionState(createExerciseAction, null);
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>([]);

  const [form, fields] = useForm({
    onValidate({ formData }) {
      const result = parseWithZod(formData, { schema: ExerciseSchema });
      return result;
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  // 成功時のリダイレクト
  useEffect(() => {
    if (state?.status === "success") {
      router.push("/exercises");
      router.refresh();
    }
  }, [state, router]);

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>種目を追加</CardTitle>
          <CardDescription>新しい種目を登録します</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id={form.id}
            onSubmit={(e) => {
              // #region agent log
              fetch(
                "http://127.0.0.1:7242/ingest/8b4a1d01-fe61-4473-825d-4c2d3a3c271b",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    location: "app/exercises/new/page.tsx:55",
                    message: "Form submit triggered",
                    data: {},
                    timestamp: Date.now(),
                    sessionId: "debug-session",
                    runId: "run1",
                    hypothesisId: "C",
                  }),
                },
              ).catch(() => {});
              // #endregion
              form.onSubmit(e);
            }}
            action={formAction}
            className="space-y-4"
          >
            {/* エラーメッセージ */}
            {state?.status === "error" && (
              <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                {state.error}
              </div>
            )}

            {/* 種目名 */}
            <div className="space-y-2">
              <label htmlFor={fields.name.id} className="text-sm font-medium">
                種目名 <span className="text-destructive">*</span>
              </label>
              <Input
                id={fields.name.id}
                name={fields.name.name}
                type="text"
                placeholder="例: ベンチプレス"
                required
                aria-invalid={fields.name.errors ? true : undefined}
                aria-describedby={
                  fields.name.errors ? fields.name.errorId : undefined
                }
              />
              {fields.name.errors && (
                <p
                  id={fields.name.errorId}
                  className="text-sm text-destructive"
                >
                  {fields.name.errors[0]}
                </p>
              )}
            </div>

            {/* 部位 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                部位 <span className="text-destructive">*</span>
              </label>
              <div
                className="grid grid-cols-3 gap-2"
                role="group"
                aria-label="部位選択"
              >
                {BODY_PART_OPTIONS.map((option) => {
                  const isChecked = selectedBodyParts.includes(option.value);
                  return (
                    <label
                      key={option.value}
                      htmlFor={`bodyParts-${option.value}`}
                      className={`relative flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 p-3 text-sm font-medium transition-all ${
                        isChecked
                          ? "border-primary bg-primary/10 text-primary shadow-sm"
                          : "border-input bg-background hover:border-primary/50 hover:bg-accent"
                      }`}
                    >
                      <input
                        type="checkbox"
                        id={`bodyParts-${option.value}`}
                        name="bodyParts"
                        value={option.value}
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBodyParts([
                              ...selectedBodyParts,
                              option.value,
                            ]);
                          } else {
                            setSelectedBodyParts(
                              selectedBodyParts.filter(
                                (bp) => bp !== option.value,
                              ),
                            );
                          }
                        }}
                        className="sr-only"
                      />
                      {isChecked && (
                        <Check
                          className="h-4 w-4 text-primary"
                          aria-hidden="true"
                        />
                      )}
                      <span>{option.label}</span>
                    </label>
                  );
                })}
              </div>
              {state?.status === "error" &&
                state.issues &&
                state.issues.some((issue) =>
                  issue.path.some((p) => p === "bodyParts"),
                ) && (
                  <p className="text-sm text-destructive">
                    {state.issues.find((issue) =>
                      issue.path.some((p) => p === "bodyParts"),
                    )?.message || "部位を選択してください"}
                  </p>
                )}
            </div>

            {/* 送信ボタン */}
            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={state?.status === "success"}
              >
                {state?.status === "success" ? "追加中..." : "追加"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={state?.status === "success"}
              >
                キャンセル
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
