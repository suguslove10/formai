import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold text-xl shadow-lg shadow-indigo-200 mb-3">
            F
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back to FormAI</h1>
          <p className="text-sm text-slate-600 mt-1">Sign in to manage and create AI-powered forms</p>
        </div>
        <div className="flex justify-center">
          <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
        </div>
      </div>
    </main>
  );
}
