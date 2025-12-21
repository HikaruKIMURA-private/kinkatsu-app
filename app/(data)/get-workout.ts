import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { TAG } from "@/lib/tags";

export type WorkoutWithItems = {
  id: string;
  date: Date;
  bodyWeight: number | null;
  dayRpe: number | null;
  notes: string | null;
  items: Array<{
    id: string;
    exerciseId: string;
    exercise: {
      id: string;
      name: string;
    };
    orderIndex: number;
    sets: Array<{
      id: string;
      weightKg: number;
      reps: number;
      rpe: number | null;
    }>;
  }>;
};

export async function getWorkout(
  userId: string,
  date: Date,
): Promise<WorkoutWithItems | null> {
  const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD形式

  return unstable_cache(
    async () => {
      // UTCで日付範囲を設定（PrismaはUTCで保存するため）
      const startOfDay = new Date(`${dateKey}T00:00:00.000Z`);
      const endOfDay = new Date(`${dateKey}T23:59:59.999Z`);

      const workout = await prisma.workout.findFirst({
        where: {
          userId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: {
          items: {
            include: {
              exercise: {
                select: {
                  id: true,
                  name: true,
                },
              },
              sets: {
                orderBy: {
                  createdAt: "asc",
                },
              },
            },
            orderBy: {
              orderIndex: "asc",
            },
          },
        },
      });

      if (!workout) {
        return null;
      }

      return {
        id: workout.id,
        date: workout.date,
        bodyWeight: workout.bodyWeight ? Number(workout.bodyWeight) : null,
        dayRpe: workout.dayRpe ? Number(workout.dayRpe) : null,
        notes: workout.notes,
        items: workout.items.map((item) => ({
          id: item.id,
          exerciseId: item.exerciseId,
          exercise: {
            id: item.exercise.id,
            name: item.exercise.name,
          },
          orderIndex: item.orderIndex,
          sets: item.sets.map((set) => ({
            id: set.id,
            weightKg: Number(set.weightKg),
            reps: set.reps,
            rpe: set.rpe ? Number(set.rpe) : null,
          })),
        })),
      };
    },
    [`workout:${userId}:${dateKey}`],
    { tags: [TAG.WORKOUTS_BY_USER(userId)] },
  )();
}
