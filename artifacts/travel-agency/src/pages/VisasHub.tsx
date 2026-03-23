import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Globe, FileText, CalendarClock, ChevronLeft } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function VisasHub() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();

  const cards = [
    {
      icon: Globe,
      emoji: "🌐",
      title: "التأشيرات الإلكترونية",
      subtitle: "تقديم الطلب أونلاين بدون زيارة السفارة",
      desc: "دول تمنح تأشيرة إلكترونية للجزائريين — آسيا، إفريقيا، الأمريكتان، أوقيانوسيا",
      color: "from-blue-500/10 to-primary/10",
      border: "border-primary/30",
      badge: "bg-primary/10 text-primary",
      badgeText: "E-Visa",
      href: "/visas/electronic",
    },
    {
      icon: FileText,
      emoji: "📋",
      title: "التأشيرات العادية",
      subtitle: "تقديم الملف لدى القنصلية أو السفارة",
      desc: "دول تستلزم تقديم الملف بشكل مادي — أوروبا، أمريكا، آسيا وغيرها",
      color: "from-amber-500/10 to-orange-500/10",
      border: "border-amber-400/40",
      badge: "bg-amber-100 text-amber-800",
      badgeText: "Embassy",
      href: "/visas/regular",
    },
    {
      icon: CalendarClock,
      emoji: "📅",
      title: "حجز مواعيد فيزا",
      subtitle: "حجز موعد السفارة — الاتحاد الأوروبي وأمريكا الشمالية",
      desc: "الاتحاد الأوروبي (شنغن)، الولايات المتحدة الأمريكية، كندا، المملكة المتحدة",
      color: "from-violet-500/10 to-pink-500/10",
      border: "border-violet-400/40",
      badge: "bg-violet-100 text-violet-800",
      badgeText: "RDV",
      href: "/visas/appointments",
    },
  ];

  return (
    <div>
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full bg-primary blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block bg-primary/10 text-primary px-5 py-2 rounded-full text-sm font-bold mb-4">
              🌍 خدمات التأشيرات
            </span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              اختر نوع <span className="text-primary">التأشيرة</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              نقدم لك جميع خدمات التأشيرات — الإلكترونية، العادية، وحجز المواعيد القنصلية
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.href}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setLocation(card.href)}
                className={`text-start p-8 rounded-3xl border-2 ${card.border} bg-gradient-to-br ${card.color} backdrop-blur hover:shadow-2xl transition-all duration-300 group`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="text-5xl">{card.emoji}</div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${card.badge}`}>{card.badgeText}</span>
                </div>
                <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{card.title}</h2>
                <p className="text-sm font-semibold text-muted-foreground mb-4">{card.subtitle}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
                <div className="flex items-center gap-1 mt-6 text-primary font-bold text-sm">
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  اضغط للبدء
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
