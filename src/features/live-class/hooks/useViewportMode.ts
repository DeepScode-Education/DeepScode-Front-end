/**
 * src/features/live-class/hooks/useViewportMode.ts
 *
 * Single source of truth for `isPortrait` / `isLandscape` / device-class
 * used across the redesigned Live Classroom UI. Combines the CSS
 * orientation media query (works reliably on rotate) with a width check
 * (works for split-screen / resizable desktop windows where "orientation"
 * doesn't really apply).
 *
 * Breakpoints (Tailwind-aligned):
 *   < 768px            -> mobile
 *   768px  - 1023px    -> tablet
 *   >= 1024px          -> desktop
 *
 * `isPortrait` / `isLandscape` are only meaningful for the mobile bucket —
 * tablet and desktop are always treated as "landscape-like" (persistent
 * side layout) regardless of the actual aspect ratio, matching the spec's
 * "Desktop / Tablet / Mobile Portrait / Mobile Landscape" 4-way matrix.
 */
import { useEffect, useState, useCallback } from "react";

export type DeviceClass = "mobile" | "tablet" | "desktop";

export interface ViewportMode {
  width: number;
  height: number;
  deviceClass: DeviceClass;
  /** True only when deviceClass === "mobile" AND height > width. */
  isPortrait: boolean;
  /** True when deviceClass !== "mobile", OR mobile in landscape. */
  isLandscape: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const classify = (width: number): DeviceClass => {
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
};

const computeMode = (): ViewportMode => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const deviceClass = classify(width);
  const mobilePortrait = deviceClass === "mobile" && height >= width;

  return {
    width,
    height,
    deviceClass,
    isPortrait: mobilePortrait,
    isLandscape: !mobilePortrait,
    isMobile: deviceClass === "mobile",
    isTablet: deviceClass === "tablet",
    isDesktop: deviceClass === "desktop",
  };
};

export const useViewportMode = (): ViewportMode => {
  const [mode, setMode] = useState<ViewportMode>(() =>
    typeof window !== "undefined"
      ? computeMode()
      : {
          width: 1024,
          height: 768,
          deviceClass: "desktop",
          isPortrait: false,
          isLandscape: true,
          isMobile: false,
          isTablet: false,
          isDesktop: true,
        }
  );

  // IMPORTANT: this fires on every "resize" event, including the synthetic
  // ones LiveClassShell dispatches to nudge the Zoom SDK canvas to redraw
  // (see LiveClassShell.tsx). Those synthetic dispatches don't change the
  // window's actual dimensions, so if we blindly call `setMode(computeMode())`
  // we hand React a brand-new object every time — which forces a re-render
  // of the entire classroom tree even though nothing observable changed.
  // Bailing out (returning the previous state reference) when the computed
  // values are identical stops that needless render, and — more importantly —
  // stops it from ever being able to compound into a feedback loop with any
  // other effect that reacts to viewport changes.
  const recompute = useCallback(() => {
    setMode((prev) => {
      const next = computeMode();
      const unchanged =
        prev.width === next.width &&
        prev.height === next.height &&
        prev.deviceClass === next.deviceClass &&
        prev.isPortrait === next.isPortrait;
      return unchanged ? prev : next;
    });
  }, []);

  useEffect(() => {
    recompute();
    window.addEventListener("resize", recompute);
    window.addEventListener("orientationchange", recompute);

    // visualViewport fires more reliably than window resize on iOS Safari
    // when the keyboard/toolbar shows or hides.
    window.visualViewport?.addEventListener("resize", recompute);

    return () => {
      window.removeEventListener("resize", recompute);
      window.removeEventListener("orientationchange", recompute);
      window.visualViewport?.removeEventListener("resize", recompute);
    };
  }, [recompute]);

  return mode;
};