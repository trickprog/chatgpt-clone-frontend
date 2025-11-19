import { SignupForm } from "@/components/auth/signup-form";
import { Logo } from "@/components/ui";

export default function SignupPage() {
  return (
    <>
      <main className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        <div className="flex items-center justify-center flex-col gap-8 lg:gap-16 p-4">
          <Logo size="2xl"/>
          <SignupForm />
        </div>
        <div className="hidden lg:flex bg-[#1B1B1B] items-center justify-center">
          <div className="bg-[#323232] w-96 h-96 rounded-xl"></div>
        </div>
      </main>
    </>
  );
}
