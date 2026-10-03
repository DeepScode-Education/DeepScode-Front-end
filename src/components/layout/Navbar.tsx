import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo/latest-logo.svg";
import {
  fetchCoursesCatalog,
  type CatalogCourse,
} from "@/data/coursesCatalog";
import { getMentors } from "@/services/mentor.service";
import type { MentorListItem } from "@/data/mentors";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Courses", path: "/courses", hasDropdown: true },
  { label: "Portfolio", path: "/portfolio" },
  { label: "Mentors", path: "/mentors", hasDropdown: true },
  {
    label: "Placements",
    path: "/placements",
  },

  // {
  //   label: "Knowledge Hub",
  //   path: "/knowledge-hub",
  // },
    {
    label: "Jobs Portal",
    path: "/jobs-portal",
  },
];

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [mentorsOpen, setMentorsOpen] = useState(false);
  const [mentors, setMentors] = useState<MentorListItem[]>([]);
  const [courses, setCourses] = useState<CatalogCourse[]>([]);
  const { user, signOut } = useAuth();

  useEffect(() => {
    let isMounted = true;

    getMentors()
      .then((data) => {
        if (isMounted) setMentors(data);
      })
      .catch((err) => {
        console.error("Failed to fetch mentors for navbar:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
  let isMounted = true;

  fetchCoursesCatalog()
    .then((data) => {
      if (isMounted) {
        setCourses(data);
      }
    })
    .catch((err) => {
      console.error("Failed to fetch courses for navbar:", err);
    });

  return () => {
    isMounted = false;
  };
}, []);

  const dashboardRoute = (() => {
  switch (user?.role) {
    case "mentor":
      return "/mentor/dashboard";

    case "counsellor":
      return "/counsellor";

    case "admin":
    case "super_admin":
    case "accountant":
      return "/admin";

    case "student":
    default:
      return "/student";
  }
})();

  // Admin check purely from backend role — no hardcoded emails
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  // True when the current route matches any course detail page (used to
  // highlight the "Courses" trigger even when we're on /ui-ux-design-course etc.)
  // const isCourseRouteActive = coursesCatalog.some(
  //   (course) => location.pathname === `/${course.slug}`,
  // );

  const isCourseRouteActive = courses.some(
  (course) => location.pathname === `/${course.slug}`,
);

  // True when the current route matches any mentor detail page (used to
  // highlight the "Mentors" trigger even when we're on /mentors/:slug)
  const isMentorRouteActive = mentors.some(
    (mentor) => location.pathname === `/mentors/${mentor.slug}`,
  );

  const closeMobileMenu = () => {
    setMobileOpen(false);
    setCoursesOpen(false);
    setMentorsOpen(false);
  };

  return (
    <header
      className="sticky top-0 z-50 w-full  border-b border-border bg-background/80 backdrop-blur-lg"
      role="banner"
      aria-label="Main navigation header"
    >
      <div className="container flex h-16 flex-nowrap items-center justify-between gap-2">
        {/* Logo */}
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 text-foreground rounded-lg focus:outline-none"
          aria-label="Slate Academy Home"
        >
          <img
            src={logo}
            alt="Slate Academy"
            className="h-9 w-auto shrink-0 object-contain lg:h-10"
          />
        </Link>

        {/* Desktop Nav — only shows on large screens (lg, 1024px+).
            6 links + action buttons don't fit on tablet widths,
            so tablets get the hamburger menu instead. */}
        <nav
          className="hidden flex-1 items-center justify-center gap-1 lg:flex"
          role="navigation"
          aria-label="Main navigation"
        >
          {navLinks.map((link) => {
            if (!link.hasDropdown) {
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none ${
                    location.pathname === link.path
                      ? "bg-accent text-[#0037FF]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-current={
                    location.pathname === link.path ? "page" : undefined
                  }
                >
                  {link.label}
                </Link>
              );
            }

            // Shared dropdown trigger (Courses / Mentors) ----------------
            const isCourses = link.path === "/courses";
            const routeActive = isCourses
              ? isCourseRouteActive
              : isMentorRouteActive;

            return (
              <div key={link.path} className="group relative">
                <Link
                  to={link.path}
                  className={`flex items-center gap-1 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none ${
                    location.pathname === link.path || routeActive
                      ? "bg-accent text-[#0037FF]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-haspopup="true"
                  aria-current={
                    location.pathname === link.path ? "page" : undefined
                  }
                >
                  {link.label}
                  <ChevronDown
                    className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180"
                    aria-hidden="true"
                  />
                </Link>

                {/*
                  Hover bridge: this OUTER box sits flush against the trigger
                  (top-full, no transform/offset) so there is zero gap for the
                  mouse to "fall through" while moving from the link down into
                  the panel — that gap is what was causing the dropdown to
                  flicker open/closed on desktop. The pt-2 below is the visual
                  gap, but it's still inside this hoverable box, so hover never
                  breaks. Only opacity fades; nothing here moves position.
                */}
                <div
                  className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2 opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100"
                  role="menu"
                  aria-label={link.label}
                >
                  {/* Actual visible panel — built from data files, no manual links to maintain */}
                  {/* <div className="w-80 rounded-xl border border-border bg-popover p-2 shadow-lg"> */}
                  <div
  className={`w-80 rounded-xl border border-border bg-popover p-2 shadow-lg ${
    (isCourses ? courses.length : mentors.length) > 6
      ? "max-h-[340px] overflow-y-auto"
      : ""
  }`}
>
                    {isCourses
                      ? courses.map((course) => {
                          const courseActive =
                            location.pathname === `/${course.slug}`;
                          return (
                            <Link
                              key={course.id}
                              to={`/${course.slug}`}
                              role="menuitem"
                              className={`block rounded-lg px-3 py-2 transition-colors focus:outline-none ${
                                courseActive
                                  ? "bg-accent text-[#0037FF]"
                                  : "text-foreground hover:bg-accent hover:text-[#4a6ff7]"
                              }`}
                            >
                              <span className="block text-sm font-medium">
                                {course.title}
                              </span>
                              <span className="block text-xs text-muted-foreground truncate">
                                {course.subtitle}
                              </span>
                            </Link>
                          );
                        })
                      : mentors.map((mentor) => {
                          const mentorActive =
                            location.pathname === `/mentors/${mentor.slug}`;
                          return (
                            <Link
                             key={mentor.slug ?? mentor._id}
to={`/mentors/${mentor.slug ?? mentor._id}`}
                              role="menuitem"
                              className={`block rounded-lg px-3 py-2 transition-colors focus:outline-none ${
                                mentorActive
                                  ? "bg-accent text-[#0037FF]"
                                  : "text-foreground hover:bg-accent hover:text-[#4a6ff7]"
                              }`}
                            >
                              <span className="block text-sm font-medium pl-2">
                                {mentor.name}
                              </span>
                              {/* {mentor.designation && (
                                <span className="block text-xs text-muted-foreground line-clamp-1 pl-2">
                                  {mentor.designation}
                                </span>
                              )} */}

                              {mentor.designation && (
                                <span className="block max-w-[260px] truncate pl-2 text-xs text-muted-foreground">
                                  {mentor.designation}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          {user ? (
            <>
              <Button
                size="default"
                asChild
                aria-label="Go to dashboard"
                className="focus:outline-none text-white"
              >
                {/* <Link to="/student"> */}
                <Link to={dashboardRoute}>
                  <LayoutDashboard
                    className="mr-2 h-4 w-4"
                    aria-hidden="true"
                  />
                  Dashboard
                </Link>
              </Button>

              {isAdmin && (
                <Button
                  variant="secondary"
                  size="default"
                  asChild
                  aria-label="Go to admin panel"
                  className="focus:outline-none"
                >
                  <Link to="/admin">
                    <ShieldCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                    Admin
                  </Link>
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                title="Sign out"
                aria-label="Sign out of your account"
                className="focus:outline-none"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                asChild
                aria-label="Log in to your account"
                className="focus:outline-none border border-border text-foreground hover:bg-accent hover:text-[#4a6ff7] font-bold"
              >
                <Link to="/login">Log In</Link>
              </Button>
              <Button
                size="default"
                asChild
                aria-label="Start learning with our courses"
                className="focus:outline-none text-white font-bold"
              >
                <Link to="/courses">Start Learning</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile / Tablet Menu Toggle — visible up to lg (1024px) */}
        <button
          className="shrink-0 rounded-md p-2 hover:bg-accent focus:outline-none lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile / Tablet Nav */}
      {mobileOpen && (
        <div
          id="mobile-navigation"
          className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-border bg-background p-4 lg:hidden"
          role="dialog"
          aria-label="Mobile navigation menu"
          aria-modal="false"
        >
          <nav
            className="flex flex-col gap-1"
            role="navigation"
            aria-label="Mobile navigation"
          >
            {navLinks.map((link) => {
              if (!link.hasDropdown) {
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={closeMobileMenu}
                    className={`rounded-md px-4 py-3 text-sm font-medium transition-colors focus:outline-none ${
                      location.pathname === link.path
                        ? "bg-accent text-[#0037FF]"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-current={
                      location.pathname === link.path ? "page" : undefined
                    }
                  >
                    {link.label}
                  </Link>
                );
              }

              // Shared accordion (Courses / Mentors) -----------------------
              const isCourses = link.path === "/courses";
              const routeActive = isCourses
                ? isCourseRouteActive
                : isMentorRouteActive;
              const isOpen = isCourses ? coursesOpen : mentorsOpen;
              const toggleOpen = isCourses
                ? () => setCoursesOpen((prev) => !prev)
                : () => setMentorsOpen((prev) => !prev);
              const submenuId = isCourses
                ? "mobile-courses-submenu"
                : "mobile-mentors-submenu";

              return (
                <div key={link.path} className="flex flex-col">
                  <div className="flex items-stretch">
                    <Link
                      to={link.path}
                      onClick={closeMobileMenu}
                      className={`flex-1 rounded-md px-4 py-3 text-sm font-medium transition-colors focus:outline-none ${
                        location.pathname === link.path || routeActive
                          ? "bg-accent text-[#0037FF]"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      aria-current={
                        location.pathname === link.path ? "page" : undefined
                      }
                    >
                      {link.label}
                    </Link>
                    <button
                      type="button"
                      onClick={toggleOpen}
                      aria-expanded={isOpen}
                      aria-controls={submenuId}
                      aria-label={
                        isOpen
                          ? `Collapse ${link.label.toLowerCase()} list`
                          : `Expand ${link.label.toLowerCase()} list`
                      }
                      className="flex w-12 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus:outline-none"
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  </div>

                  {isOpen && (
                    <div
                      id={submenuId}
                      className="ml-3 mt-1 flex flex-col gap-1 border-l border-border pl-3"
                    >
                      {isCourses
                        ? courses.map((course) => {
                            const courseActive =
                              location.pathname === `/${course.slug}`;
                            return (
                              <Link
                                key={course.id}
                                to={`/${course.slug}`}
                                onClick={closeMobileMenu}
                                className={`rounded-md px-3 py-2 text-sm transition-colors focus:outline-none ${
                                  courseActive
                                    ? "bg-accent text-[#0037FF]"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                {course.title}
                              </Link>
                            );
                          })
                        : mentors.map((mentor) => {
                            const mentorActive =
                              location.pathname === `/mentors/${mentor.slug}`;
                            return (
                              <Link
                              key={mentor.slug ?? mentor._id}
to={`/mentors/${mentor.slug ?? mentor._id}`}
                                onClick={closeMobileMenu}
                                className={`rounded-md px-3 py-2 text-sm transition-colors focus:outline-none ${
                                  mentorActive
                                    ? "bg-accent text-[#0037FF]"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                <span className="block">{mentor.name}</span>
                                {mentor.designation && (
                                  <span className="block text-xs text-muted-foreground line-clamp-1">
                                    {mentor.designation}
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="mt-4 flex flex-col gap-2">
            {user ? (
              <>
                <Button
                  asChild
                  onClick={closeMobileMenu}
                  aria-label="Go to dashboard"
                  className="focus:outline-none text-white"
                >
                  <Link to="/student" className="bg-[#0037FF]">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>

                {isAdmin && (
                  <Button
                    variant="secondary"
                    asChild
                    onClick={closeMobileMenu}
                    aria-label="Go to admin panel"
                    className="focus:outline-none"
                  >
                    <Link to="/admin">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                  </Button>
                )}

                <Button
                  variant="ghost"
                  onClick={() => {
                    signOut();
                    closeMobileMenu();
                  }}
                  className="focus:outline-none"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  onClick={closeMobileMenu}
                  aria-label="Log in to your account"
                className="focus:outline-none border border-border text-foreground hover:bg-accent hover:text-[#4a6ff7] font-bold"
                >
                  <Link to="/login">Log In</Link>
                </Button>
                <Button
                  variant="hero"
                  asChild
                  onClick={closeMobileMenu}
                  aria-label="Start learning with our courses"
                  className="focus:outline-none text-white"
                >
                  <Link to="/courses">Start Learning</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

