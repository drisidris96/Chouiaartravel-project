import { Link } from "wouter";
import { useGetTrips } from "@workspace/api-client-react";
import { TripCard } from "@/components/TripCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe2, ShieldCheck, HeadphonesIcon, FileText, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Home() {
  const { data: featuredTrips, isLoading } = useGetTrips({ featured: true });
  const { t } = useLanguage();

  return (
    <div>
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1538332576228-eb5b4c4de6f5?q=80&w=2000&auto=format&fit=crop" 
            alt="Luxury Travel" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-secondary/60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center mb-6"
            >
              <img
                src="/images/logo-chouiaar.jpg"
                alt={t("nav.agencyName")}
                className="h-28 md:h-36 w-auto rounded-2xl shadow-2xl border-2 border-white/20"
              />
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-3 leading-tight">
              {t("home.heroTitle")}
            </h1>
            <p className="text-primary text-xl md:text-2xl font-bold mb-5 tracking-wide">
              {t("home.heroSubtitle")}
            </p>
            <p className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed font-light max-w-2xl mx-auto">
              {t("home.heroDesc")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/trips">
                <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300">
                  {t("home.trips")}
                </Button>
              </Link>
              <Link href="/umrah">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur transition-all duration-300">
                  {t("home.umrahPackages")}
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur transition-all duration-300">
                  {t("home.contactUs")}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-background relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-bold mb-2 block text-sm uppercase tracking-wider">{t("home.servicesLabel")}</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">{t("home.servicesTitle")}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { icon: Globe2, label: t("home.svcTrips"), href: "/trips", desc: t("home.svcTripsDesc") },
              { icon: FileText, label: t("home.svcVisas"), href: "/visas", desc: t("home.svcVisasDesc") },
              { icon: Star, label: t("home.svcUmrah"), href: "/umrah", desc: t("home.svcUmrahDesc") },
              { icon: ShieldCheck, label: t("home.svcSafe"), href: "/trips", desc: t("home.svcSafeDesc") },
              { icon: HeadphonesIcon, label: t("home.svcSupport"), href: "/contact", desc: t("home.svcSupportDesc") },
            ].map((item, i) => (
              <Link key={i} href={item.href}>
                <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-card border border-border/50 shadow-sm hover:border-primary/40 hover:shadow-lg hover:-translate-y-2 transition-all duration-300 cursor-pointer h-full">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-base font-bold mb-2">{item.label}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-primary font-bold mb-2 block">{t("home.specialOffers")}</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
              {t("home.featuredTrips")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              {t("home.featuredDesc")}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col space-y-4">
                  <Skeleton className="h-64 rounded-xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : featuredTrips && featuredTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              {t("home.noFeatured")}
            </div>
          )}

          <div className="mt-16 text-center">
            <Link href="/trips">
              <Button size="lg" variant="outline" className="h-14 px-10 rounded-full border-primary/20 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300">
                {t("home.viewAll")}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
