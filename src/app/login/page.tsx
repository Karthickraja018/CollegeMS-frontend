"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Zap, Loader2, ArrowRight } from "lucide-react"
import { api } from "@/services/api"

/* Hallmark · component: LoginPage · genre: modern-minimal · theme: Quiet
 * states: default · hover · focus · active · disabled · loading · error
 * contrast: pass
 */

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
    const creds: Record<string, { email: string }> = {
      admin: { email: "admin@svcet.ac.in" },
      principal: { email: "principal@svcet.ac.in" },
      hod: { email: "hod.cse@svcet.ac.in" },
    }
    if (creds[role]) {
      setEmail(creds[role].email)
      setPassword("demo123")
    }
  }

  return (
    <div className="min-h-screen flex w-full bg-background selection:bg-primary/20">
      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 z-10 relative">
        <div className="w-full max-w-sm mx-auto space-y-10">
          
          {/* Header */}
          <div className="space-y-3">
            <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center border border-primary/10 shadow-sm mb-6">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Welcome back</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sign in to access the College Management Platform workspace.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground/80 tracking-wide uppercase" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@svcet.ac.in"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full h-11 px-3 bg-transparent border border-input rounded-lg text-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground/80 tracking-wide uppercase" htmlFor="password">
                    Password
                  </label>
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full h-11 px-3 bg-transparent border border-input rounded-lg text-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive font-medium flex items-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-primary text-primary-foreground font-medium rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Demo Helpers */}
          <div className="pt-8 mt-8 border-t border-border/50">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest mb-4">
              Demo Credentials
            </p>
            <div className="grid grid-cols-3 gap-2">
              {["admin", "principal", "hod"].map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => fillDemo(role)}
                  className="h-9 px-3 rounded-md bg-secondary/50 text-secondary-foreground text-xs font-medium border border-border/50 hover:border-primary/30 hover:bg-secondary transition-all capitalize"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Brand Side (Desktop) */}
      <div className="hidden lg:flex flex-1 relative bg-zinc-950 overflow-hidden border-l border-border/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-950 to-zinc-950" />
        
        {/* Abstract Pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 p-24 flex flex-col justify-between h-full w-full max-w-2xl text-zinc-400">
          <div className="space-y-4 mt-auto">
            <blockquote className="text-2xl font-light text-zinc-100 leading-snug">
              "A comprehensive operating system for modern academic institutions. Every workflow, streamlined."
            </blockquote>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-[1px] bg-zinc-700" />
              <span>CollegeMS Platform v1.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
