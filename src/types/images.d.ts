/**
 * Lets TypeScript understand `import photo from "../assets/mentors/xyz.jpg"`
 * (Vite/CRA turn these into a string URL at build time — this file just
 * tells the TS compiler what type to expect).
 *
 * If you already have a `vite-env.d.ts` with these, you can delete this file.
 */

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.webp" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  const src: string;
  export default src;
}