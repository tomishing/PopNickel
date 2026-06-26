import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import StatusBar from "../components/StatusBar";
import { useLogin, useRegister } from "../hooks/useAuth";

type Mode = "login" | "register";

function extractErrorMessage(err: unknown): string {
  if (
    err && typeof err === "object" && "response" in err &&
    err.response && typeof err.response === "object" && "data" in err.response &&
    err.response.data && typeof err.response.data === "object" && "detail" in err.response.data &&
    typeof err.response.data.detail === "string"
  ) return err.response.data.detail;
  return "Something went wrong. Please try again.";
}

function FilledInput({
  id, label, type, value, onChange, autoComplete, required, minLength, placeholder,
}: {
  id: string; label: string; type: string; value: string;
  onChange: (v: string) => void; autoComplete?: string;
  required?: boolean; minLength?: number; placeholder?: string;
}) {
  return (
    <div className="relative bg-m3-surface-container rounded-t-md rounded-b-none border-b-2
                    border-m3-outline focus-within:border-m3-primary transition-colors px-4 pt-5 pb-2">
      <label htmlFor={id}
        className="absolute top-1.5 left-4 text-xs font-medium text-m3-on-surface-variant">
        {label}
      </label>
      <input
        id={id} type={type} value={value} autoComplete={autoComplete}
        required={required} minLength={minLength} placeholder={placeholder ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-sm text-m3-on-surface outline-none
                   placeholder-m3-outline font-normal"
      />
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const isPending = loginMutation.isPending || registerMutation.isPending;
  const error =
    (loginMutation.error && extractErrorMessage(loginMutation.error)) ||
    (registerMutation.error && extractErrorMessage(registerMutation.error)) || null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (mode === "login") {
      await loginMutation.mutateAsync({ email, password });
    } else {
      await registerMutation.mutateAsync({ email, password, full_name: fullName });
      await loginMutation.mutateAsync({ email, password });
    }
    navigate("/", { replace: true });
  }

  function switchMode(next: Mode) {
    setMode(next);
    loginMutation.reset();
    registerMutation.reset();
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative flex flex-col w-[393px] h-[851px] overflow-hidden
                      shadow-2xl rounded-[40px] border border-white/10">
        {/* Status bar on primary bg */}
        <div className="bg-m3-primary">
          <StatusBar />
        </div>

        {/* Hero */}
        <div className="bg-m3-primary flex-1 flex flex-col items-center justify-center pb-8 px-6">
          <div className="w-20 h-20 rounded-[28px] bg-white/15 flex items-center justify-center mb-4">
            <span className="text-4xl">🪙</span>
          </div>
          <h1 className="text-3xl font-light text-white tracking-wide">PopNickel</h1>
          <p className="text-indigo-200 text-sm mt-1">Track every dollar, item by item</p>
        </div>

        {/* Bottom sheet */}
        <div className="bg-m3-surface rounded-t-[28px] -mt-7 px-6 pt-7 pb-8 shadow-2xl">
          {/* M3 segmented button */}
          <div className="flex rounded-full border border-m3-outline-variant overflow-hidden mb-6">
            {(["login", "register"] as const).map((m) => (
              <button key={m} type="button" onClick={() => switchMode(m)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors
                  ${mode === m
                    ? "bg-m3-primary-container text-m3-on-primary-container"
                    : "bg-m3-surface text-m3-on-surface-variant hover:bg-m3-surface-container"
                  }`}>
                {m === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-3">
            {mode === "register" && (
              <FilledInput id="fullName" label="Full name" type="text"
                value={fullName} onChange={setFullName} autoComplete="name" required />
            )}
            <FilledInput id="email" label="Email address" type="email"
              value={email} onChange={setEmail} autoComplete="email" required />
            <FilledInput id="password" label="Password" type="password"
              value={password} onChange={setPassword}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required minLength={mode === "register" ? 8 : undefined}
              placeholder={mode === "register" ? "At least 8 characters" : ""} />

            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200
                              rounded-xl px-4 py-3">
                <span className="text-red-500 text-xs mt-0.5">⚠</span>
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}

            {/* M3 Filled button */}
            <div className="pt-2">
              <button type="submit" disabled={isPending}
                className="w-full py-3.5 bg-m3-primary text-m3-on-primary font-medium text-sm
                           rounded-full shadow-sm transition-all active:opacity-80
                           disabled:opacity-40">
                {isPending
                  ? (mode === "login" ? "Signing in…" : "Creating account…")
                  : (mode === "login" ? "Sign in" : "Create account")}
              </button>
            </div>
          </form>

          {/* Home indicator */}
          <div className="flex justify-center mt-6">
            <div className="w-32 h-1 bg-m3-outline-variant rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
