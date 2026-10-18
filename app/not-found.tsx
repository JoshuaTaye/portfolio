import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--theme-background)] px-6 text-center">
      <p className="font-hand text-6xl text-[var(--theme-accent-ink)] sm:text-7xl">404</p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-[var(--theme-base)] sm:text-3xl">
        This page wandered off the canvas
      </h1>
      <p className="mt-3 max-w-md text-base text-[var(--theme-base-muted)]">
        The link may be old or mistyped. The projects and contact details are all on the home page.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="sketch-fill sketch-hover inline-flex items-center px-4 py-2 text-sm font-semibold text-[var(--theme-background)] transition-transform hover:-translate-y-0.5"
        >
          Back to the portfolio
        </Link>
        <Link
          href="/#m-projects"
          className="sketch sketch-hover inline-flex items-center px-4 py-2 text-sm font-semibold text-[var(--theme-base)] transition-transform hover:-translate-y-0.5"
        >
          See the projects
        </Link>
      </div>
    </main>
  );
}
