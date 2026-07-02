"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import useAuth from '@/hooks/useAuth'

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignupPage() {
  const {
    isAuthLoading,
    signup,
    authErrorMsg
  } = useAuth(false)
  const [isTermsAccepted, setIsTermsAccepted] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [localError, setLocalError] = useState<string | null>(null);

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
        autoComplete = "new-password";
        break;
      case "confirmPassword":
        autoComplete = "new-password";
        break;
    }

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
      setLocalError(null);
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);

    if (formData.password !== formData.confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setLocalError("Password must be at least 6 characters");
      return;
    }

    if (!isTermsAccepted) {
      setLocalError("You must agree to the Terms and Conditions");
      return;
    }

    signup(formData.email, formData.password);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-6 py-12">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
          Create a new account
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:text-primary/90"
          >
            Log in
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-muted-foreground text-red-500">{authErrorMsg || localError}</p>
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

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                {...inputProps({
                  name: "confirmPassword",
                  type: "password",
                  required: true,
                  value: formData.confirmPassword,
                })}
              />
            </div>

            <div className="flex items-center">
              <Checkbox id="terms" checked={isTermsAccepted} onCheckedChange={(e: boolean) => setIsTermsAccepted(e)} />
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

            <div>
              <Button className="w-full" type="submit" disabled={isAuthLoading}>
                {isAuthLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                ) : (
                    "Sign up"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}