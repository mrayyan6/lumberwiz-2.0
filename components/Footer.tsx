import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-gradient-to-b from-secondary/30 to-secondary/60 py-14">
      <div className="container mx-auto px-4">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">LumberWiz</h3>
            <div className="mt-1 h-0.5 w-10 rounded-full bg-primary/50" />
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Handcrafted terracotta & artisan decor, rooted in tradition, designed for modern living.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-sm font-semibold text-foreground">Quick Links</h4>
            <div className="mt-3 flex flex-col gap-2">
              {[
                { href: "/", label: "Home" },
                { href: "/about", label: "About" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span className="h-px w-3 rounded-full bg-muted-foreground/50 transition-all duration-200 group-hover:w-5 group-hover:bg-primary" />
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-sm font-semibold text-foreground">Contact</h4>
            <p className="mt-3 text-sm text-muted-foreground">info@lumberwiz.com</p>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} LumberWiz. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
