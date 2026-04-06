import { Compass } from "lucide-react";
import { Link } from "react-router-dom";

const footerLinks = {
  Product: ["Features", "Pricing", "AI Planner", "Mobile App"],
  Company: ["About Us", "Careers", "Press", "Blog"],
  Resources: ["Help Center", "Guides", "API Docs", "Community"],
  Social: ["Twitter", "Instagram", "LinkedIn", "YouTube"],
};

export default function Footer() {
  return (
    <footer className="py-16 bg-card border-t border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <Compass className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-foreground">TravelNest</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered travel planning for modern explorers.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-foreground mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© 2026 TravelNest. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground">Privacy</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground">Terms</a>
            <span className="text-xs text-muted-foreground">Made with ❤️ by TravelNest Team</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
