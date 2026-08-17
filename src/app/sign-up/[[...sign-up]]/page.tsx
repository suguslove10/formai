import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold text-xl shadow-lg shadow-indigo-200 mb-3">
            F
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create your FormAI account</h1>
          <p className="text-sm text-slate-600 mt-1">Start building forms with artificial intelligence in seconds</p>
        </div>
        <div className="flex justify-center">
          <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
        </div>
      </div>
    </main>
  );
}
