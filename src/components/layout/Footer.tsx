import { Link } from "react-router-dom";
import {
  GraduationCap,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
} from "lucide-react";
import logo from "@/assets/logo/latest-logo.png";

const footerLinks = {
  Courses: [
  {
    label: "UI/UX Design",
    path: "/ui-ux-design-course",
  },
  {
    label: "Graphics Design",
    path: "/graphics-design-course",
  },
  {
    label: "Motion Graphics & VFX",
    path: "/motion-graphics-design-course",
  },
  {
    label: "3D Design & Animation",
    path: "/3d-design-course",
  },
  {
    label: "Digital Marketing",
    path: "/digital-marketing-course",
  },
  {
    label: "Data Analytics",
    path: "/data-analytics-course",
  },
  {
    label: "Cyber Security & Ethical Hacking",
    path: "/cyber-security-ethical-hacking"
  }
],
  Company: [
    { label: "About Us", path: "/about" },
    { label: "Careers", path: "/careers" },
    { label: "Blog", path: "/blog" },
  
  ],
  Support: [
    { label: "Help Center", path: "/support" },
    { label: "Contact", path: "/contact" },
    { label: "AI Assistant", path: "/ai-chat" },
  ],
};

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container px-4 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
         <div className="lg:col-span-2">
  <Link
          to="/"
          className="flex shrink-0 items-center gap-2 text-foreground rounded-lg focus:outline-none"
          aria-label="Slate Academy Home"
        >
          <img
            src={logo}
            alt="Slate Academy "
            className="h-9 w-auto shrink-0 object-contain lg:h-10"
          />
        </Link>

  <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground font-medium">
    Build real skills with real-world projects. Join thousands of learners
    transforming their careers.
  </p>

  {/* Social Links */}
  <div className="mt-6 flex items-center gap-3">
  <a
    href="https://www.facebook.com/share/1F4DUVUabb/"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Facebook"
    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2] text-white transition-transform duration-300 hover:scale-110"
  >
    <Facebook className="h-5 w-5" />
  </a>

  <a
    href="https://www.instagram.com/slateacademy_/?hl=en"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Instagram"
    className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white transition-transform duration-300 hover:scale-110"
  >
    <Instagram className="h-5 w-5" />
  </a>

  <a
    href="https://www.youtube.com/@slateacademy_newdelhi"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="YouTube"
    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF0000] text-white transition-transform duration-300 hover:scale-110"
  >
    <Youtube className="h-5 w-5" />
  </a>

  <a
    href="https://www.linkedin.com/company/slate-academy/"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="LinkedIn"
    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0A66C2] text-white transition-transform duration-300 hover:scale-110"
  >
    <Linkedin className="h-5 w-5" />
  </a>
</div>
</div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="mb-4 text-sm font-semibold text-foreground">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2026 Slate Academy. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;