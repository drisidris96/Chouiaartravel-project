import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Star, Users, Hotel, HeadphonesIcon, Phone } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Umrah() {
  const { t } = useLanguage();

  const packages = [
    {
      name: t("umrah.economy"),
      duration: `10 ${t("umrah.days")}`,
      hotel: t("umrah.hotel3"),
      distance: t("umrah.dist500"),
      capacity: t("umrah.cap20"),
      color: "from-slate-500 to-slate-700",
      features: [t("umrah.feat1_1"), t("umrah.feat1_2"), t("umrah.feat1_3"), t("umrah.feat1_4"), t("umrah.feat1_5")],
    },
    {
      name: t("umrah.silver"),
      duration: `12 ${t("umrah.day")}`,
      hotel: t("umrah.hotel4"),
      distance: t("umrah.dist200"),
      capacity: t("umrah.cap15"),
      color: "from-amber-500 to-amber-700",
      featured: true,
      features: [t("umrah.feat2_1"), t("umrah.feat2_2"), t("umrah.feat2_3"), t("umrah.feat2_4"), t("umrah.feat2_5"), t("umrah.feat2_6")],
    },
    {
      name: t("umrah.gold"),
      duration: `15 ${t("umrah.day")}`,
      hotel: t("umrah.hotel5"),
      distance: t("umrah.dist50"),
      capacity: t("umrah.cap10"),
      color: "from-yellow-500 to-yellow-700",
      features: [t("umrah.feat3_1"), t("umrah.feat3_2"), t("umrah.feat3_3"), t("umrah.feat3_4"), t("umrah.feat3_5"), t("umrah.feat3_6"), t("umrah.feat3_7")],
    },
  ];

  const whyUs = [
    { icon: Star, title: t("umrah.why1"), desc: t("umrah.why1Desc") },
    { icon: Users, title: t("umrah.why2"), desc: t("umrah.why2Desc") },
    { icon: HeadphonesIcon, title: t("umrah.why3"), desc: t("umrah.why3Desc") },
    { icon: Hotel, title: t("umrah.why4"), desc: t("umrah.why4Desc") },
  ];

  return (
    <div>
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://picsum.photos/seed/kaaba/1400/700"
            alt="Umrah"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block bg-primary/20 text-primary border border-primary/30 px-5 py-2 rounded-full text-sm font-bold mb-5 backdrop-blur">
              {t("umrah.badge")}
            </span>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight">
              {t("umrah.title")} <span className="text-primary">{t("umrah.titleHighlight")}</span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              {t("umrah.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-center mb-12">{t("umrah.whyTitle")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyUs.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center p-6 bg-card rounded-2xl border border-border/50 hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-serif font-bold mb-4">{t("umrah.packagesTitle")}</h2>
            <p className="text-muted-foreground text-lg">{t("umrah.packagesSubtitle")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-3xl overflow-hidden border ${pkg.featured ? "border-primary shadow-2xl shadow-primary/20 scale-105" : "border-border/50 shadow-lg"}`}
              >
                {pkg.featured && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                      {t("umrah.mostPopular")}
                    </span>
                  </div>
                )}
                <div className={`bg-gradient-to-br ${pkg.color} p-8 text-white`}>
                  <h3 className="text-2xl font-bold mb-1">{pkg.name}</h3>
                  <p className="text-white/70 text-sm mb-4">{pkg.duration} • {pkg.hotel}</p>
                  <p className="text-white/80 text-sm mt-2">{t("umrah.contactPrice")}</p>
                </div>

                <div className="bg-card p-6">
                  <div className="flex flex-wrap gap-3 mb-5 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Hotel className="w-4 h-4 text-primary" />{pkg.distance}</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4 text-primary" />{pkg.capacity}</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {pkg.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm">
                        <span className="text-primary font-bold">✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/contact">
                    <Button className={`w-full rounded-full ${pkg.featured ? "" : "variant-outline"}`} variant={pkg.featured ? "default" : "outline"}>
                      {t("umrah.bookNow")}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif font-bold mb-4">{t("umrah.ctaTitle")}</h2>
          <p className="text-muted-foreground mb-8 text-lg">{t("umrah.ctaSubtitle")}</p>
          <Link href="/contact">
            <Button size="lg" className="rounded-full h-13 px-10 gap-2">
              <Phone className="w-5 h-5" />
              {t("umrah.ctaBtn")}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
