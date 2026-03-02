import { useState } from "react";
import { loginAdmin } from "../api";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginAdmin({ email, password });
      onLogin({ token: data.token, userId: data.user_id, email });
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-scene">
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />
      <div className="login-orb login-orb-3" />

      <div className="login-stage">
        <div className="login-squiggle sq-1" />
        <div className="login-squiggle sq-2" />
        <div className="login-squiggle sq-3" />

        <div className="login-card login-card-modern">
          <div className="login-brand">PuneMilkman</div>
          <h1 className="login-title">Admin Login</h1>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label login-label">Email</label>
              <input
                id="email"
                type="email"
                className="form-control login-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="username@gmail.com"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label login-label">Password</label>
              <input
                id="password"
                type="password"
                className="form-control login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>

            {error ? <div className="alert alert-danger py-2">{error}</div> : null}

            <button
              type="submit"
              className="btn btn-pm-solid w-100 fw-semibold py-2 login-submit"
              disabled={loading}
            >
              {loading ? "Checking..." : "Sign In"}
            </button>
          </form>
          <p className="login-footnote">Secure admin access only</p>
        </div>
      </div>
    </div>
  );
}
