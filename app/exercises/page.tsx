import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getExercises } from "@/app/(data)/get-exercises";
import { ExerciseList } from "./exercise-list";
import { Button } from "@/components/ui/button";

export default async function ExercisesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const exercises = await getExercises();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">種目一覧</h1>
        <Link href="/exercises/new">
          <Button>種目を追加</Button>
        </Link>
      </div>
      <ExerciseList exercises={exercises} />
    </div>
  );
}
