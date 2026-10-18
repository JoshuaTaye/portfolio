import { existsSync } from "node:fs";
import path from "node:path";
import { resumeUrl } from "./seed-data";

/** The CV path if the PDF is in public/, otherwise null. Checked at build time for static pages. */
export function getResumeUrl(): string | null {
  return existsSync(path.join(process.cwd(), "public", resumeUrl)) ? resumeUrl : null;
}
