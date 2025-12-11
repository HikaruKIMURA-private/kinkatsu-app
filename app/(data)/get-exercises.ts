import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { TAG } from "@/lib/tags";

export type ExerciseRow = {
  id: string;
  name: string;
  bodyParts: string[];
};

export async function getExercises(): Promise<ExerciseRow[]> {
  return unstable_cache(
    async () => {
      const rows = await prisma.exercise.findMany({
        orderBy: { name: "asc" },
      });
      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        bodyParts: r.bodyParts,
      }));
    },
    ["exercises"],
    { tags: [TAG.EXERCISES] }
  )();
}
