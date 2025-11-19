"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col items-center justify-center gap-8 py-16 px-8 bg-white dark:bg-black rounded-lg">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-bold text-black dark:text-zinc-50">
            Moiz Kaleem
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Welcome to the ChatGPT Clone
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            onClick={() => router.push("/login")}
            className="flex h-12 w-full items-center justify-center rounded-full bg-black dark:bg-white px-5 text-white dark:text-black font-medium transition-colors hover:bg-gray-800 dark:hover:bg-gray-200"
          >
            Login
          </button>
          <button
            onClick={() => router.push("/Register")}
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.2] dark:border-white/[.2] px-5 text-black dark:text-white font-medium transition-colors hover:border-black/[.4] dark:hover:border-white/[.4] hover:bg-black/[.05] dark:hover:bg-white/[.05]"
          >
            Register
          </button>
        </div>
      </main>
    </div>
  );
}
