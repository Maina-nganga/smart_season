import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import { Button, FormInput, Alert } from "@/components/common";
import { extractError } from "@/utils/helpers";

 
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) return setError("Email and password are required.");
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (u) => {
    setEmail(u.email);
    setPassword(u.password);
    setError("");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--earth-2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      position: "relative",
      overflow: "hidden",
    }}>
     
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-10%", left: "20%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,158,122,0.12) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "5%", right: "15%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(196,112,74,0.1) 0%, transparent 70%)" }} />
      </div>

      <div
        className="fade-in"
        style={{
          background: "var(--cream)",
          borderRadius: "var(--r-xl)",
          padding: "48px 44px",
          width: "100%", maxWidth: 430,
          position: "relative", zIndex: 1,
          boxShadow: "0 24px 72px rgba(0,0,0,0.45)",
        }}
      >
    
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h1 style={{ fontSize: 26, color: "var(--earth-2)" }}>SmartSeason</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 5 }}>
            Field Monitoring System
          </p>
        </div>

        {error && <Alert type="error">{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <FormInput
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            placeholder="your@email.com"
            required
            autoComplete="email"
          />
          <FormInput
            label="Password"
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            style={{ width: "100%", justifyContent: "center", padding: "13px 20px", marginTop: 4 }}
          >
            Sign In
          </Button>
        </form>

     
        <div style={{
          marginTop: 24,
          background: "var(--cream-2)",
          borderRadius: "var(--r-sm)",
          padding: "14px 16px",
        }}>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.9px", color: "var(--text-muted)", marginBottom: 10 }}>
            Demo Accounts
          </p>         
        </div>
      </div>
    </div>
  );
}
