import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Cloud,
  LogIn,
  Medal,
  Trophy,
  WifiOff,
} from "lucide-react";
import { TrackEvent } from "@/components/TrackEvent";

const features = [
  {
    title: "18-Week Training Plans",
    description:
      "Scientifically-designed schedules based on proven methodology used by thousands of runners.",
    icon: CalendarDays,
  },
  {
    title: "Multiple Difficulty Levels",
    description:
      "From Novice 1 for first-timers to Advanced plans for experienced marathoners chasing a PR.",
    icon: Trophy,
  },
  {
    title: "Track Your Progress",
    description:
      "Mark workouts complete, add notes, and watch your consistency build week over week.",
    icon: CheckCircle2,
  },
  {
    title: "Works Offline",
    description:
      "Your training plan is always available, even without an internet connection.",
    icon: WifiOff,
  },
  {
    title: "Sync Across Devices",
    description:
      "Create a free account to access your plan from any device and never lose your progress.",
    icon: Cloud,
  },
  {
    title: "Completely Free",
    description:
      "No subscriptions, no premium tiers, no ads. Just a great training plan to get you to the finish line.",
    icon: Medal,
  },
];

const workouts = [
  ["Mon", "Rest", "Recovery day"],
  ["Tue", "5 mi run", "Easy conversational pace"],
  ["Wed", "8 mi pace", "Goal-marathon rhythm"],
  ["Thu", "5 mi run", "Steady aerobic work"],
  ["Sat", "18 mi run", "Long-run endurance"],
];

const steps = [
  {
    title: "Pick Your Race Date",
    description:
      "Enter the date of your marathon and we will calculate your 18-week training schedule.",
  },
  {
    title: "Choose Your Level",
    description:
      "Select from Novice, Intermediate, or Advanced plans based on your experience.",
  },
  {
    title: "Start Training",
    description:
      "Follow your daily workouts, track your progress, and build toward race day.",
  },
];

const faqs = [
  {
    question: "How long is the marathon training plan?",
    answer:
      "All our plans are 18 weeks long, which is the optimal duration recommended by running experts to build endurance safely without risking overtraining or injury.",
  },
  {
    question: "What training methodology do you use?",
    answer:
      "Our plans are based on proven marathon training principles popularized by Hal Higdon, featuring a mix of easy runs, long runs, pace work, and strategic rest days.",
  },
  {
    question: "Which plan should I choose?",
    answer:
      "If you are running your first marathon, start with Novice 1. If you have run a marathon before and want to improve, try Intermediate 1 or 2. Advanced plans are for experienced runners targeting specific time goals.",
  },
  {
    question: "Can I adjust the plan to my schedule?",
    answer:
      "The plan is designed with rest days and easy days that can be swapped if needed. The key is to never skip your long run and to keep your easy days easy.",
  },
];

export default function HomePage() {
  const appBaseHref = process.env.NEXT_PUBLIC_APP_URL ?? "#how-it-works";
  const appRootHref = appBaseHref.startsWith("#") ? appBaseHref : appBaseHref.replace(/\/$/, "");
  const appHref = appRootHref.startsWith("#")
    ? appBaseHref
    : `${appRootHref}/?start=race-date`;
  const loginHref = appRootHref.startsWith("#") ? appRootHref : `${appRootHref}/?auth=login`;

  return (
    <main className="page">
      <TrackEvent eventName="marketing_landing_viewed" properties={{ surface: "next_web" }} />
      <div className="container">
        <nav className="marketing-nav" aria-label="Primary">
          <Link href="/" className="brand">
            <span className="brand-mark">M</span>
            <span>Marathon Training Plan</span>
          </Link>
          <div className="nav-links">
            <Link className="nav-link" href="#features">
              Features
            </Link>
            <Link className="nav-link" href="#how-it-works">
              How it works
            </Link>
            <Link className="nav-link" href="#faq">
              FAQ
            </Link>
            <Link className="nav-link" href={loginHref}>
              Log in
            </Link>
            <Link className="button secondary" href={appHref}>
              Create Your Free Plan
            </Link>
          </div>
        </nav>

        <section className="hero">
          <div>
            <p className="eyebrow">100% Free</p>
            <h1>Your Marathon Journey Starts Here</h1>
            <p className="lead">
              Get a personalized 18-week training plan tailored to your race
              day. Based on proven methodology that has helped thousands of
              runners cross the finish line.
            </p>
            <div className="hero-actions">
              <Link className="button" href={appHref}>
                Create Your Free Plan
                <ArrowRight size={18} />
              </Link>
              <Link className="button secondary" href={loginHref}>
                Log in
                <LogIn size={18} />
              </Link>
              <span className="cta-note">No account required to get started</span>
            </div>
          </div>

          <div className="product-preview" aria-label="Training week preview">
            <div className="preview-header">
              <div>
                <strong>Week 13</strong>
                <div className="muted">Peak training block</div>
              </div>
              <span className="pill">Race in 42 days</span>
            </div>
            {workouts.map(([day, title, meta]) => (
              <div className="workout-row" key={`${day}-${title}`}>
                <div className="workout-day">{day}</div>
                <div>
                  <div className="workout-title">{title}</div>
                  <div className="workout-meta">{meta}</div>
                </div>
                <span className="pill">Plan</span>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="section">
          <h2>Everything You Need to Succeed</h2>
          <p className="lead">
            Simple, focused tools to keep you on track from day one to race day.
          </p>
          <div className="grid feature-grid">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article className="card" key={feature.title}>
                  <Icon size={24} color="var(--primary)" aria-hidden />
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section id="how-it-works" className="section section-muted">
          <h2>How It Works</h2>
          <p className="lead">Get your personalized plan in less than a minute.</p>
          <div className="steps">
            {steps.map((step, index) => (
              <article className="step-card" key={step.title}>
                <div className="step-number">{index + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="faq" className="section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            {faqs.map((faq) => (
              <article className="faq-item" key={faq.question}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section final-cta">
          <h2>Ready to Start Training?</h2>
          <p className="lead">
            Join thousands of runners who have used our plans to achieve their
            marathon goals.
          </p>
          <Link className="button" href={appHref}>
            Get Your Free Plan
            <ArrowRight size={18} />
          </Link>
        </section>
      </div>
    </main>
  );
}
