import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Home, FileText, Star, CalendarCheck, Phone, Sparkles, User, LogIn, UserPlus } from "lucide-react";
import { useState } from "react";
import { ServiceRequestModal } from "@/components/ServiceRequestModal";
import { useToast } from "@/hooks/use-toast";
import { useLanguage, LanguageSwitcher } from "@/i18n/LanguageContext";
import { ClockBar } from "./ClockBar";
import { NotificationBell } from "@/components/NotificationBell";
import { CurrencyConverter } from "@/components/CurrencyConverter";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const requireAuth = (e: React.MouseEvent, href: string) => {
    if (!user) {
      e.preventDefault();
      toast({ variant: "destructive", title: t("nav.mustLogin"), description: t("nav.mustLoginDesc") });
      setLocation("/login");
    }
  };

  const links = [
    { href: "/",             label: t("nav.home"),         icon: Home },
    { href: "/visas",        label: "التأشيرات",           icon: FileText },
    { href: "/umrah",        label: t("nav.umrah"),        icon: Star },
    { href: "/reservations", label: t("nav.reservations"), icon: CalendarCheck },
    { href: "/contact",      label: t("nav.contact"),      icon: Phone },
  ];

  const isVisasActive = location.startsWith("/visas");

  return (
    <>
      <header className="sticky top-0 z-50 w-full shadow-md">
        <ClockBar />
        <div className="bg-background/95 backdrop-blur border-b border-border/40">
          <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">

            {/* Auth buttons — LEFT in RTL */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <CurrencyConverter />
              <LanguageSwitcher />
              {user ? (
                <>
                  <NotificationBell isAdmin={user.role === "admin"} />
                  {user.role === "admin" && (
                    <Link href="/admin">
                      <Button variant={location.startsWith("/admin") ? "default" : "outline"} size="sm" className="gap-1.5 rounded-full">
                        <LayoutDashboard className="w-4 h-4" />
                        <span className="hidden sm:inline">{t("nav.dashboard")}</span>
                      </Button>
                    </Link>
                  )}
                  <Link href="/profile">
                    <div className="flex items-center gap-1.5 bg-muted/60 rounded-full px-3 py-1.5 cursor-pointer hover:bg-primary/10 transition-colors">
                      <User className="w-4 h-4 text-primary" />
                      <span className="text-xs font-medium hidden sm:inline max-w-[100px] truncate">{user.name}</span>
                    </div>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => logout()}
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">{t("nav.logout")}</span>
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full font-semibold px-4 border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all gap-1.5"
                    >
                      <LogIn className="w-4 h-4" />
                      <span className="hidden sm:inline">{t("nav.login")}</span>
                    </Button>
                  </Link>
                  <Link href="/login?tab=register">
                    <Button size="sm" className="rounded-full font-semibold px-4 gap-1.5">
                      <UserPlus className="w-4 h-4" />
                      <span className="hidden sm:inline">{t("nav.register")}</span>
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Logo + Name — RIGHT in RTL */}
            <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
              <div className="hidden sm:flex flex-col leading-tight items-end">
                <span className="text-xl md:text-2xl font-extrabold text-black" style={{ fontFamily: "'Amiri', 'Noto Naskh Arabic', serif" }}>{t("nav.agencyName")}</span>
                <span className="text-xs md:text-sm font-semibold text-black/50 tracking-[0.15em]" style={{ fontFamily: "'Inter', sans-serif" }}>{t("nav.agencyNameEn")}</span>
              </div>
              <img
                src="/images/logo-chouiaar.jpg"
                alt={t("nav.agencyName")}
                className="h-14 w-auto rounded-xl object-contain border border-border/30 group-hover:scale-105 transition-transform duration-300"
              />
            </Link>

          </div>
        </div>

        {/* Nav Links Bar */}
        <div className="bg-background border-b border-border/40 overflow-x-auto">
          <div className="flex items-center justify-center gap-2 px-4 py-2.5 min-w-max mx-auto">
            {links.map((link) => {
              const Icon = link.icon;
              const active = link.href === "/visas" ? isVisasActive : location === link.href;
              return (
                <button
                  key={link.href}
                  onClick={() => {
                    if (link.href !== "/" && link.href !== "/visas" && link.href !== "/umrah" && link.href !== "/contact" && !user) {
                      toast({ variant: "destructive", title: t("nav.mustLogin"), description: t("nav.mustLoginDesc") });
                      setLocation("/login");
                      return;
                    }
                    setLocation(link.href);
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 border ${
                    active
                      ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                      : "bg-card text-foreground border-border/50 hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {link.label}
                </button>
              );
            })}

            <button
              onClick={(e) => {
                if (!user) { requireAuth(e, "/login"); return; }
                setModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 border bg-gradient-to-l from-violet-500 to-primary text-white border-transparent shadow-md shadow-primary/20 hover:opacity-90 hover:scale-105"
            >
              <Sparkles className="w-4 h-4 flex-shrink-0" />
              {t("nav.otherServices")}
            </button>
          </div>
        </div>
      </header>

      <ServiceRequestModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
