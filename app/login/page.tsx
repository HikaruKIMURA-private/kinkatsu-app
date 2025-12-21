"use client";

import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleGitHubSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // GitHubログインは自動的にリダイレクトされる
      const result = await authClient.signIn.social({
        provider: "github",
        callbackURL: "/dashboard",
      });

      // 通常、リダイレクトされるためここには到達しない
      if (result?.error) {
        setError(result.error.message || "GitHubログインに失敗しました");
        console.error("GitHub ログインエラー:", result.error);
        setIsLoading(false);
        return;
      }
    } catch (err) {
      // ネットワークエラーやその他のエラー
      const errorMessage =
        err instanceof Error ? err.message : "予期しないエラーが発生しました";

      // Failed to fetch エラーの場合、より詳細な情報を表示
      if (
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("fetch")
      ) {
        setError(
          "GitHubログインに接続できませんでした。環境変数（GITHUB_CLIENT_ID、GITHUB_CLIENT_SECRET）が正しく設定されているか確認してください。",
        );
      } else {
        setError(`GitHubログインエラー: ${errorMessage}`);
      }

      console.error("GitHub ログイン例外:", err);
      setIsLoading(false);
    }
  };

  const handleEmailPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // ユーザー登録
        const { data, error: signUpError } = await authClient.signUp.email({
          email,
          password,
          name: email.split("@")[0], // メールアドレスのローカル部分を名前として使用
        });

        if (signUpError) {
          console.error("新規登録エラー詳細:", signUpError);
          setError(signUpError.message || "登録に失敗しました");
          setIsLoading(false);
          return;
        }

        if (data) {
          // 登録成功
          router.push("/dashboard");
          router.refresh();
        }
      } else {
        // ログイン
        const { data, error: signInError } = await authClient.signIn.email({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message || "ログインに失敗しました");
          setIsLoading(false);
          return;
        }

        if (data) {
          // ログイン成功
          router.push("/dashboard");
          router.refresh();
        }
      }
    } catch (err) {
      // ネットワークエラーやその他のエラー
      const errorMessage =
        err instanceof Error ? err.message : "予期しないエラーが発生しました";

      // Failed to fetch エラーの場合、より詳細な情報を表示
      if (
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("fetch")
      ) {
        setError(
          "サーバーに接続できませんでした。開発サーバーが起動しているか確認してください。",
        );
      } else {
        setError(`エラー: ${errorMessage}`);
      }

      console.error("メール/パスワード認証例外:", err);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Gym Training Log</h1>
          <p className="mt-2 text-muted-foreground">
            {isSignUp ? "新規登録" : "ログイン"}
          </p>
        </div>

        <form onSubmit={handleEmailPassword} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              メールアドレス
            </label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              パスワード
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={8}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={
                  showPassword ? "パスワードを非表示" : "パスワードを表示"
                }
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? "処理中..." : isSignUp ? "新規登録" : "ログイン"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              または
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            onClick={handleGitHubSignIn}
            disabled={isLoading}
            variant="outline"
            className="w-full"
            size="lg"
          >
            {isLoading ? "処理中..." : "GitHub でログイン"}
          </Button>
        </div>

        <div className="text-center text-sm">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-primary hover:underline"
            disabled={isLoading}
          >
            {isSignUp
              ? "既にアカウントをお持ちですか？ログイン"
              : "アカウントをお持ちでないですか？新規登録"}
          </button>
        </div>
      </div>
    </div>
  );
}
