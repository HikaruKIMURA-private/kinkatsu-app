import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUserId } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  // Task 5 で getCurrentUser() を完全実装するまで、セッションIDを確認
  const sessionUserId = await getSessionUserId();

  if (!sessionUserId) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">ダッシュボード</h1>
      <p className="text-muted-foreground mb-6">
        ログインに成功しました。ダッシュボードの実装は Task 10 で行います。
      </p>
      
      <div className="space-y-4">
        <div>
          <Link href="/exercises">
            <Button size="lg" className="w-full sm:w-auto">
              種目一覧へ
            </Button>
          </Link>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mt-8">
        セッションID: {sessionUserId}
      </p>
    </div>
  );
}
