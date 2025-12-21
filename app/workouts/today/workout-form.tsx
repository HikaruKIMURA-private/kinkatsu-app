"use client";

import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Copy, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useState } from "react";
import { saveWorkoutAction } from "@/app/(actions)/workout-actions";
import type { ExerciseRow } from "@/app/(data)/get-exercises";
import type { WorkoutWithItems } from "@/app/(data)/get-workout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { WorkoutSchema } from "@/lib/schemas/workout-schema";

type WorkoutFormProps = {
  workout: WorkoutWithItems | null;
  exercises: ExerciseRow[];
  date: Date;
};

type WorkoutItem = {
  id: string;
  exerciseId: string;
  sets: Array<{
    id: string;
    weightKg: number;
    reps: number;
    rpe: number | null;
  }>;
};

export default function WorkoutForm({
  workout,
  exercises,
  date,
}: WorkoutFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    saveWorkoutAction,
    null,
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 日付をYYYY-MM-DD形式に変換
  const dateString = date.toISOString().split("T")[0];

  // ワークアウトアイテムの状態管理
  const [items, setItems] = useState<WorkoutItem[]>(() => {
    if (workout?.items) {
      return workout.items.map((item) => ({
        id: item.id,
        exerciseId: item.exerciseId,
        sets: item.sets.map((set) => ({
          id: set.id,
          weightKg: set.weightKg,
          reps: set.reps,
          rpe: set.rpe,
        })),
      }));
    }
    return [];
  });

  // フォームの状態
  const [bodyWeight, setBodyWeight] = useState<string>(
    workout?.bodyWeight?.toString() || "",
  );
  const [dayRpe, setDayRpe] = useState<string>(
    workout?.dayRpe?.toString() || "",
  );
  const [notes, setNotes] = useState<string>(workout?.notes || "");

  // workoutプロップが変更されたときに状態を更新
  useEffect(() => {
    // workoutが存在する場合のみ状態を更新
    // nullの場合は既存の状態を保持（リロード時の一時的なnullを無視）
    if (workout?.id) {
      // ワークアウトアイテムを更新
      setItems(
        workout.items.map((item) => ({
          id: item.id,
          exerciseId: item.exerciseId,
          sets: item.sets.map((set) => ({
            id: set.id,
            weightKg: set.weightKg,
            reps: set.reps,
            rpe: set.rpe,
          })),
        })),
      );
      // フォームの状態を更新
      setBodyWeight(workout.bodyWeight?.toString() || "");
      setDayRpe(workout.dayRpe?.toString() || "");
      setNotes(workout.notes || "");
    }
    // workoutがnullの場合は既存の状態を保持（空にしない）
  }, [workout]);

  const [form, _fields] = useForm({
    id: "workout-form",
    onValidate({ formData }) {
      const result = parseWithZod(formData, { schema: WorkoutSchema });
      return result;
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onBlur", // onInputからonBlurに変更（URLパラメータの追加を防ぐ）
  });

  // 成功時のリフレッシュ
  useEffect(() => {
    if (state?.status === "success") {
      setIsRefreshing(true);
      // キャッシュの更新を待つために少し遅延させる
      const timer = setTimeout(() => {
        // 強制的にリフレッシュ（キャッシュを無視）
        router.refresh();
        // リフレッシュ後、少し待ってからローディング状態を解除
        setTimeout(() => {
          setIsRefreshing(false);
        }, 2000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state?.status, router]);

  // 種目を追加
  const addExercise = () => {
    if (exercises.length === 0) return;
    const newItem: WorkoutItem = {
      id: `temp-${Date.now()}`,
      exerciseId: exercises[0].id,
      sets: [],
    };
    setItems([...items, newItem]);
  };

  // 種目を削除
  const removeExercise = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // セットを追加
  const addSet = (itemIndex: number) => {
    const newItems = [...items];
    newItems[itemIndex].sets.push({
      id: `temp-set-${Date.now()}`,
      weightKg: 0,
      reps: 0,
      rpe: null,
    });
    setItems(newItems);
  };

  // セットを削除
  const removeSet = (itemIndex: number, setIndex: number) => {
    const newItems = [...items];
    newItems[itemIndex].sets = newItems[itemIndex].sets.filter(
      (_, i) => i !== setIndex,
    );
    setItems(newItems);
  };

  // セットをコピー（次のセットに追加）
  const copySet = (itemIndex: number, setIndex: number) => {
    const newItems = [...items];
    const sourceSet = newItems[itemIndex].sets[setIndex];
    const newSet = {
      id: `temp-set-${Date.now()}`,
      weightKg: sourceSet.weightKg,
      reps: sourceSet.reps,
      rpe: sourceSet.rpe,
    };
    // コピーしたセットの直後に挿入
    newItems[itemIndex].sets.splice(setIndex + 1, 0, newSet);
    setItems(newItems);
  };

  // セットの値を更新
  const updateSet = (
    itemIndex: number,
    setIndex: number,
    field: "weightKg" | "reps" | "rpe",
    value: string,
  ) => {
    const newItems = [...items];
    const set = newItems[itemIndex].sets[setIndex];
    if (field === "rpe") {
      set.rpe = value === "" ? null : parseFloat(value);
    } else {
      set[field] = parseFloat(value) || 0;
    }
    setItems(newItems);
  };

  // 種目の選択を更新
  const updateExercise = (itemIndex: number, exerciseId: string) => {
    const newItems = [...items];
    newItems[itemIndex].exerciseId = exerciseId;
    setItems(newItems);
  };

  // フォーム送信ハンドラー（保存ボタンでのみ実行）
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // 保存ボタンがクリックされたか確認（Enterキーでの送信を防ぐ）
    const nativeEvent = e.nativeEvent as unknown as SubmitEvent;
    const submitter = nativeEvent.submitter;
    if (!submitter || submitter.getAttribute("data-save-button") !== "true") {
      // 保存ボタン以外からの送信は無視
      return;
    }

    const formData = new FormData(e.currentTarget);

    // フォームデータに状態の値を追加
    formData.set("date", dateString);
    if (bodyWeight) formData.set("bodyWeight", bodyWeight);
    if (dayRpe) formData.set("dayRpe", dayRpe);
    if (notes) formData.set("notes", notes);

    // 種目とセットのデータを追加
    items.forEach((item, itemIndex) => {
      formData.set(`exerciseId-${itemIndex}`, item.exerciseId);
      formData.set(`setCount-${itemIndex}`, item.sets.length.toString());
      item.sets.forEach((set, setIndex) => {
        formData.set(
          `weightKg-${itemIndex}-${setIndex}`,
          set.weightKg.toString(),
        );
        formData.set(`reps-${itemIndex}-${setIndex}`, set.reps.toString());
        if (set.rpe !== null) {
          formData.set(`rpe-${itemIndex}-${setIndex}`, set.rpe.toString());
        }
      });
    });

    // バリデーション
    const result = parseWithZod(formData, { schema: WorkoutSchema });
    if (result.status === "error" && result.error) {
      // エラーがある場合は送信しない（サーバー側でバリデーションされる）
      return;
    }

    // サーバーアクションを実行（保存ボタンが押されたときのみ）
    // startTransition内で呼び出す必要がある
    startTransition(() => {
      formAction(formData);
    });
  };

  // Enterキーでのフォーム送信を防ぐ
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
      // テキストエリア以外のEnterキーは無視
      if (e.target.type !== "textarea") {
        e.preventDefault();
      }
    }
  };

  const isLoading = isPending || isRefreshing;

  return (
    <div className="relative">
      {/* ローディングオーバーレイ */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm font-medium">
              {isPending ? "保存中..." : "更新中..."}
            </p>
          </div>
        </div>
      )}
      <form
        id={form.id}
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        method="post"
        className="space-y-6"
      >
        {/* 隠しフィールド: 日付 */}
        <input type="hidden" name="date" value={dateString} />

        {/* エラーメッセージ */}
        {state?.status === "error" && (
          <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            {state.error}
          </div>
        )}

        {/* ヘッダ情報 */}
        <Card>
          <CardHeader>
            <CardTitle>ワークアウト情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium">
                日付
              </label>
              <Input
                id="date"
                type="date"
                value={dateString}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="bodyWeight" className="text-sm font-medium">
                体重 (kg)
              </label>
              <Input
                id="bodyWeight"
                name="bodyWeight"
                type="number"
                step="0.1"
                placeholder="例: 70.5"
                value={bodyWeight}
                onChange={(e) => setBodyWeight(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="dayRpe" className="text-sm font-medium">
                当日RPE
              </label>
              <Input
                id="dayRpe"
                name="dayRpe"
                type="number"
                step="0.1"
                min="1"
                max="10"
                placeholder="例: 8.5"
                value={dayRpe}
                onChange={(e) => setDayRpe(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">
                メモ
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="メモを入力..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* 種目一覧 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">種目</h2>
            <Button
              type="button"
              onClick={addExercise}
              variant="outline"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              種目を追加
            </Button>
          </div>

          {items.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                種目がありません。種目を追加してください。
              </CardContent>
            </Card>
          )}

          {items.map((item, itemIndex) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <select
                      name={`exerciseId-${itemIndex}`}
                      value={item.exerciseId}
                      onChange={(e) =>
                        updateExercise(itemIndex, e.target.value)
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {exercises.map((exercise) => (
                        <option key={exercise.id} value={exercise.id}>
                          {exercise.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    type="button"
                    onClick={() => removeExercise(itemIndex)}
                    variant="ghost"
                    size="sm"
                    className="ml-2 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* セット一覧 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">セット</div>
                    <Button
                      type="button"
                      onClick={() => addSet(itemIndex)}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      セット追加
                    </Button>
                  </div>

                  {item.sets.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      セットがありません。セットを追加してください。
                    </p>
                  )}

                  {item.sets.map((set, setIndex) => (
                    <div
                      key={set.id}
                      className="grid grid-cols-12 gap-2 items-center"
                    >
                      <div className="col-span-3">
                        <Input
                          name={`weightKg-${itemIndex}-${setIndex}`}
                          type="number"
                          step="0.1"
                          placeholder="重量"
                          value={set.weightKg === 0 ? "" : set.weightKg || ""}
                          onChange={(e) =>
                            updateSet(
                              itemIndex,
                              setIndex,
                              "weightKg",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          name={`reps-${itemIndex}-${setIndex}`}
                          type="number"
                          placeholder="回数"
                          value={set.reps === 0 ? "" : set.reps || ""}
                          onChange={(e) =>
                            updateSet(
                              itemIndex,
                              setIndex,
                              "reps",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          name={`rpe-${itemIndex}-${setIndex}`}
                          type="number"
                          step="0.1"
                          min="1"
                          max="10"
                          placeholder="RPE"
                          value={set.rpe === null ? "" : set.rpe || ""}
                          onChange={(e) =>
                            updateSet(
                              itemIndex,
                              setIndex,
                              "rpe",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="col-span-3 flex gap-1">
                        <Button
                          type="button"
                          onClick={() => copySet(itemIndex, setIndex)}
                          variant="ghost"
                          size="sm"
                          title="セットをコピー"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          onClick={() => removeSet(itemIndex, setIndex)}
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          title="セットを削除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* セット数を隠しフィールドで送信 */}
                  <input
                    type="hidden"
                    name={`setCount-${itemIndex}`}
                    value={item.sets.length}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 保存ボタン */}
        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            disabled={isLoading}
            data-save-button="true"
          >
            {isLoading ? "保存中..." : "保存"}
          </Button>
        </div>
      </form>
    </div>
  );
}
