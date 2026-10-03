
import type { ReactNode } from "react";
import {
  Box,
  PenTool,
  Palette,
  Monitor,
  Layers3,
  Zap,
  Shield,
  Search,
  Cloud,
  Terminal,
  Network,
  BarChart3,
  Mail,
  Megaphone,
  Wrench,
} from "lucide-react";

import type { ToolkitCategory } from "@/types/mentor";

interface ArtistToolkitProps {
  title?: string;
  subtitle?: string;
  categories: ToolkitCategory[];
}

/**
 * Best-effort icon lookup by tool name (case-insensitive substring match),
 * with a sensible generic fallback so any new tool added to mentors.ts
 * "just works" without needing a component change.
 */
const ICON_MAP: { match: string; icon: ReactNode }[] = [
  { match: "blender", icon: <Box size={26} /> },
  { match: "zbrush", icon: <PenTool size={26} /> },
  { match: "substance", icon: <Palette size={26} /> },
  { match: "unreal", icon: <Monitor size={26} /> },
  { match: "photoshop", icon: <Layers3 size={26} /> },
  { match: "unity", icon: <Zap size={26} /> },
  { match: "midjourney", icon: <Palette size={26} /> },
  { match: "canva", icon: <Palette size={26} /> },

  { match: "burp", icon: <Shield size={26} /> },
  { match: "zap", icon: <Shield size={26} /> },
  { match: "nessus", icon: <Shield size={26} /> },
  { match: "openvas", icon: <Shield size={26} /> },
  { match: "metasploit", icon: <Shield size={26} /> },
  { match: "nmap", icon: <Network size={26} /> },
  { match: "wireshark", icon: <Network size={26} /> },
  { match: "tcpdump", icon: <Network size={26} /> },
  { match: "netcat", icon: <Terminal size={26} /> },
  { match: "shodan", icon: <Search size={26} /> },
  { match: "maltego", icon: <Search size={26} /> },
  { match: "censys", icon: <Search size={26} /> },
  { match: "google dorking", icon: <Search size={26} /> },
  { match: "harvester", icon: <Search size={26} /> },
  { match: "aws", icon: <Cloud size={26} /> },
  { match: "cloudtrail", icon: <Cloud size={26} /> },
  { match: "iam", icon: <Cloud size={26} /> },
  { match: "siem", icon: <Shield size={26} /> },
  { match: "wazuh", icon: <Shield size={26} /> },
  { match: "linux", icon: <Terminal size={26} /> },
  { match: "ubuntu", icon: <Terminal size={26} /> },
  { match: "windows server", icon: <Terminal size={26} /> },

  { match: "google ads", icon: <Megaphone size={26} /> },
  { match: "meta ads", icon: <Megaphone size={26} /> },
  { match: "ga4", icon: <BarChart3 size={26} /> },
  { match: "analytics", icon: <BarChart3 size={26} /> },
  { match: "search console", icon: <Search size={26} /> },
  { match: "tag manager", icon: <Terminal size={26} /> },
  { match: "wordpress", icon: <Monitor size={26} /> },
  { match: "mailchimp", icon: <Mail size={26} /> },
  { match: "hubspot", icon: <BarChart3 size={26} /> },
  { match: "looker", icon: <BarChart3 size={26} /> },
  { match: "semrush", icon: <Search size={26} /> },
  { match: "ahref", icon: <Search size={26} /> },
];

const getIcon = (toolName: string): ReactNode => {
  const lower = toolName.toLowerCase();
  const found = ICON_MAP.find((entry) => lower.includes(entry.match));
  return found ? found.icon : <Wrench size={26} />;
};

export default function ArtistToolkit({
  title = "The Toolkit",
  subtitle = "Standard industry software used in my daily production pipeline.",
  categories,
}: ArtistToolkitProps) {
  return (
    <section
      style={{
        width: "100%",
        padding: "90px 20px",
        background: "#fff",
      }}
    >
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          border: "1px solid #E8E8E8",
          borderRadius: "28px",
          padding: "70px 50px",
          background: "#fff",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: "32px",
            fontWeight: 700,
            color: "#111827",
            marginBottom: "16px",
          }}
        >
          {title}
        </h2>

        {subtitle && (
          <p
            style={{
              textAlign: "center",
              color: "#6B7280",
              fontSize: "15px",
              maxWidth: "650px",
              margin: "0 auto 55px",
              lineHeight: 1.8,
            }}
          >
            {subtitle}
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
          {categories.map((category, catIdx) => (
            <div key={category.label ?? catIdx}>
              {category.label && (
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#111827",
                    marginBottom: 24,
                    textAlign: categories.length > 1 ? "left" : "center",
                  }}
                >
                  {category.label}
                </h3>
              )}

              <div
                className="
                grid
                grid-cols-2
                md:grid-cols-3
                lg:grid-cols-4
                xl:grid-cols-6
                gap-8
                "
              >
                {category.tools.map((toolName) => (
                  <div
                    key={toolName}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 18,
                        background: "#F8F8F8",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: 18,
                        transition: ".3s",
                        border: "1px solid #EFEFEF",
                        color: "#6B7280",
                      }}
                    >
                      {getIcon(toolName)}
                    </div>

                    <span
                      style={{
                        fontSize: 14,
                        color: "#4B5563",
                        fontWeight: 500,
                        textAlign: "center",
                      }}
                    >
                      {toolName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}