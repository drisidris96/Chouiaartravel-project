import { Link } from "wouter";
import { MapPin, Phone, Mail, Facebook } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-secondary text-secondary-foreground pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6 inline-flex">
              <img
                src="/images/logo-chouiaar.jpg"
                alt={t("footer.agencyName")}
                className="h-16 w-auto rounded-xl border border-white/10"
              />
              <div className="flex flex-col leading-tight">
                <span className="font-serif text-xl font-bold text-white">{t("footer.agencyName")}</span>
                <span className="text-primary text-sm font-semibold">{t("footer.agencySubtitle")}</span>
              </div>
            </Link>
            <p className="text-secondary-foreground/70 text-base leading-relaxed max-w-md">
              {t("footer.about")}
            </p>
          </div>

          <div>
            <h4 className="font-serif text-xl font-bold mb-6 text-white">{t("footer.quickLinks")}</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-secondary-foreground/70 hover:text-primary transition-colors">{t("footer.home")}</Link></li>
              <li><Link href="/visas" className="text-secondary-foreground/70 hover:text-primary transition-colors">{t("footer.visas")}</Link></li>
              <li><Link href="/umrah" className="text-secondary-foreground/70 hover:text-primary transition-colors">{t("footer.umrah")}</Link></li>
              <li><Link href="/trips" className="text-secondary-foreground/70 hover:text-primary transition-colors">{t("footer.trips")}</Link></li>
              <li><Link href="/contact" className="text-secondary-foreground/70 hover:text-primary transition-colors">{t("footer.contact")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-xl font-bold mb-6 text-white">{t("footer.contactTitle")}</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-secondary-foreground/70">
                <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span>{t("footer.location")}</span>
              </li>
              <li className="flex items-center gap-3 text-secondary-foreground/70">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <a href="tel:+21374718496" className="hover:text-primary transition-colors" dir="ltr">+213 74 71 84 96</a>
              </li>
              <li className="flex items-center gap-3 text-secondary-foreground/70">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <a href="mailto:chouiaartravelagency@gmail.com" className="hover:text-primary transition-colors">chouiaartravelagency@gmail.com</a>
              </li>
            </ul>
            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://www.facebook.com/share/1CEBKfuqDo/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/213774718496"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-secondary-foreground/50 text-sm">
          <p>© {new Date().getFullYear()} {t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
