"use client";

import { useActionState } from "react";
import { login } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="app_container flex items-center justify-center">
      <section className="w-full max-w-[486px] p-10 space-y-7 bg-secondary">
        <div className="text-center space-y-3">
          <h1>Admin Portal</h1>
          <p className="w-3/4 mx-auto text-secondary-foreground">
            Sign in to access your Arunashi admin control center
          </p>
        </div>
        <form action={action} className="space-y-7">
          <div className="space-y-5.5">
            <div className="space-y-1.5">
              <Input
                name="email"
                type="email"
                placeholder="Email"
                className="w-full h-[57px] rounded-none border-0"
              />
              {state?.errors?.email && (
                <p className="text-xs text-red-500 font-medium pl-1">
                  {state.errors.email[0]}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Input
                name="password"
                type="password"
                placeholder="Password"
                className="w-full h-[57px] rounded-none border-0"
              />
              {state?.errors?.password && (
                <p className="text-xs text-red-500 font-medium pl-1">
                  {state.errors.password[0]}
                </p>
              )}
            </div>
            {state?.errors?.form && (
              <p className="text-sm text-red-500 font-medium text-center">
                {state.errors.form}
              </p>
            )}
          </div>
          <div className="flex flex-col items-center gap-2">
            <Button
              type="submit"
              disabled={pending}
              variant="outline"
              size="lg"
              className="px-10"
            >
              {pending ? "Logging In..." : "Log In"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
