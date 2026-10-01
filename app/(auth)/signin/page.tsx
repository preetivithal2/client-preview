// app/signin/page.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "../../lib/auth";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      // Set session cookie for middleware
      document.cookie = "session=true; path=/; max-age=86400; SameSite=Lax";
      router.push("/");
    } catch (err: any) {
      const code = err.code as string;
      if (code === "auth/user-not-found" || code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else if (code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError("Failed to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--clr-bg-page)] p-4">
      <div className="max-w-5xl w-full bg-[var(--clr-bg-card)] rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2">

        {/* Left: Sign In Form */}
        <div className="p-8 md:p-12">
          <h2 className="text-2xl font-bold text-[var(--clr-text-body)] mb-1">Welcome back!</h2>
          <p className="text-sm text-[var(--clr-text-secondary)] mb-6">Please login to your account.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--clr-text-body)] mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="abc@gmail.com"
                className="w-full px-4 py-3 rounded-lg border-[var(--clr-border)] bg-[var(--clr-bg-input)] text-[var(--clr-text-body)] placeholder-[var(--clr-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-bg-accent)] focus:border-transparent transition cursor-text"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--clr-text-body)] mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border-[var(--clr-border)] bg-[var(--clr-bg-input)] text-[var(--clr-text-body)] placeholder-[var(--clr-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-bg-accent)] focus:border-transparent transition cursor-text"
                disabled={loading}
                required
              />
            </div>

            {/* Error message */}
            {error && (
              <p className="text-sm text-[var(--clr-text-red)] font-medium">{error}</p>
            )}

            <div className="flex justify-end text-sm">
              <a href="#" className="text-[var(--clr-text-accent-gold)] hover:underline font-medium cursor-pointer">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[var(--clr-bg-accent)] hover:bg-[var(--clr-bg-accent-hover)] text-[var(--clr-text-on-accent)] font-semibold rounded-lg shadow-md transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="text-center text-sm text-[var(--clr-text-secondary)] mt-6">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="text-[var(--clr-text-accent-gold)] font-semibold hover:underline cursor-pointer">
              Sign Up
            </a>
          </p>
        </div>

        {/* Right: Ship Image */}
        <div className="relative min-h-[300px] md:min-h-full bg-[var(--clr-bg-page)] hidden md:block">
          <Image
            src="/ship.jpg"
            alt="Cruise ship at sea"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </div>
  );
}
