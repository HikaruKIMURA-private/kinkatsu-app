import { redirect } from "next/navigation";
import { getExercises } from "@/app/(data)/get-exercises";
import { getWorkout } from "@/app/(data)/get-workout";
import { getCurrentUser } from "@/lib/auth";
import WorkoutForm from "./workout-form";

export default async function TodayWorkoutPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // 今日の日付を取得（UTCで0時に設定）
  const today = new Date();
  const todayKey = today.toISOString().split("T")[0]; // YYYY-MM-DD形式
  const todayUTC = new Date(`${todayKey}T00:00:00.000Z`);

  // 既存のワークアウトを取得
  const workout = await getWorkout(user.id, todayUTC);

  // 種目一覧を取得
  const exercises = await getExercises();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">今日のワークアウト</h1>
      <WorkoutForm workout={workout} exercises={exercises} date={todayUTC} />
    </div>
  );
}
