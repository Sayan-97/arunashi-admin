"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-white">
      {/* Left Column (40% width on large screens) */}
      <div className="relative hidden lg:flex lg:w-[45%] flex-col items-center justify-center bg-black overflow-hidden select-none">
        <Image
          src="/auth-bg.png"
          alt="Authentication Background"
          fill
          priority
          className="object-cover opacity-85"
        />
      </div>

      {/* Right Column (60% width on large screens) */}
      <div className="flex flex-1 lg:w-[60%] items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-[440px] space-y-8">
          {/* Header */}
          <div className="text-center space-y-2.5">
            <h1>Welcome Back</h1>
            <p className="mx-auto text-secondary-foreground">
              Sign in to access the admin pannel
            </p>
          </div>

          {/* Form */}
          <form action={action} className="space-y-2">
            <div className="space-y-4">
              {/* Username Input */}
              <div className="space-y-1.5">
                <Input
                  name="email"
                  type="text"
                  placeholder="Username"
                  className="w-full h-[57px] bg-[#F5F5F5] placeholder:text-[#868686] text-black border-0 rounded-none px-5 text-sm transition-all focus-visible:ring-1 focus-visible:ring-[#bec36c]/50 focus-visible:bg-[#F5F5F5]"
                />
                {state?.errors?.email && (
                  <p className="text-xs text-red-500 font-medium pl-1">
                    {state.errors.email[0]}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <Input
                  name="password"
                  type="password"
                  placeholder="Password"
                  className="w-full h-[57px] bg-[#F5F5F5] placeholder:text-[#868686] text-black border-0 rounded-none px-5 text-sm transition-all focus-visible:ring-1 focus-visible:ring-[#bec36c]/50 focus-visible:bg-[#F5F5F5]"
                />
                {state?.errors?.password && (
                  <p className="text-xs text-red-500 font-medium pl-1">
                    {state.errors.password[0]}
                  </p>
                )}
              </div>
            </div>

            {/* Forget Password */}
            <div className="flex justify-end">
              <Link
                href="#"
                className="font-nunito text-sm text-black hover:underline tracking-wide transition-all"
              >
                Forget Password
              </Link>
            </div>

            {/* Form Error */}
            {state?.errors?.form && (
              <p className="text-sm text-red-500 font-medium text-center">
                {state.errors.form}
              </p>
            )}

            {/* Submit Button */}
            <div className="flex justify-center pt-2">
              <Button
                type="submit"
                disabled={pending}
                variant="outline"
                size={"lg"}
                className="px-16"
              >
                {pending ? "Logging In..." : "Log In"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
