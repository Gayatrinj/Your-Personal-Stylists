// src/auth/LoginPage.tsx
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import  AuthLayout  from "@/auth/AuthLayout"; // <-- named import
import { useAuth } from "@/auth/AuthContext";
import { Button, Input, Label, Checkbox } from "@/auth/ui";
import { Eye, EyeOff } from "lucide-react";

type Mode = "login" | "signup" | "forgot";

export default function LoginPage() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const initialMode = (params.get("mode") as Mode) || "login";

  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleGoogle = async () => {
    setErr(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      nav("/app");
    } catch (e: any) {
      setErr(humanize(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {mode === "login" && (
        <LoginForm
          loading={loading}
          error={err}
          onSubmit={async (email, password) => {
            setErr(null);
            setLoading(true);
            try {
              await signInWithEmail(email, password);
              nav("/app");
            } catch (e: any) {
              setErr(humanize(e));
            } finally {
              setLoading(false);
            }
          }}
          onGoogle={handleGoogle}
          onGoSignup={() => {
            setErr(null);
            setMode("signup");
          }}
          onGoForgot={() => {
            setErr(null);
            setMode("forgot");
          }}
        />
      )}

      {mode === "signup" && (
        <SignupForm
          loading={loading}
          error={err}
          onSubmit={async (_name, email, password) => {
            setErr(null);
            setLoading(true);
            try {
              await signUpWithEmail(email, password);
              nav("/app");
            } catch (e: any) {
              setErr(humanize(e));
            } finally {
              setLoading(false);
            }
          }}
          onGoogle={handleGoogle}
          onGoLogin={() => {
            setErr(null);
            setMode("login");
          }}
        />
      )}

      {mode === "forgot" && (
        <ForgotForm
          loading={loading}
          error={err}
          onSubmit={async (email) => {
            setErr(null);
            setLoading(true);
            try {
              await resetPassword(email);
              // Optional: show a toast, or switch back to login.
              setMode("login");
            } catch (e: any) {
              setErr(humanize(e));
            } finally {
              setLoading(false);
            }
          }}
          onGoLogin={() => {
            setErr(null);
            setMode("login");
          }}
        />
      )}
    </AuthLayout>
  );
}

function humanize(e: any) {
  const code = e?.code ?? "";
  if (code.includes("user-not-found")) return "No account found for that email.";
  if (code.includes("wrong-password")) return "Incorrect password.";
  if (code.includes("email-already-in-use")) return "That email is already in use.";
  if (code.includes("too-many-requests")) return "Too many attempts. Try again later.";
  return "Something went wrong. Please try again.";
}

/* ---------- Figma-style login form ---------- */
function LoginForm(props: {
  loading?: boolean;
  error?: string | null;
  onSubmit: (email: string, password: string) => void | Promise<void>;
  onGoogle: () => void | Promise<void>;
  onGoSignup: () => void;
  onGoForgot: () => void;
}) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);

  return (
    <>
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 h-10 w-10 rounded-full bg-zinc-900" />
        <h1 className="text-[#0A0A0A] mb-1 text-[1.75rem] font-semibold">Welcome back</h1>
        <p className="text-[#6B7280]">Log in to your account to continue</p>
      </div>

      {props.error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {props.error}
        </div>
      )}

      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          props.onSubmit(email, pw);
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={show ? "text" : "password"}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#0A0A0A] focus:outline-none"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <Checkbox checked={remember} onChange={(e) => setRemember(e.currentTarget.checked)} />
            <span className="text-[#0A0A0A] text-sm">Remember me</span>
          </label>
          <button type="button" onClick={props.onGoForgot} className="text-[#2563EB] text-sm hover:underline">
            Forgot password?
          </button>
        </div>

        <Button disabled={props.loading} className="w-full">
          {props.loading ? "Logging in..." : "Log in"}
        </Button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E5E7EB]" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-[#6B7280]">Or continue with</span>
          </div>
        </div>

        <Button type="button" variant="outline" className="w-full" onClick={props.onGoogle} disabled={props.loading}>
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </Button>

        <div className="text-center mt-6 text-sm">
          <span className="text-[#6B7280]">Don’t have an account? </span>
          <button type="button" onClick={props.onGoSignup} className="text-[#2563EB] hover:underline">
            Sign up
          </button>
        </div>
      </form>
    </>
  );
}

/* ---------- Figma-style signup form ---------- */
function SignupForm(props: {
  loading?: boolean;
  error?: string | null;
  onSubmit: (name: string, email: string, password: string) => void | Promise<void>;
  onGoogle: () => void | Promise<void>;
  onGoLogin: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [agree, setAgree] = useState(false);

  return (
    <>
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 h-10 w-10 rounded-full bg-zinc-900" />
        <h1 className="text-[#0A0A0A] mb-1 text-[1.75rem] font-semibold">Create an account</h1>
        <p className="text-[#6B7280]">Get started with your free account</p>
      </div>

      {props.error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {props.error}
        </div>
      )}

      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          props.onSubmit(name, email, pw);
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={show ? "text" : "password"}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#0A0A0A]"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.currentTarget.checked)}
            className="mt-1 h-4 w-4 rounded border-[#E5E7EB] accent-[#2563EB]"
          />
          <span className="text-[#0A0A0A]">
            I agree to the{" "}
            <a className="text-[#2563EB] hover:underline">Terms of Service</a> and{" "}
            <a className="text-[#2563EB] hover:underline">Privacy Policy</a>
          </span>
        </label>

        <Button disabled={props.loading || !agree} className="w-full">
          {props.loading ? "Creating..." : "Create account"}
        </Button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E5E7EB]" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-[#6B7280]">Or continue with</span>
          </div>
        </div>

        <Button type="button" variant="outline" className="w-full" onClick={props.onGoogle} disabled={props.loading}>
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </Button>

        <div className="text-center mt-6 text-sm">
          <span className="text-[#6B7280]">Already have an account? </span>
          <button type="button" onClick={props.onGoLogin} className="text-[#2563EB] hover:underline">
            Log in
          </button>
        </div>
      </form>
    </>
  );
}

/* ---------- Figma-style forgot form ---------- */
function ForgotForm(props: {
  loading?: boolean;
  error?: string | null;
  onSubmit: (email: string) => void | Promise<void>;
  onGoLogin: () => void;
}) {
  const [email, setEmail] = useState("");

  return (
    <>
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 h-10 w-10 rounded-full bg-zinc-900" />
        <h1 className="text-[#0A0A0A] mb-1 text-[1.75rem] font-semibold">Forgot password?</h1>
        <p className="text-[#6B7280]">No worries, we’ll send you reset instructions</p>
      </div>

      {props.error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {props.error}
        </div>
      )}

      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          props.onSubmit(email);
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <p className="text-[#6B7280] text-sm">We’ll send a password reset link to this email</p>
        </div>

        <Button disabled={props.loading} className="w-full">
          {props.loading ? "Sending..." : "Send reset link"}
        </Button>

        <div className="text-center mt-6 text-sm">
          <button type="button" onClick={props.onGoLogin} className="text-[#2563EB] hover:underline">
            Back to login
          </button>
        </div>
      </form>
    </>
  );
}
