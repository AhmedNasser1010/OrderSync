"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import useAuth from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Link } from "@/i18n/routing";

interface AuthFormProps {
  mode: "signin" | "signup";
  onSuccess?: () => void;
}

export function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const t = useTranslations("Auth.form");
  const { login, signup, signInWithGoogle, isAuthLoading, authErrorMsg } =
    useAuth(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isSignIn = mode === "signin";
  const isSignUp = mode === "signup";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (isSignIn) {
        await login(email, password);
      } else {
        if (password !== confirmPassword) {
          setError(t("passwordsDoNotMatch"));
          return;
        }
        await signup(email, password);
      }
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : t("anErrorOccurred");
      setError(message);
    }
  };

  const displayError = error || authErrorMsg;

  const handleGoogleSignIn = async () => {
    setError(null);

    try {
      await signInWithGoogle();
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : t("anErrorOccurred");
      setError(message);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">
          {isSignIn ? t("signIn") : t("createAccount")}
        </CardTitle>
        <CardDescription>
          {isSignIn ? (
            <>
              {t("dontHaveAccount")}{" "}
              <Link
                href="/signup"
                className="font-medium text-primary hover:underline"
              >
                {t("signUpLink")}
              </Link>
            </>
          ) : (
            <>
              {t("alreadyHaveAccount")}{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                {t("signInLink")}
              </Link>
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {displayError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{displayError}</AlertDescription>
            </Alert>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isAuthLoading}
          >
            <svg
              className="mr-2 h-4 w-4"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M21.6 12.23c0-.78-.07-1.53-.2-2.25H12v4.26h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.33 2.98-7.53Z"
                fill="#4285F4"
              />
              <path
                d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.58A10 10 0 0 0 12 22Z"
                fill="#34A853"
              />
              <path
                d="M6.41 13.91A5.99 5.99 0 0 1 6.41 10.1V7.52H3.07a10 10 0 0 0 0 12.78l3.34-2.59Z"
                fill="#FBBC05"
              />
              <path
                d="M12 6.04c1.47 0 2.79.5 3.83 1.49l2.87-2.87A9.97 9.97 0 0 0 12 2a10 10 0 0 0-8.93 5.52l3.34 2.59C7.2 7.8 9.4 6.04 12 6.04Z"
                fill="#EA4335"
              />
            </svg>
            {t("continueWithGoogle")}
          </Button>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            <span>{t("or")}</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isAuthLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              type="password"
              placeholder={
                isSignUp ? t("passwordSignupPlaceholder") : t("passwordPlaceholder")
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isAuthLoading}
              required
            />
          </div>

          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="confirm-password">{t("confirmPassword")}</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder={t("confirmPasswordPlaceholder")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isAuthLoading}
                required
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isAuthLoading}
            size="lg"
          >
            {isAuthLoading
              ? t("loading")
              : isSignIn
                ? t("signInButton")
                : t("createAccountButton")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
