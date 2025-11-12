"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
            Passkey でログインまたは登録
          </p>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            onClick={handlePasskeySignIn}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? "処理中..." : "Passkey でログイン"}
          </Button>

          <Button
            onClick={handlePasskeyRegister}
            disabled={isLoading}
            variant="outline"
            className="w-full"
            size="lg"
          >
            {isLoading ? "処理中..." : "Passkey を登録"}
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Passkey は、パスワード不要の安全な認証方法です。
          <br />
          指紋や顔認証、またはデバイスのロック解除を使用してログインできます。
        </p>
      </div>
    </div>
  );
}

