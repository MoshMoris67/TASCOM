import { Link } from "@tanstack/react-router";
import {
  Facebook,
  Instagram,
  Lock,
  Mail,
  MapPin,
  Phone,
  Youtube,
  GraduationCap,
} from "lucide-react";
import { navLinks, school } from "@/lib/school-info";
import { cn } from "@/lib/utils";
import crest from "@/assets/crest.png";

const TikTok = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M16.5 3c.4 2.2 1.8 3.9 4 4.2v3c-1.5.1-2.9-.3-4-1v6.3c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6c.3 0 .7 0 1 .1v3.1c-.3-.1-.7-.2-1-.2-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3V3h3.5z" />
  </svg>
);

const socialLinks = [
  { Icon: Facebook, label: "Facebook", href: school.social.facebook },
  { Icon: Instagram, label: "Instagram", href: school.social.instagram },
  { Icon: Youtube, label: "YouTube", href: school.social.youtube },
  { Icon: TikTok, label: "TikTok", href: school.social.tiktok },
];

export function Footer() {
  return (
    <footer className="mt-24 bg-flag-black text-white/85">
      <div className="h-1 flag-stripe" />
      <div className="container-page py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <img
              src={crest}
              alt="Talents College crest"
              className="h-16 w-auto rounded-lg bg-white p-1.5 object-contain"
            />
            <div>
              <div className="font-display font-bold text-lg text-white leading-tight">
                Talents College Mukono
              </div>
              <div className="text-[11px] uppercase tracking-widest text-flag-yellow">
                Power of Knowledge
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            A private co-educational day &amp; boarding secondary school in Mukono, Uganda —
            nurturing academic excellence and practical talent since 2002.
          </p>
          <div className="mt-5 flex gap-2">
            {socialLinks.map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="size-9 grid place-items-center rounded-full bg-white/10 hover:bg-flag-yellow hover:text-flag-black transition-colors"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-white font-display text-lg mb-4">Explore</h3>
          <ul className="space-y-2 text-sm">
            {navLinks.slice(0, 6).map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-white/70 hover:text-flag-yellow transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-white font-display text-lg mb-4">Portals</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/admissions/check-status" className="text-white/70 hover:text-flag-yellow">
                Check Application Status
              </Link>
            </li>
            <li>
              <Link
                to="/portal/student/login"
                className="text-white/70 hover:text-flag-yellow inline-flex items-center gap-2"
              >
                <span className="grid size-5 place-items-center rounded bg-white/10">
                  <GraduationCap className="size-3" />
                </span>
                Student Portal
              </Link>
            </li>
            <li>
              <Link to="/news" className="text-white/70 hover:text-flag-yellow">
                Announcements
              </Link>
            </li>
            <li>
              <Link to="/media" hash="events" className="text-white/70 hover:text-flag-yellow">
                Events Calendar
              </Link>
            </li>
            <li>
              <Link to="/media" hash="gallery" className="text-white/70 hover:text-flag-yellow">
                Gallery
              </Link>
            </li>
            <li className="pt-2">
              <Link
                to="/auth"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-3.5 py-2 font-semibold text-white hover:border-flag-yellow hover:text-flag-yellow transition-colors"
              >
                <Lock className="size-3.5" />
                Staff &amp; Admin Login
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-display text-lg mb-4">Reach Us</h3>
          <ul className="space-y-3 text-sm text-white/75">
            <li className="flex gap-2.5">
              <MapPin className="size-4 shrink-0 mt-0.5 text-flag-yellow" />
              <span>
                {school.address.physical}
                <br />
                {school.address.postal}
              </span>
            </li>
            <li className="flex gap-2.5">
              <Phone className="size-4 shrink-0 mt-0.5 text-flag-yellow" />
              <span className="flex flex-col">
                <a
                  href={`tel:${school.contacts.headTeacher.replace(/\s+/g, "")}`}
                  className="hover:text-flag-yellow transition-colors"
                >
                  {school.contacts.headTeacher}
                </a>
                <a
                  href={`tel:${school.contacts.office1.replace(/\s+/g, "")}`}
                  className="hover:text-flag-yellow transition-colors"
                >
                  {school.contacts.office1}
                </a>
              </span>
            </li>
            <li className="flex gap-2.5">
              <Mail className="size-4 shrink-0 mt-0.5 text-flag-yellow" />
              <a
                href={`mailto:${school.contacts.email}`}
                className="hover:text-flag-yellow transition-colors"
              >
                {school.contacts.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60">
          <div>© {new Date().getFullYear()} Talents College Mukono. All rights reserved.</div>
          <div className="flex items-center gap-3">
            <span>Reg. No. {school.registration} · Ministry of Education &amp; Sports, Uganda</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
