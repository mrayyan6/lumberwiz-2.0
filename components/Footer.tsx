import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/50 py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">LumberWiz</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Handcrafted terracotta & artisan decor, rooted in tradition, designed for modern living.
            </p>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold text-foreground">Quick Links</h4>
            <div className="mt-2 flex flex-col gap-1">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
            </div>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold text-foreground">Contact</h4>
            <p className="mt-2 text-sm text-muted-foreground">info@lumberwiz.com</p>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} LumberWiz. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
