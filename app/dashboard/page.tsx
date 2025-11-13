import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";

export default async function DashboardPage() {
  // Task 5 で getCurrentUser() を完全実装するまで、セッションIDを確認
  const sessionUserId = await getSessionUserId();

  if (!sessionUserId) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">ダッシュボード</h1>
      <p className="text-muted-foreground">
        ログインに成功しました。ダッシュボードの実装は Task 10 で行います。
      </p>
      <p className="text-sm text-muted-foreground mt-4">
        セッションID: {sessionUserId}
      </p>
    </div>
  );
}
