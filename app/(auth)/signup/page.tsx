"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signUp } from "../../lib/auth";

export default function SignUpPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your first and last name.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, `${firstName.trim()} ${lastName.trim()}`);
      router.push("/signin");
    } catch (err: any) {
      const code = err.code as string;
      if (code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else if (code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (code === "auth/weak-password") {
        setError("Password must be at least 6 characters.");
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-lg border-[var(--clr-border)] bg-[var(--clr-bg-input)] text-[var(--clr-text-body)] placeholder-[var(--clr-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--clr-bg-accent)] focus:border-transparent transition cursor-text";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--clr-bg-page)] p-4">
      <div className="max-w-5xl w-full bg-[var(--clr-bg-card)] rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2">
        <div className="p-8 md:p-12">
          <h2 className="text-2xl font-bold text-[var(--clr-text-body)] mb-1">Create Account</h2>
          <p className="text-sm text-[var(--clr-text-secondary)] mb-6">Sign up to get started.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name + Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-[var(--clr-text-body)] mb-1">First Name</label>
                <input id="firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John" className={inputClass} disabled={loading} required />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-[var(--clr-text-body)] mb-1">Last Name</label>
                <input id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe" className={inputClass} disabled={loading} required />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--clr-text-body)] mb-1">Email Address</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="abc@gmail.com" className={inputClass} disabled={loading} required />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--clr-text-body)] mb-1">Password</label>
              <div className="relative">
                <input id="password" type={showPassword ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                  className={`${inputClass} pr-10`} disabled={loading} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--clr-text-muted)] hover:text-[var(--clr-text-body)] transition cursor-pointer">
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--clr-text-body)] mb-1">Confirm Password</label>
              <div className="relative">
                <input id="confirmPassword" type={showConfirm ? "text" : "password"} value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••"
                  className={`${inputClass} pr-10`} disabled={loading} required />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--clr-text-muted)] hover:text-[var(--clr-text-body)] transition cursor-pointer">
                  {showConfirm ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-[var(--clr-text-red)] font-medium">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-[var(--clr-bg-accent)] hover:bg-[var(--clr-bg-accent-hover)] text-[var(--clr-text-on-accent)] font-semibold rounded-lg shadow-md transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-sm text-[var(--clr-text-secondary)] mt-6">
            Already have an account?{" "}
            <a href="/signin" className="text-[var(--clr-text-accent-gold)] font-semibold hover:underline cursor-pointer">
              Sign In
            </a>
          </p>
        </div>

        <div className="relative min-h-[300px] md:min-h-full bg-[var(--clr-bg-page)] hidden md:block">
          <Image src="/ship.jpg" alt="Cruise ship at sea" fill className="object-cover" priority />
        </div>
      </div>
    </div>
  );
}
