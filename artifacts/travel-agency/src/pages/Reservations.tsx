import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Hotel, Plane, X, CheckCircle, Globe, Search,
  User, CreditCard, Calendar, MapPin, FileText, ChevronLeft
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "") + "/api";

const COUNTRIES = [
  { code: "SA", name: "المملكة العربية السعودية", flag: "🇸🇦" },
  { code: "AE", name: "الإمارات العربية المتحدة", flag: "🇦🇪" },
  { code: "TR", name: "تركيا", flag: "🇹🇷" },
  { code: "EG", name: "مصر", flag: "🇪🇬" },
  { code: "MA", name: "المغرب", flag: "🇲🇦" },
  { code: "TN", name: "تونس", flag: "🇹🇳" },
  { code: "FR", name: "فرنسا", flag: "🇫🇷" },
  { code: "ES", name: "إسبانيا", flag: "🇪🇸" },
  { code: "IT", name: "إيطاليا", flag: "🇮🇹" },
  { code: "DE", name: "ألمانيا", flag: "🇩🇪" },
  { code: "GB", name: "المملكة المتحدة", flag: "🇬🇧" },
  { code: "PT", name: "البرتغال", flag: "🇵🇹" },
  { code: "GR", name: "اليونان", flag: "🇬🇷" },
  { code: "ID", name: "إندونيسيا (بالي)", flag: "🇮🇩" },
  { code: "TH", name: "تايلاند", flag: "🇹🇭" },
  { code: "MY", name: "ماليزيا", flag: "🇲🇾" },
  { code: "IN", name: "الهند", flag: "🇮🇳" },
  { code: "QA", name: "قطر", flag: "🇶🇦" },
  { code: "KW", name: "الكويت", flag: "🇰🇼" },
  { code: "JO", name: "الأردن", flag: "🇯🇴" },
  { code: "LB", name: "لبنان", flag: "🇱🇧" },
  { code: "DZ", name: "الجزائر", flag: "🇩🇿" },
  { code: "US", name: "الولايات المتحدة", flag: "🇺🇸" },
  { code: "CA", name: "كندا", flag: "🇨🇦" },
  { code: "AU", name: "أستراليا", flag: "🇦🇺" },
  { code: "MV", name: "جزر المالديف", flag: "🇲🇻" },
  { code: "ZA", name: "جنوب أفريقيا", flag: "🇿🇦" },
  { code: "SN", name: "السنغال", flag: "🇸🇳" },
];

type Step = "type" | "country" | "form" | "done";

export default function Reservations() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>("type");
  const [selectedType, setSelectedType] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<{ code: string; name: string; flag: string } | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", passportNumber: "",
    departureDate: "", returnDate: "", notes: "",
  });

  const TYPES = [
    { id: "hotel",  label: t("reservations.hotel"),  icon: Hotel,  desc: t("reservations.hotelDesc") },
    { id: "flight", label: t("reservations.flight"), icon: Plane,  desc: t("reservations.flightDesc") },
    { id: "both",   label: t("reservations.both"),   icon: Globe,  desc: t("reservations.bothDesc") },
  ];

  const filtered = COUNTRIES.filter(
    (c) => c.name.includes(search) || c.flag.includes(search)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.departureDate || !form.returnDate) {
      toast({ variant: "destructive", title: t("reservations.enterDates") });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          firstName: form.firstName,
          lastName: form.lastName,
          passportNumber: form.passportNumber,
          destination: selectedCountry?.name,
          departureDate: form.departureDate,
          returnDate: form.returnDate,
          notes: form.notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStep("done");
    } catch (err: any) {
      toast({ variant: "destructive", title: t("reservations.failed"), description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep("type");
    setSelectedType("");
    setSelectedCountry(null);
    setSearch("");
    setForm({ firstName: "", lastName: "", passportNumber: "", departureDate: "", returnDate: "", notes: "" });
  };

  const inputCls = "w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors";

  return (
    <div>
      <section className="py-16 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block bg-primary/10 text-primary px-5 py-2 rounded-full text-sm font-bold mb-4">
              {t("reservations.badge")}
            </span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              {t("reservations.title")} <span className="text-primary">{t("reservations.titleHighlight")}</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              {t("reservations.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-3xl mb-4">
        <div className="flex items-center justify-center gap-2 mt-4">
          {(["type","country","form"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step === s ? "bg-primary text-white shadow-md shadow-primary/30"
                : (["type","country","form","done"].indexOf(step) > i)
                  ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
              }`}>
                {["type","country","form","done"].indexOf(step) > i ? "✓" : i + 1}
              </div>
              {i < 2 && <div className={`w-12 h-1 rounded-full ${["type","country","form","done"].indexOf(step) > i ? "bg-green-400" : "bg-muted"}`} />}
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-12 mt-1 text-xs text-muted-foreground">
          <span className={step === "type" ? "text-primary font-bold" : ""}>{t("reservations.stepType")}</span>
          <span className={step === "country" ? "text-primary font-bold" : ""}>{t("reservations.stepDest")}</span>
          <span className={step === "form" ? "text-primary font-bold" : ""}>{t("reservations.stepData")}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-3xl pb-20">
        <AnimatePresence mode="wait">

          {step === "type" && (
            <motion.div key="type" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <h2 className="text-2xl font-bold text-center mb-8">{t("reservations.chooseType")}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {TYPES.map((tp) => {
                  const Icon = tp.icon;
                  return (
                    <button
                      key={tp.id}
                      onClick={() => { setSelectedType(tp.id); setStep("country"); }}
                      className="group bg-card border-2 border-border/50 hover:border-primary rounded-3xl p-8 text-center flex flex-col items-center gap-4 transition-all hover:shadow-xl hover:-translate-y-1"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">{tp.label}</p>
                        <p className="text-sm text-muted-foreground mt-1">{tp.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === "country" && (
            <motion.div key="country" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setStep("type")} className="p-2 rounded-xl hover:bg-muted transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-bold">{t("reservations.chooseDest")}</h2>
              </div>

              <div className="relative mb-5">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t("reservations.searchCountry")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pr-12 pl-4 py-3.5 rounded-2xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-base"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[480px] overflow-y-auto pr-1">
                {filtered.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => { setSelectedCountry(c); setStep("form"); }}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-border/50 bg-card hover:border-primary hover:bg-primary/5 transition-all text-right group"
                  >
                    <span className="text-2xl">{c.flag}</span>
                    <span className="font-medium text-sm group-hover:text-primary transition-colors">{c.name}</span>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className="col-span-3 text-center text-muted-foreground py-10">{t("reservations.noResults")}</p>
                )}
              </div>
            </motion.div>
          )}

          {step === "form" && (
            <motion.div key="form" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setStep("country")} className="p-2 rounded-xl hover:bg-muted transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-bold">{t("reservations.bookingData")}</h2>
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
                  {selectedType === "hotel" ? <Hotel className="w-4 h-4" /> : selectedType === "flight" ? <Plane className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                  {TYPES.find(tp => tp.id === selectedType)?.label}
                </div>
                <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
                  <span>{selectedCountry?.flag}</span>
                  {selectedCountry?.name}
                </div>
              </div>

              <div className="bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-5">

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                        <User className="w-4 h-4 text-primary" /> {t("reservations.firstName")} *
                      </label>
                      <input required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})}
                        placeholder={t("reservations.firstNamePh")} className={inputCls} />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                        <User className="w-4 h-4 text-primary" /> {t("reservations.lastName")} *
                      </label>
                      <input required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})}
                        placeholder={t("reservations.lastNamePh")} className={inputCls} />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                      <CreditCard className="w-4 h-4 text-primary" /> {t("reservations.passport")} *
                    </label>
                    <input required dir="ltr" value={form.passportNumber}
                      onChange={e => setForm({...form, passportNumber: e.target.value})}
                      placeholder="A 00000000" className={inputCls} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                        <Calendar className="w-4 h-4 text-primary" /> {t("reservations.departure")} *
                      </label>
                      <input required type="date" dir="ltr" value={form.departureDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={e => setForm({...form, departureDate: e.target.value})}
                        className={inputCls} />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                        <Calendar className="w-4 h-4 text-primary" /> {t("reservations.returnDate")} *
                      </label>
                      <input required type="date" dir="ltr" value={form.returnDate}
                        min={form.departureDate || new Date().toISOString().split("T")[0]}
                        onChange={e => setForm({...form, returnDate: e.target.value})}
                        className={inputCls} />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                      <FileText className="w-4 h-4 text-primary" /> {t("reservations.notes")}
                    </label>
                    <textarea rows={3} value={form.notes}
                      onChange={e => setForm({...form, notes: e.target.value})}
                      placeholder={t("reservations.notesPh")}
                      className={`${inputCls} resize-none`} />
                  </div>

                  <Button type="submit" size="lg" className="w-full h-14 text-lg rounded-2xl shadow-lg shadow-primary/20" disabled={loading}>
                    {loading ? t("reservations.sending") : t("reservations.confirm")}
                  </Button>
                </form>
              </div>
            </motion.div>
          )}

          {step === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16">
              <div className="w-28 h-28 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-14 h-14 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold mb-3">{t("reservations.successTitle")}</h2>
              <p className="text-muted-foreground text-lg mb-2">
                {t("reservations.successThank")} <strong>{form.firstName} {form.lastName}</strong>!
              </p>
              <p className="text-muted-foreground mb-8">
                {t("reservations.successTeam")}
              </p>
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 max-w-sm mx-auto mb-8 text-right">
                <p className="text-sm font-bold text-primary mb-3 text-center">{t("reservations.summary")}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">{t("reservations.summaryType")}</span><span className="font-semibold">{TYPES.find(tp=>tp.id===selectedType)?.label}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t("reservations.summaryDest")}</span><span className="font-semibold">{selectedCountry?.flag} {selectedCountry?.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t("reservations.summaryDep")}</span><span className="font-semibold">{form.departureDate}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t("reservations.summaryRet")}</span><span className="font-semibold">{form.returnDate}</span></div>
                </div>
              </div>
              <Button onClick={reset} variant="outline" size="lg" className="rounded-2xl px-10">
                {t("reservations.newBooking")}
              </Button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
