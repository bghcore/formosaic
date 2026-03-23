"use client";

import React from "react";

interface Feature {
  icon: string;
  title: string;
  details: string;
}

const features: Feature[] = [
  {
    icon: "\u2699\uFE0F",
    title: "Config-Driven",
    details:
      "Define forms as a single IFormConfig JSON object. Field types, labels, validation, and rules are all declared as data, not JSX.",
  },
  {
    icon: "\uD83E\uDDE0",
    title: "Declarative Rules Engine",
    details:
      "20 condition operators, composable AND/OR/NOT logic, computed values, cross-field effects. Rules are data, not code.",
  },
  {
    icon: "\uD83C\uDFA8",
    title: "11 UI Adapters",
    details:
      "Fluent UI, MUI, Ant Design, Mantine, Chakra, Radix, React Aria, Headless, Base Web, HeroUI, Atlaskit. Swap with one import.",
  },
  {
    icon: "\uD83D\uDD12",
    title: "TypeScript-First",
    details:
      "Strict mode, full type inference, IFieldProps generics, typed form configs with defineFormConfig().",
  },
  {
    icon: "\u2705",
    title: "Battle-Tested",
    details:
      "6,296 unit tests, 54 E2E tests, 67+ Storybook stories. Contract tests ensure adapter parity.",
  },
  {
    icon: "\uD83D\uDE80",
    title: "Production-Ready",
    details:
      "Auto-save with retry, draft persistence, error boundaries, SSR/Next.js support, i18n, analytics hooks.",
  },
];

export default function Hero() {
  return (
    <div className="hero-container">
      <div className="hero-content">
        <h1 className="hero-title">
          <span className="hero-name">Formosaic</span>
        </h1>
        <p className="hero-text">
          Configuration-driven forms with a built-in rules engine
        </p>
        <p className="hero-tagline">
          Define forms as JSON. Let the engine handle rendering, validation,
          rules, and auto-save.
        </p>
        <div className="hero-actions">
          <a href="/formosaic/guide/getting-started" className="hero-button hero-button-primary">
            Get Started
          </a>
          <a
            href="https://github.com/bghcore/formosaic"
            className="hero-button hero-button-secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </a>
          <a
            href="https://bghcore.github.io/formosaic/storybook/"
            className="hero-button hero-button-secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Storybook
          </a>
        </div>
      </div>

      <div className="hero-features">
        {features.map((f) => (
          <div key={f.title} className="feature-card">
            <div className="feature-icon">{f.icon}</div>
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-details">{f.details}</p>
          </div>
        ))}
      </div>

      <style jsx>{`
        .hero-container {
          padding: 48px 0;
        }
        .hero-content {
          text-align: center;
          max-width: 700px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .hero-title {
          font-size: 48px;
          font-weight: 800;
          margin: 0 0 16px;
          line-height: 1.1;
        }
        .hero-name {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-text {
          font-size: 20px;
          color: var(--nextra-text, #111);
          margin: 0 0 8px;
          font-weight: 600;
        }
        .hero-tagline {
          font-size: 16px;
          color: var(--nextra-text-secondary, #6b7280);
          margin: 0 0 32px;
        }
        .hero-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .hero-button {
          padding: 10px 24px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .hero-button:hover {
          opacity: 0.85;
        }
        .hero-button-primary {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: #fff;
        }
        .hero-button-secondary {
          border: 1px solid var(--nextra-border-color, #e5e7eb);
          color: var(--nextra-text, #111);
          background: var(--nextra-bg, #fff);
        }
        .hero-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 64px;
          padding: 0 24px;
        }
        .feature-card {
          padding: 24px;
          border: 1px solid var(--nextra-border-color, #e5e7eb);
          border-radius: 8px;
          background: var(--nextra-bg, #fff);
        }
        .feature-icon {
          font-size: 28px;
          margin-bottom: 12px;
        }
        .feature-title {
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 8px;
        }
        .feature-details {
          font-size: 14px;
          color: var(--nextra-text-secondary, #6b7280);
          margin: 0;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}
