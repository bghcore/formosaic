import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";

export const metadata: Metadata = {
  title: {
    default: "Formosaic",
    template: "%s - Formosaic",
  },
  description:
    "Configuration-driven forms with a built-in rules engine. 11 UI adapters, 20 condition operators, computed values, cross-field effects, auto-save, and TypeScript-first.",
  keywords: [
    "react forms",
    "form engine",
    "rules engine",
    "JSON forms",
    "config-driven forms",
    "react-hook-form",
    "form builder",
    "typescript forms",
    "formosaic",
  ],
  openGraph: {
    type: "website",
    title: "Formosaic — Configuration-driven forms with a built-in rules engine",
    description:
      "Define forms as JSON with a declarative rules engine. 11 UI adapters, 20 condition operators, computed values, cross-field effects, auto-save, and TypeScript-first.",
    images: ["https://bghcore.github.io/formosaic/formosaic-brand.png"],
    url: "https://bghcore.github.io/formosaic",
    siteName: "Formosaic",
  },
  twitter: {
    card: "summary_large_image",
    title: "Formosaic — Config-driven React forms with a rules engine",
    description:
      "Define forms as JSON with a declarative rules engine. 11 UI adapters, 20 condition operators, computed values, cross-field effects, auto-save, and TypeScript-first.",
    images: ["https://bghcore.github.io/formosaic/formosaic-brand.png"],
  },
  icons: {
    icon: "/formosaic/formosaic-logo.png",
  },
  alternates: {
    canonical: "https://bghcore.github.io/formosaic",
  },
};

const logo = (
  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    <img
      src="/formosaic/formosaic-logo.png"
      alt="Formosaic"
      width={28}
      height={28}
    />
    <strong>Formosaic</strong>
  </span>
);

const navbar = (
  <Navbar
    logo={logo}
    projectLink="https://github.com/bghcore/formosaic"
  >
    <a
      href="https://www.npmjs.com/org/formosaic"
      target="_blank"
      rel="noopener noreferrer"
      style={{ padding: "0 8px", color: "inherit", fontSize: "14px" }}
    >
      npm
    </a>
    <a
      href="https://bghcore.github.io/formosaic/storybook/"
      target="_blank"
      rel="noopener noreferrer"
      style={{ padding: "0 8px", color: "inherit", fontSize: "14px" }}
    >
      Storybook
    </a>
  </Navbar>
);

const footer = (
  <Footer>
    <span>
      Released under the MIT License. Copyright 2024-present Formosaic
      Contributors.
    </span>
  </Footer>
);

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head>
        <link
          rel="canonical"
          href="https://bghcore.github.io/formosaic"
        />
      </Head>
      <body>
        <Layout
          navbar={navbar}
          footer={footer}
          docsRepositoryBase="https://github.com/bghcore/formosaic/edit/main/website"
          pageMap={await getPageMap()}
          sidebar={{ defaultMenuCollapseLevel: 1 }}
          toc={{ title: "On This Page" }}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
