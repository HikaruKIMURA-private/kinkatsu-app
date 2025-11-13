"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handlePasskeySignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await authClient.signIn.passkey();

      if (signInError) {
        setError(signInError.message || "ログインに失敗しました");
        return;
      }

      if (data) {
        // ログイン成功
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("予期しないエラーが発生しました");
      console.error(err);
    } finally {
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
          setError(signUpError.message || "登録に失敗しました");
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
          return;
        }

        if (data) {
          // ログイン成功
          router.push("/dashboard");
          router.refresh();
        }
      }
    } catch (err) {
      setError("予期しないエラーが発生しました");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasskeyRegister = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Passkey の登録は認証済みユーザーが必要
      // 初回登録時は signIn.passkey() でユーザーを作成し、同時に Passkey を登録
      // 既存ユーザーが Passkey を追加する場合は authClient.passkey.addPasskey() を使用
      const { data, error: registerError } = await authClient.signIn.passkey();

      if (registerError) {
        // 初回登録の場合、エラーになる可能性がある
        // その場合は、まずユーザーを作成する必要がある
        setError(registerError.message || "パスキーの登録に失敗しました。まずログインしてください。");
        return;
      }

      if (data) {
        // 登録成功
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("予期しないエラーが発生しました");
      console.error(err);
    } finally {
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
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              minLength={8}
            />
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
            onClick={handlePasskeySignIn}
            disabled={isLoading}
            variant="outline"
            className="w-full"
            size="lg"
          >
            {isLoading ? "処理中..." : "Passkey でログイン"}
          </Button>

          {!isSignUp && (
            <Button
              onClick={handlePasskeyRegister}
              disabled={isLoading}
              variant="outline"
              className="w-full"
              size="lg"
            >
              {isLoading ? "処理中..." : "Passkey を登録"}
            </Button>
          )}
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

