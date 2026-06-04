import Link from "next/link";
import Image from "next/image";
import { Button, buttonVariants } from "@/components/ui/button";
import { 
  ArrowRight, BarChart3, BrainCircuit, CheckCircle2, 
  ChevronRight, Database, LineChart, MessageSquare, 
  Network, ShieldAlert, Sparkles, Target, Users, Zap, LayoutDashboard, Search
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/Axivora-logo.png" alt="Axivora Logo" width={32} height={32} className="rounded-sm" />
            <span className="font-semibold text-lg tracking-tight">Axivora</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#platform" className="hover:text-foreground transition-colors">Platform</Link>
            <Link href="#solutions" className="hover:text-foreground transition-colors">Solutions</Link>
            <Link href="#resources" className="hover:text-foreground transition-colors">Resources</Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Sign in</Link>
            <Link href="/login" className={buttonVariants()}>Request Demo</Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* SECTION 1: HERO */}
        <section className="relative pt-24 pb-32 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              <span>Introducing Axivora Intelligence Platform</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-balance">
              Transform institutional data into actionable intelligence.
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto text-balance">
              Monitor academic performance, predict risks, automate reporting, empower leadership, and improve outcomes using AI.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8">
                Request Demo <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-12 px-8">
                Watch Platform Tour
              </Button>
            </div>
          </div>
          {/* Dashboard Mockup Visual */}
          <div className="container mx-auto px-4 mt-16">
            <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden aspect-video relative max-w-5xl mx-auto flex flex-col">
               <div className="h-12 border-b border-border flex items-center px-4 gap-2 bg-muted/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-border" />
                    <div className="w-3 h-3 rounded-full bg-border" />
                    <div className="w-3 h-3 rounded-full bg-border" />
                  </div>
                  <div className="mx-auto w-1/3 h-6 bg-background rounded-md border border-border flex items-center px-2">
                    <Search className="w-3 h-3 text-muted-foreground" />
                  </div>
               </div>
               <div className="flex-1 p-6 grid grid-cols-4 gap-6 bg-background/50">
                  <div className="col-span-1 flex flex-col gap-4">
                     <div className="h-24 rounded-lg bg-card border border-border p-4 flex flex-col justify-between">
                       <div className="text-xs text-muted-foreground">Institution Health Score</div>
                       <div className="text-2xl font-bold text-primary">94.2%</div>
                     </div>
                     <div className="flex-1 rounded-lg bg-card border border-border p-4 flex flex-col gap-3">
                       <div className="text-xs font-medium">Risk Predictions</div>
                       {[1,2,3].map(i => (
                         <div key={i} className="h-10 rounded-md bg-muted/50 border border-border" />
                       ))}
                     </div>
                  </div>
                  <div className="col-span-3 flex flex-col gap-4">
                     <div className="h-48 rounded-lg bg-card border border-border p-4 flex flex-col justify-between">
                        <div className="text-xs font-medium">Department Analytics</div>
                        <div className="flex items-end gap-2 h-32 mt-4">
                          {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                             <div key={i} className="flex-1 bg-primary/20 rounded-t-sm" style={{ height: `${h}%` }}>
                               <div className="w-full bg-primary rounded-t-sm transition-all duration-500" style={{ height: '4px' }} />
                             </div>
                          ))}
                        </div>
                     </div>
                     <div className="flex-1 grid grid-cols-2 gap-4">
                        <div className="rounded-lg bg-card border border-border p-4">
                           <div className="text-xs font-medium mb-3">AI Executive Summary</div>
                           <div className="space-y-2">
                             <div className="h-2 bg-muted rounded w-full" />
                             <div className="h-2 bg-muted rounded w-5/6" />
                             <div className="h-2 bg-muted rounded w-4/6" />
                           </div>
                        </div>
                        <div className="rounded-lg bg-card border border-border p-4">
                           <div className="text-xs font-medium mb-3">Recent Actions</div>
                           <div className="space-y-2">
                             <div className="h-8 bg-muted/30 rounded-md" />
                             <div className="h-8 bg-muted/30 rounded-md" />
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: TRUSTED INTELLIGENCE */}
        <section className="py-20 border-y border-border bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 text-sm font-medium text-muted-foreground uppercase tracking-widest">
              Trusted by Forward-Thinking Institutions
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-border">
              <div className="flex flex-col items-center justify-center">
                <div className="text-4xl font-bold text-primary mb-2">1000+</div>
                <div className="text-sm font-medium text-muted-foreground">Students Managed</div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="text-4xl font-bold text-primary mb-2">50+</div>
                <div className="text-sm font-medium text-muted-foreground">Departments Monitored</div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="text-4xl font-bold text-primary mb-2">95%</div>
                <div className="text-sm font-medium text-muted-foreground">Reporting Efficiency</div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <div className="text-sm font-medium text-muted-foreground">AI Intelligence</div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: THE PROBLEM */}
        <section id="problem" className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">Most institutions operate using fragmented data.</h2>
              <p className="text-muted-foreground text-lg">
                Traditional systems fail to provide actionable insights, leaving leadership to rely on reactive decision-making rather than proactive strategy.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="bg-destructive/5 border border-destructive/10 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <ShieldAlert className="w-6 h-6 text-destructive" />
                  <h3 className="text-xl font-semibold">The Old Way</h3>
                </div>
                <ul className="space-y-4">
                  {["Unnoticed attendance issues", "Unexplained performance decline", "Manual, time-consuming reports", "Delayed executive decisions", "Accreditation data challenges", "Complete lack of visibility"].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-destructive" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-semibold">With Axivora</h3>
                </div>
                <ul className="space-y-4">
                  {["Predictive risk monitoring", "Real-time academic insights", "One-click automated reporting", "AI-driven strategic recommendations", "Streamlined accreditation compliance", "Unified institutional intelligence"].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-foreground font-medium">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: ARCHITECTURE LAYER */}
        <section className="py-24 bg-card border-y border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-16">The Axivora Intelligence Layer</h2>
            <div className="flex flex-col items-center justify-center max-w-4xl mx-auto">
              <div className="w-64 py-4 px-6 bg-background border border-border rounded-lg shadow-sm font-medium flex items-center justify-center gap-2">
                <Database className="w-5 h-5 text-muted-foreground" /> Institution Data
              </div>
              <div className="h-12 w-px bg-border my-2" />
              <div className="w-80 py-6 px-8 bg-primary text-primary-foreground rounded-xl shadow-lg font-bold text-lg flex items-center justify-center gap-3">
                <BrainCircuit className="w-6 h-6" /> AI Intelligence Engine
              </div>
              <div className="h-12 w-px bg-border my-2" />
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full">
                {["Insights", "Predictions", "Reports", "Recommendations", "Actions"].map((item, i) => (
                  <div key={i} className="py-3 px-4 bg-background border border-border rounded-lg text-sm font-medium shadow-sm">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: CORE MODULES */}
        <section id="platform" className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">Core Platform Modules</h2>
              <p className="text-muted-foreground text-lg">Everything you need to run a smart institution.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Executive Intelligence", icon: Target, desc: "Institution health monitoring, AI executive summaries, and strategic recommendations." },
                { title: "Department Intelligence", icon: Network, desc: "Department performance tracking, faculty monitoring, and comparative risk analysis." },
                { title: "Student Intelligence", icon: Users, desc: "Predictive risk modeling, academic monitoring, and early intervention planning." },
                { title: "Faculty Intelligence", icon: LayoutDashboard, desc: "Compliance tracking, performance analytics, and research monitoring." },
                { title: "Communication Center", icon: MessageSquare, desc: "AI-powered communications, automated notifications, and institution-wide messaging." },
                { title: "Institutional Reports", icon: BarChart3, desc: "One-click report generation for accreditation, departments, and executive summaries." }
              ].map((mod, i) => (
                <div key={i} className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors group">
                  <mod.icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{mod.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{mod.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 6: AI COPILOT */}
        <section className="py-24 bg-muted/30 border-y border-border overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Meet your AI Copilot</h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Ask questions in plain English. Get instant, data-backed insights, predictions, and reports generated on the fly.
                </p>
                <div className="space-y-4">
                  {["Which department needs attention?", "Show students at risk of dropping out.", "Generate an executive report for this month.", "Compare CSE and ECE performance.", "Predict semester pass percentage."].map((q, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background cursor-pointer hover:border-primary/50 transition-colors">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{q}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="rounded-xl border border-border bg-card shadow-xl p-6 relative z-10">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <BrainCircuit className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div className="font-medium">Axivora Intelligence</div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-muted p-4 rounded-lg rounded-tr-none ml-12 text-sm">
                      Compare CSE and ECE performance.
                    </div>
                    <div className="bg-primary/5 border border-primary/10 p-4 rounded-lg rounded-tl-none mr-12 space-y-4">
                      <p className="text-sm">Based on current semester data, here is the comparison:</p>
                      <div className="flex items-end gap-4 h-24 pt-4">
                        <div className="flex-1 flex items-end gap-2">
                          <div className="w-full bg-primary/40 rounded-t-sm h-[70%]" />
                          <div className="w-full bg-primary rounded-t-sm h-[85%]" />
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground flex justify-between">
                        <span>CSE: 85% Pass Rate</span>
                        <span>ECE: 70% Pass Rate</span>
                      </div>
                      <p className="text-xs font-medium text-primary mt-2">
                        Recommendation: Initiate early intervention program for ECE 2nd-year students.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/0 blur-2xl -z-10 rounded-xl" />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: PREDICTIVE INTELLIGENCE */}
        <section className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">Predictive Intelligence</h2>
              <p className="text-muted-foreground text-lg">Identify risks before they become problems.</p>
            </div>
            <div className="grid md:grid-cols-5 gap-4">
              {[
                { title: "Dropout Risk", val: "High Alert", color: "text-destructive", bg: "bg-destructive/10" },
                { title: "Attendance Risk", val: "Monitored", color: "text-amber-500", bg: "bg-amber-500/10" },
                { title: "Failure Risk", val: "Decreasing", color: "text-green-500", bg: "bg-green-500/10" },
                { title: "Department Risk", val: "Stable", color: "text-primary", bg: "bg-primary/10" },
                { title: "Institution Risk", val: "Low", color: "text-green-500", bg: "bg-green-500/10" }
              ].map((stat, i) => (
                <div key={i} className="p-5 rounded-xl border border-border bg-card text-center">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">{stat.title}</h4>
                  <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${stat.bg} ${stat.color}`}>
                    {stat.val}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 8: ROLE-BASED */}
        <section className="py-24 bg-card border-y border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">Built For Every Leadership Role</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { role: "Principal", suite: "Executive Intelligence", desc: "Top-level health metrics, accreditation prep, and strategic AI summaries." },
                { role: "HOD", suite: "Department Intelligence", desc: "Curriculum tracking, faculty performance, and cohort risk analysis." },
                { role: "Faculty", suite: "Academic Operations", desc: "Automated grading insights, attendance patterns, and student intervention." },
                { role: "Admin", suite: "Platform Management", desc: "System configuration, user management, and automated workflows." }
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-xl border border-border bg-background">
                  <h3 className="text-xl font-bold mb-1">{item.role}</h3>
                  <div className="text-sm font-medium text-primary mb-4">{item.suite}</div>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 9: AI COMMUNICATION CENTER */}
        <section className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1 border border-border rounded-xl p-8 bg-muted/20 relative">
                <div className="absolute top-4 right-4"><Sparkles className="w-5 h-5 text-primary" /></div>
                <div className="space-y-4">
                  <div className="p-4 bg-card border border-border rounded-lg shadow-sm flex items-center justify-between">
                    <span className="text-sm font-medium">Generate emails to at-risk students</span>
                    <Button size="sm" variant="secondary">Run</Button>
                  </div>
                  <div className="p-4 bg-card border border-border rounded-lg shadow-sm flex items-center justify-between">
                    <span className="text-sm font-medium">Schedule review meetings for ECE</span>
                    <Button size="sm" variant="secondary">Run</Button>
                  </div>
                  <div className="p-4 bg-card border border-border rounded-lg shadow-sm flex items-center justify-between">
                    <span className="text-sm font-medium">Notify departments of accreditation</span>
                    <Button size="sm" variant="secondary">Run</Button>
                  </div>
                  <div className="p-4 bg-card border border-border rounded-lg shadow-sm flex items-center justify-between">
                    <span className="text-sm font-medium">Send fee reminders</span>
                    <Button size="sm" variant="secondary">Run</Button>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-3xl font-bold mb-6">AI Communication Center</h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Automate the tedious parts of administration. Axivora drafts, schedules, and tracks communications based on triggered intelligence insights.
                </p>
                <Button variant="outline">Explore Communication Workflows</Button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 10: INSTITUTIONAL DASHBOARD (Hero Visual Replica) */}
        <section className="py-32 bg-slate-950 text-slate-50 border-y border-slate-800 text-center relative overflow-hidden">
           <div className="container mx-auto px-4 relative z-10">
             <h2 className="text-4xl font-bold mb-6 text-white">The Ultimate Intelligence Dashboard</h2>
             <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-12">
               A unified command center for academic excellence. Every metric, prediction, and report, perfectly organized.
             </p>
             <div className="max-w-4xl mx-auto border border-slate-800 rounded-xl bg-slate-900/50 backdrop-blur p-2 shadow-2xl">
               <div className="rounded-lg border border-slate-800 bg-slate-900 overflow-hidden aspect-[16/9] flex items-center justify-center">
                 <div className="text-slate-500 font-medium flex items-center gap-2">
                   <LayoutDashboard className="w-5 h-5" />
                   Interactive Dashboard Preview Module
                 </div>
               </div>
             </div>
           </div>
        </section>

        {/* SECTION 11: TESTIMONIALS */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-16">Trusted by Leaders</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-8 rounded-xl bg-card border border-border shadow-sm">
                  <div className="flex gap-1 text-primary mb-4 justify-center">
                    {[1,2,3,4,5].map(star => <div key={star} className="w-4 h-4 bg-primary mask-star" style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'}} />)}
                  </div>
                  <p className="text-muted-foreground italic mb-6">"Placeholder testimonial highlighting the impact of AI on institutional decision making."</p>
                  <div className="text-sm font-bold">Academic Dean</div>
                  <div className="text-xs text-muted-foreground">Engineering College</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 12: PRICING */}
        <section id="pricing" className="py-24 border-y border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Simple, Scalable Pricing</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-16">
              Plans designed to scale with your institution's intelligence needs.
            </p>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {['Starter', 'Professional', 'Enterprise'].map((tier, i) => (
                <div key={tier} className={`p-8 rounded-xl border ${i === 1 ? 'border-primary ring-1 ring-primary shadow-lg relative' : 'border-border bg-card'}`}>
                  {i === 1 && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold tracking-wider">RECOMMENDED</div>}
                  <h3 className="text-xl font-bold mb-2">{tier}</h3>
                  <div className="text-muted-foreground text-sm mb-6">For {tier === 'Starter' ? 'small departments' : tier === 'Professional' ? 'growing colleges' : 'large universities'}</div>
                  <div className="text-3xl font-bold mb-8">Custom</div>
                  <ul className="space-y-4 mb-8 text-sm text-left">
                    {['Core Analytics', 'AI Copilot Access', 'Automated Reports', 'API Integration', 'Dedicated Success Manager'].slice(0, i + 3).map((feat, j) => (
                      <li key={j} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" /> {feat}
                      </li>
                    ))}
                  </ul>
                  <Button variant={i === 1 ? 'default' : 'outline'} className="w-full">Contact Sales</Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 13: CTA */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 -z-10" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
            <h2 className="text-4xl font-bold mb-6">Ready to transform academic decision making?</h2>
            <p className="text-xl text-muted-foreground mb-10">
              Join leading institutions using Axivora to unlock the power of academic intelligence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8">Request Demo</Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 bg-background">Contact Sales</Button>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-card border-t border-border pt-16 pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Image src="/Axivora-logo.png" alt="Axivora Logo" width={24} height={24} className="rounded-sm" />
                <span className="font-semibold tracking-tight">Axivora</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-sm">
                AI-Powered Academic Intelligence Platform. Transform institutional data into actionable intelligence.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Executive Intelligence</Link></li>
                <li><Link href="#" className="hover:text-foreground">Department Intelligence</Link></li>
                <li><Link href="#" className="hover:text-foreground">Student Intelligence</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Documentation</Link></li>
                <li><Link href="#" className="hover:text-foreground">API Reference</Link></li>
                <li><Link href="#" className="hover:text-foreground">Case Studies</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">About</Link></li>
                <li><Link href="#" className="hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Axivora. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="#" className="hover:text-foreground">Twitter</Link>
              <Link href="#" className="hover:text-foreground">LinkedIn</Link>
              <Link href="#" className="hover:text-foreground">GitHub</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
