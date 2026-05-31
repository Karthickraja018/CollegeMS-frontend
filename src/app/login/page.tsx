"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Zap, Loader2 } from "lucide-react"
import { api } from "@/services/api"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await api.post("/auth/login", { email, password })
      localStorage.setItem("access_token", res.data.access_token)
      localStorage.setItem("user", JSON.stringify(res.data.user))
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid credentials. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (role: string) => {
    const creds: Record<string, { email: string; password: string }> = {
      admin: { email: "admin@college.edu", password: "Admin@123" },
      principal: { email: "principal@college.edu", password: "Principal@123" },
      hod: { email: "hod.cse@college.edu", password: "Hod@123" },
    }
    if (creds[role]) {
      setEmail(creds[role].email)
      setPassword(creds[role].password)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: "linear-gradient(135deg, #6366F1, #14B8A6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 8px 24px rgba(99,102,241,0.3)",
          }}>
            <Zap size={24} color="white" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>CollegeMS</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>AI-Powered Management Platform</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Email</label>
            <input
              id="login-email"
              className="input"
              type="email"
              placeholder="your@college.edu"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Password</label>
            <input
              id="login-password"
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, fontSize: 13, color: "#F87171", marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button id="login-submit" className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "11px" }}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {/* Demo credentials */}
        <div style={{ marginTop: 24, padding: "14px 16px", background: "var(--bg-elevated)", borderRadius: 10, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Demo Credentials
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["admin", "principal", "hod"].map(role => (
              <button key={role} onClick={() => fillDemo(role)} style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 6, padding: "5px 12px", fontSize: 12,
                color: "var(--text-secondary)", cursor: "pointer", textTransform: "capitalize",
                transition: "all 0.15s",
              }}
                onMouseEnter={e => { (e.target as any).style.borderColor = "var(--indigo)"; (e.target as any).style.color = "var(--text-primary)" }}
                onMouseLeave={e => { (e.target as any).style.borderColor = "var(--border)"; (e.target as any).style.color = "var(--text-secondary)" }}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
