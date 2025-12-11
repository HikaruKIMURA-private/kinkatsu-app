"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExerciseRow } from "@/app/(data)/get-exercises";

type BodyPart = "CHEST" | "BACK" | "LEGS" | "ABS" | "ARMS" | "SHOULDERS" | "FOREARMS" | "CALVES" | "OTHER";

const BODY_PART_LABELS: Record<BodyPart, string> = {
  CHEST: "胸",
  BACK: "背中",
  LEGS: "脚",
  ABS: "腹筋",
  ARMS: "腕",
  SHOULDERS: "肩",
  FOREARMS: "前腕",
  CALVES: "ふくらはぎ",
  OTHER: "その他",
};

type ExerciseListProps = {
  exercises: ExerciseRow[];
};

export function ExerciseList({ exercises }: ExerciseListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart | "ALL">("ALL");

  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBodyPart =
        selectedBodyPart === "ALL" ||
        exercise.bodyParts.some((bp) => bp === selectedBodyPart);
      return matchesSearch && matchesBodyPart;
    });
  }, [exercises, searchQuery, selectedBodyPart]);

  return (
    <div className="space-y-6">
      {/* 検索・フィルタ */}
      <div className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder="種目名で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedBodyPart("ALL")}
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
              selectedBodyPart === "ALL"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            全て
          </button>
          {(Object.keys(BODY_PART_LABELS) as BodyPart[]).map((bodyPart) => (
            <button
              key={bodyPart}
              type="button"
              onClick={() => setSelectedBodyPart(bodyPart)}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                selectedBodyPart === bodyPart
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {BODY_PART_LABELS[bodyPart]}
            </button>
          ))}
        </div>
      </div>

      {/* 結果表示 */}
      {filteredExercises.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {searchQuery || selectedBodyPart !== "ALL"
            ? "該当する種目が見つかりませんでした"
            : "種目がまだ登録されていません"}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExercises.map((exercise) => (
            <Card key={exercise.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{exercise.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {exercise.bodyParts.map((bodyPart) => (
                      <span
                        key={bodyPart}
                        className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                      >
                        {BODY_PART_LABELS[bodyPart as BodyPart]}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
