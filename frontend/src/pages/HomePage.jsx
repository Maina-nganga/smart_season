import {useState , useEffect} from 'react';
import {Link} from "react-router-dom";
import {
  Leaf, Sprout, Sun, Wheat, CheckCircle2, ArrowRight, Layers,
  Users, TrendingUp, AlertTriangle, Menu, X,
} from "lucide-react";


const STAGES = [
  { name: "Planted",   icon: Sprout,      color: "#5C4A32", bg: "#F0EBE0" },
  { name: "Growing",   icon: Leaf,        color: "#2D5E1A", bg: "#EDF5E8" },
  { name: "Ready",     icon: Sun,         color: "#7A5500", bg: "#FDF5E0" },
  { name: "Harvested", icon: CheckCircle2, color: "#1A3A6B", bg: "#E8EFF8" },
];


const CAPABILITY_STATS = [
  { value: "4",    label: "growth stages tracked, Planted through Harvested" },
  { value: "3",    label: "field statuses monitored — Active, At Risk, Completed" },
  { value: "Live", label: "flags raised the moment a field falls behind" },
  { value: "1",    label: "dashboard covering every agent and every field" },
];


const FEATURES = [
  {
    icon: Layers,
    title: "Field records",
    body: "Log every field with its crop, size, location and the agent responsible — organized in one place instead of scattered across spreadsheets.",
    accent: "var(--sage-2)",
  },

   {
    icon: Sprout,
    title: "Stage tracking",
    body: "Move each field through Planted, Growing, Ready and Harvested, with progress visible at a glance for every crop you're running.",
    accent: "var(--terracotta)",
  },
  {
    icon: AlertTriangle,
    title: "Risk alerts",
    body: "Fields that fall behind schedule are marked At Risk automatically, so problems surface early instead of showing up at harvest.",
    accent: "var(--amber-2)",
  },
  {
    icon: Users,
    title: "Agent oversight",
    body: "Assign fields to agents and see each agent's workload — active, at risk and completed — broken down in a single card.",
    accent: "var(--earth)",
  },
];



const STEPS = [
  {
    n: "01",
    title: "Add a field",
    body: "Record its location, crop type, size and the agent who owns it.",
  },
  {
    n: "02",
    title: "Track its stage",
    body: "Move it through Planted → Growing → Ready → Harvested as the season progresses.",
  },
  {
    n: "03",
    title: "Act on what changes",
    body: "Status shifts to At Risk the moment a field needs attention — no need to go looking for it.",
  },
]; 


export default function Homepage(){
    const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <div style={{ background: "var(--cream)", overflowX: "hidden" }}>
      <style>{`
        @keyframes marker-travel {
          0%, 20%  { left: 2%;  }
          25%, 45% { left: 27%; }
          50%, 70% { left: 52%; }
          75%, 95% { left: 77%; }
          100%     { left: 2%;  }
        }
        @keyframes drift {
          0%, 100% { transform: translate(0, 0); }
          50%      { transform: translate(-14px, 18px); }
        }
        .hs-link { position: relative; color: var(--text-secondary); font-size: 14px; font-weight: 500; }
        .hs-link:hover { color: var(--text-primary); text-decoration: none; }
        .hs-feature-card { transition: box-shadow .2s ease, transform .2s ease; }
        .hs-feature-card:hover { box-shadow: var(--shadow-md); transform: translateY(-3px); }
        .hs-cta-primary { transition: background .18s ease, transform .1s ease; }
        .hs-cta-primary:hover { background: var(--sage-3) !important; }
        .hs-cta-primary:active { transform: scale(0.98); }
        .hs-cta-ghost:hover { background: var(--cream-2) !important; }
        @media (max-width: 900px) {
          .hs-hero-grid { grid-template-columns: 1fr !important; }
          .hs-hero-visual { order: -1; }
        }
        @media (max-width: 760px) {
          .hs-nav-links { display: none !important; }
          .hs-nav-burger { display: flex !important; }
        }
        @media (max-width: 640px) {
          .hs-stats-grid { grid-template-columns: 1fr 1fr !important; }
          .hs-features-grid { grid-template-columns: 1fr !important; }
          .hs-steps-grid { grid-template-columns: 1fr !important; }
          .hs-persona-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <Nav mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <Hero mounted={mounted} />
      <StatsBand />
      <Features />
      <HowItWorks />
      <Personas />
      <FinalCta />
      <Footer />
    </div>
  );
}
function Logo() {
  return (
    <Link to="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
      <div style={{
        width: 32, height: 32, borderRadius: "var(--r-sm)",
        background: "var(--sage-2)", display: "flex", alignItems: "center",
        justifyContent: "center", flexShrink: 0,
      }}>
        <Leaf size={18} color="#fff" />
      </div>
      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, fontWeight: 600, color: "var(--text-primary)" }}>
        SmartSeason
      </span>
    </Link>
  );
}

function Nav({ mobileOpen, setMobileOpen }) {
  const links = [
    { label: "Overview", href: "#overview" },
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
  ];
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 40,
      background: "rgba(250,248,243,0.9)", backdropFilter: "blur(8px)",
      borderBottom: "1px solid var(--mist)",
    }}>
      <div style={{
        maxWidth: 1180, margin: "0 auto", padding: "14px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Logo />

        <nav className="hs-nav-links" style={{ display: "flex", alignItems: "center", gap: 30 }}>
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hs-link">{l.label}</a>
          ))}
        </nav>

        <div className="hs-nav-links" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link to="/login" className="hs-link" style={{ padding: "8px 6px" }}>Sign in</Link>
          <Link
            to="/login"
            className="hs-cta-primary"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "var(--sage-2)", color: "#fff", fontSize: 14, fontWeight: 500,
              padding: "9px 18px", borderRadius: "var(--r-sm)", textDecoration: "none",
            }}
          >
            Get started <ArrowRight size={14} />
          </Link>
        </div>

        <button
          className="hs-nav-burger"
          onClick={() => setMobileOpen((v) => !v)}
          style={{ display: "none", width: 36, height: 36, alignItems: "center", justifyContent: "center", color: "var(--text-primary)" }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="fade-in" style={{ borderTop: "1px solid var(--mist)", padding: "14px 24px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hs-link" onClick={() => setMobileOpen(false)}>{l.label}</a>
          ))}
          <Link to="/login" className="hs-link">Sign in</Link>
          <Link
            to="/login"
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
              background: "var(--sage-2)", color: "#fff", fontSize: 14, fontWeight: 500,
              padding: "10px 18px", borderRadius: "var(--r-sm)", textDecoration: "none",
            }}
          >
            Get started <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </header>
  );
}
function Hero({ mounted }) {
  return (
    <section id="overview" style={{ position: "relative", padding: "76px 24px 90px", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{
          position: "absolute", top: "-8%", right: "-6%", width: 420, height: 420,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(139,158,122,0.16) 0%, transparent 70%)",
          animation: "drift 14s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", bottom: "-10%", left: "-8%", width: 360, height: 360,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(196,112,74,0.12) 0%, transparent 70%)",
          animation: "drift 18s ease-in-out infinite reverse",
        }} />
      </div>

      <div
        className="hs-hero-grid"
        style={{
          maxWidth: 1180, margin: "0 auto", position: "relative",
          display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 56, alignItems: "center",
        }}
      >
        <div className={mounted ? "fade-in" : ""}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 13px",
            borderRadius: 20, background: "var(--cream-2)", border: "1px solid var(--mist-2)",
            fontSize: 12, fontWeight: 600, letterSpacing: "0.6px", textTransform: "uppercase",
            color: "var(--sage-3)", marginBottom: 22,
          }}>
            <Sprout size={13} /> Field monitoring, season to season
          </div>

          <h1 style={{ fontSize: "clamp(34px, 4.6vw, 52px)", lineHeight: 1.12, marginBottom: 20, letterSpacing: "-0.5px" }}>
            Every field, tracked<br />from seed to harvest.
          </h1>

          <p style={{ fontSize: 17, color: "var(--text-secondary)", maxWidth: 480, lineHeight: 1.65, marginBottom: 32 }}>
            SmartSeason gives your agents one clear view of every field's stage, status and risk —
            so nothing slips through between planting and harvest.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link
              to="/login"
              className="hs-cta-primary"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "var(--sage-2)", color: "#fff", fontSize: 15, fontWeight: 500,
                padding: "13px 26px", borderRadius: "var(--r-sm)", textDecoration: "none",
              }}
            >
              Get started <ArrowRight size={16} />
            </Link>
            <a
              href="#how-it-works"
              className="hs-cta-ghost"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "var(--white)", color: "var(--text-primary)", fontSize: 15, fontWeight: 500,
                padding: "13px 26px", borderRadius: "var(--r-sm)", textDecoration: "none",
                border: "1px solid var(--mist)",
              }}
            >
              See how it works
            </a>
          </div>
        </div>

        <div className={`hs-hero-visual ${mounted ? "slide-in" : ""}`}>
          <FieldLifecycleCard />
        </div>
      </div>
    </section>
  );
}

function FieldLifecycleCard() {
  return (
    <div style={{
      background: "var(--white)", borderRadius: "var(--r-xl)", border: "1px solid var(--mist)",
      boxShadow: "var(--shadow-xl)", padding: "26px 26px 22px", position: "relative",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--text-muted)" }}>
            Field Lifecycle
          </p>
          <h3 style={{ fontSize: 17, marginTop: 3 }}>North Ridge — Maize</h3>
        </div>
        <Wheat size={22} color="var(--amber-2)" />
      </div>

      {/* stage track */}
      <div style={{ position: "relative", marginBottom: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
          {STAGES.map((s) => (
            <div key={s.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: 60 }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%", background: s.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <s.icon size={18} color={s.color} />
              </div>
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>{s.name}</span>
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", top: 20, left: 30, right: 30, height: 2, background: "var(--mist)", zIndex: 0 }} />
        <div style={{
          position: "absolute", top: 12, width: 16, height: 16, borderRadius: "50%",
          background: "var(--terracotta)", border: "3px solid var(--white)", boxShadow: "0 0 0 2px var(--terracotta)",
          zIndex: 2, animation: "marker-travel 9s ease-in-out infinite",
        }} />
      </div>

      {/* status chips, mirrors the in-app agent card */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {[
          { label: "Active", count: 18, bg: "var(--success-bg)", color: "var(--success-text)" },
          { label: "At Risk", count: 3, bg: "var(--warning-bg)", color: "var(--warning-text)" },
          { label: "Completed", count: 11, bg: "var(--info-bg)", color: "var(--info-text)" },
        ].map((c) => (
          <div key={c.label} style={{ textAlign: "center", background: c.bg, borderRadius: "var(--r-sm)", padding: "10px 6px" }}>
            <div style={{ fontSize: 20, fontFamily: "'Playfair Display', serif", fontWeight: 600, color: c.color }}>{c.count}</div>
            <div style={{ fontSize: 10, color: c.color, opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.4px" }}>{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsBand() {
  return (
    <section style={{ background: "var(--earth-2)", padding: "44px 24px" }}>
      <div
        className="hs-stats-grid"
        style={{
          maxWidth: 1180, margin: "0 auto", display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)", gap: 0,
        }}
      >
        {CAPABILITY_STATS.map((s, i) => (
          <div
            key={s.label}
            style={{
              padding: "6px 24px",
              borderLeft: i === 0 ? "none" : "1px solid rgba(255,255,255,0.12)",
              textAlign: i === 0 ? "left" : "center",
            }}
          >
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 600, color: "var(--amber)" }}>
              {s.value}
            </div>
            <div style={{ fontSize: 13, color: "rgba(250,248,243,0.75)", marginTop: 4, lineHeight: 1.45 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" style={{ padding: "88px 24px", maxWidth: 1180, margin: "0 auto" }}>
      <SectionHeading
        eyebrow="Features"
        title="Built around how fields actually move"
        sub="Not a generic dashboard bolted onto a spreadsheet — SmartSeason is shaped by the stages a real field goes through."
      />

      <div className="hs-features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginTop: 44 }}>
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="hs-feature-card"
            style={{
              background: "var(--white)", borderRadius: "var(--r-lg)", border: "1px solid var(--mist)",
              boxShadow: "var(--shadow-sm)", overflow: "hidden",
            }}
          >
            <div style={{ height: 5, background: f.accent }} />
            <div style={{ padding: "22px 20px 24px" }}>
              <div style={{
                width: 40, height: 40, borderRadius: "var(--r-sm)", background: "var(--cream-2)",
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
              }}>
                <f.icon size={19} color={f.accent} />
              </div>
              <h3 style={{ fontSize: 16, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6 }}>{f.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
function HowItWorks() {
  return (
    <section id="how-it-works" style={{ background: "var(--cream-2)", padding: "88px 24px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <SectionHeading
          eyebrow="How it works"
          title="From first planting to final harvest"
          sub="Three steps, repeated for every field, every season."
        />

        <div className="hs-steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28, marginTop: 44 }}>
          {STEPS.map((s, i) => (
            <div key={s.n} style={{ position: "relative", paddingLeft: 4 }}>
              <div style={{
                fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 600,
                color: "var(--sage-2)", opacity: 0.35, marginBottom: 6,
              }}>
                {s.n}
              </div>
              <h3 style={{ fontSize: 18, marginBottom: 8 }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 300 }}>{s.body}</p>
              {i < STEPS.length - 1 && (
                <div style={{
                  position: "absolute", top: 24, right: -22, display: "flex",
                  alignItems: "center", color: "var(--text-disabled)",
                }} className="hs-nav-links">
                  <ArrowRight size={18} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Personas() {
  const items = [
    {
      icon: Users,
      tag: "For agents",
      title: "Your fields, front and center",
      body: "See exactly which of your fields need attention today, and update stage and status as the work happens.",
    },
    {
      icon: TrendingUp,
      tag: "For admins",
      title: "The full picture, always",
      body: "Every agent, every field, every stage — plus the tools to add fields, reassign agents, and see risk across the whole operation.",
    },
  ];
  return (
    <section style={{ padding: "88px 24px", maxWidth: 1180, margin: "0 auto" }}>
      <div className="hs-persona-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {items.map((p) => (
          <div key={p.tag} style={{
            background: "var(--earth-2)", borderRadius: "var(--r-xl)", padding: "34px 32px",
            color: "var(--cream)", position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: -30, right: -30, width: 140, height: 140, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(139,158,122,0.18) 0%, transparent 70%)",
            }} />
            <div style={{
              width: 42, height: 42, borderRadius: "var(--r-sm)", background: "rgba(250,248,243,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, position: "relative",
            }}>
              <p.icon size={20} color="var(--amber)" />
            </div>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--amber)", marginBottom: 10, position: "relative" }}>
              {p.tag}
            </p>
            <h3 style={{ fontSize: 21, color: "var(--cream)", marginBottom: 10, position: "relative" }}>{p.title}</h3>
            <p style={{ fontSize: 14, color: "rgba(250,248,243,0.72)", lineHeight: 1.65, position: "relative", maxWidth: 400 }}>
              {p.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section style={{ padding: "20px 24px 96px" }}>
      <div style={{
        maxWidth: 1180, margin: "0 auto", background: "var(--sage-3)", borderRadius: "var(--r-xl)",
        padding: "56px 40px", textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-20%", left: "10%", width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
        }} />
        <h2 style={{ fontSize: "clamp(24px, 3vw, 32px)", color: "#fff", marginBottom: 12, position: "relative" }}>
          Ready to see your fields clearly?
        </h2>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.82)", marginBottom: 28, position: "relative" }}>
          Sign in to your dashboard, or get started with SmartSeason today.
        </p>
        <Link
          to="/login"
          className="hs-cta-primary"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8, position: "relative",
            background: "var(--amber)", color: "var(--earth-2)", fontSize: 15, fontWeight: 600,
            padding: "14px 30px", borderRadius: "var(--r-sm)", textDecoration: "none",
          }}
        >
          Sign in to SmartSeason <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--mist)", padding: "40px 24px 30px" }}>
      <div style={{
        maxWidth: 1180, margin: "0 auto", display: "flex", flexWrap: "wrap",
        alignItems: "center", justifyContent: "space-between", gap: 20,
      }}>
        <Logo />
        <div style={{ display: "flex", gap: 26, flexWrap: "wrap" }}>
          <a href="#overview" className="hs-link">Overview</a>
          <a href="#features" className="hs-link">Features</a>
          <a href="#how-it-works" className="hs-link">How it works</a>
          <Link to="/login" className="hs-link">Sign in</Link>
        </div>
      </div>
      <p style={{ maxWidth: 1180, margin: "24px auto 0", fontSize: 12.5, color: "var(--text-muted)" }}>
        © {new Date().getFullYear()} SmartSeason. Field monitoring, season to season.
      </p>
    </footer>
  );
}function SectionHeading({ eyebrow, title, sub }) {
  return (
    <div style={{ maxWidth: 560 }}>
      <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--terra-2)", marginBottom: 10 }}>
        {eyebrow}
      </p>
      <h2 style={{ fontSize: "clamp(24px, 3vw, 32px)", marginBottom: 12 }}>{title}</h2>
      {sub && <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6 }}>{sub}</p>}
    </div>
  );
}