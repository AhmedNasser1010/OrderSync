"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
// import { Apple, Facebook, Mail } from "lucide-react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import useAuth from '@/hooks/useAuth'

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export default function AuthPage() {
  const {
    isAuthLoading,
    login,
    authErrorMsg
  } = useAuth()
  // const [isLogin, setIsLogin] = useState<boolean>(true);
  const isLogin = true
  // const [isConfirmPassword, setIsConfirmPassword] = useState<boolean>(false);
  // const [isTermsAccepted, setIsTermsAccepted] = useState<boolean>(false);
  const [isRememberMe, setIsRememberMe] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const inputProps = ({
    name = "input",
    type = "text",
    required = false,
    value = "",
  }: {
    name: string;
    type: string;
    required?: boolean;
    value: string;
  }) => {
    let autoComplete = "";

    switch (name) {
      case "email":
        autoComplete = "email";
        break;
      case "password":
        autoComplete = "current-password";
        break;
      case "confirmPassword":
        autoComplete = "new-password";
        break;
    }

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    };

    return {
      id: name,
      name: name,
      type: type,
      autoComplete,
      required,
      className: "mt-1",
      value,
      onChange: handleOnChange,
    };
  };

  // const toggleAuthMode = () => setIsLogin(!isLogin);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLogin) {
      login(formData.email, formData.password)
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-6 py-12">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
          {isLogin ? "Log in to your account" : "Create a new account"}
        </h2>
        {/* <p className="mt-2 text-center text-sm text-muted-foreground">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={toggleAuthMode}
            className="font-medium text-primary hover:text-primary/90"
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </p> */}
        <p className="mt-2 text-center text-sm text-muted-foreground text-red-500">{authErrorMsg}</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                {...inputProps({
                  name: "email",
                  type: "email",
                  required: true,
                  value: formData.email,
                })}
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                {...inputProps({
                  name: "password",
                  type: "password",
                  required: true,
                  value: formData.password,
                })}
              />
            </div> 

            {!isLogin && (
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  {...inputProps({
                    name: "confirmPassword",
                    type: "confirmPassword",
                    required: true,
                    value: formData.confirmPassword,
                  })}
                />
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Checkbox id="remember-me" checked={isRememberMe} onCheckedChange={(e: boolean) => setIsRememberMe(e)} />
                  <Label htmlFor="remember-me" className="ml-2 block text-sm">
                    Remember me
                  </Label>
                </div>

                <div className="text-sm">
                  <Link
                    href="/forgot-password"
                    className="font-medium text-primary hover:text-primary/90"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="flex items-center">
                <Checkbox id="terms" required />
                <Label htmlFor="terms" className="ml-2 block text-sm">
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-primary hover:text-primary/90"
                  >
                    Terms and Conditions
                  </Link>
                </Label>
              </div>
            )}

            <div>
              <Button className="w-full" type="submit" disabled={isAuthLoading}>
                {isAuthLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                ) : (
                    isLogin ? "Log in" : "Sign up"
                )}
              </Button>

            </div>
          </form>

          {/* <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <Button variant="outline" className="w-full">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Button>
              <Button variant="outline" className="w-full">
                <Mail className="h-5 w-5" />
                <span className="sr-only">Google</span>
              </Button>
              <Button variant="outline" className="w-full">
                <Apple className="h-5 w-5" />
                <span className="sr-only">Apple</span>
              </Button>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
