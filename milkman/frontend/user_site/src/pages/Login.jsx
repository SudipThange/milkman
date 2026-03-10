import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { loginRequest, registerRequest } from "../services/auth";
import useAuth from "../hooks/useAuth";
import { getApiErrorMessage } from "../utils/apiError";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const buildUsernameFromEmail = (rawEmail) => {
    const [localPart = ""] = rawEmail.split("@");
    const safeLocalPart = localPart
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, "")
      .slice(0, 48);
    const suffix = Date.now().toString(36);
    return `${safeLocalPart || "user"}_${suffix}`;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (mode === "register" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    if (mode === "login") {
      try {
        const data = await loginRequest(api, { email, password });
        login(data.token);
        const nextPath = location.state?.from || "/";
        navigate(nextPath);
      } catch (err) {
        setError(getApiErrorMessage(err, "Invalid credentials"));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    try {
      const username = buildUsernameFromEmail(email);
      await registerRequest(api, { username, email, password });

      const data = await loginRequest(api, { email, password });
      login(data.token);
      const nextPath = location.state?.from || "/";
      navigate(nextPath);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to register. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <div className="overflow-hidden rounded-3xl border border-softGray/45 bg-paperWhite shadow-soft">
        <div className="grid min-h-[560px] grid-cols-1 md:grid-cols-2">
          <motion.div className="relative min-h-[280px] bg-deepDairyBlue p-8 md:min-h-full" layout transition={{ duration: 0.3 }}>
            <div className="absolute inset-0 bg-freshCoral/18" />
            <div className="relative z-10 flex h-full items-center justify-center text-center md:justify-start md:text-left">
              <div>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.h2
                    key={`left-title-${mode}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22 }}
                    className="text-4xl font-bold text-white"
                  >
                    {mode === "login" ? "Welcome Back" : "Join PuneMilkman"}
                  </motion.h2>
                </AnimatePresence>
                <p className="mt-3 max-w-sm text-white/90">
                  Manage your daily milk deliveries, subscriptions, and orders from one place.
                </p>
              </div>
            </div>
          </motion.div>

          <div className="flex items-center justify-center p-6 md:p-8">
            <div className="w-full max-w-md">
              <AnimatePresence mode="wait" initial={false}>
                <motion.h1
                  key={`right-title-${mode}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                  className="text-center text-3xl font-bold md:text-left"
                >
                  {mode === "login" ? "Login" : "Register"}
                </motion.h1>
              </AnimatePresence>

              <motion.form layout transition={{ duration: 0.25 }} className="mt-6 space-y-4" onSubmit={onSubmit}>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Email"
                  className="w-full rounded-xl border border-softGray/45 bg-paperWhite px-4 py-3 text-pmDeep outline-none transition focus:border-milkBlue focus:ring-4 focus:ring-milkBlue/25"
                  required
                />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="Password"
                  className="w-full rounded-xl border border-softGray/45 bg-paperWhite px-4 py-3 text-pmDeep outline-none transition focus:border-milkBlue focus:ring-4 focus:ring-milkBlue/25"
                  required
                />
              <AnimatePresence initial={false} mode="wait">
                {mode === "register" ? (
                  <motion.div
                    key="confirm-password-wrap"
                    initial={{ opacity: 0, height: 0, y: -6 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -6 }}
                    transition={{ duration: 0.24 }}
                    className="overflow-hidden"
                  >
                    <input
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      type="password"
                      placeholder="Confirm password"
                      className="w-full rounded-xl border border-softGray/45 bg-paperWhite px-4 py-3 text-pmDeep outline-none transition focus:border-milkBlue focus:ring-4 focus:ring-milkBlue/25"
                      required
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {error ? <p className="text-sm text-pmDeep">{error}</p> : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-milkBlue py-3 font-semibold text-paperWhite transition hover:-translate-y-0.5 hover:bg-freshCoral disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:bg-milkBlue"
                >
                  {isSubmitting ? "Please wait..." : mode === "login" ? "Login" : "Register"}
                </button>
              </motion.form>

              <button
                className="mt-4 text-sm text-pmDeep/75 underline"
                type="button"
                onClick={() => setMode((m) => (m === "login" ? "register" : "login"))}
              >
                {mode === "login" ? "New user? Switch to Register" : "Already have an account? Switch to Login"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
