import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Globe, Search, User, CreditCard, Calendar, MapPin, FileText,
  Camera, Upload, CheckCircle, ChevronLeft, Phone, Briefcase,
  X, Image as ImageIcon
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "") + "/api";

type Country = { code: string; name: string; flag: string; note?: string; requiresAppointment?: boolean };
type Continent = { name: string; emoji: string; countries: Country[] };

const COUNTRY_VISA_TYPES: Record<string, string[]> = {
  "FR": ["tourism", "business", "student", "medical", "family", "transit"],
  "DE": ["tourism", "business", "student", "medical", "family", "transit"],
  "ES": ["tourism", "business", "student", "medical", "family", "transit"],
  "IT": ["tourism", "business", "student", "medical", "family", "transit"],
  "BE": ["tourism", "business", "student", "medical", "family", "transit"],
  "NL": ["tourism", "business", "student", "medical", "family", "transit"],
  "CH": ["tourism", "business", "student", "medical", "family", "transit"],
  "AT": ["tourism", "business", "student", "medical", "family", "transit"],
  "GR": ["tourism", "business", "student", "medical", "family", "transit"],
  "PT": ["tourism", "business", "student", "medical", "family", "transit"],
  "CZ": ["tourism", "business", "student", "medical", "family", "transit"],
  "SE": ["tourism", "business", "student", "medical", "family", "transit"],
  "NO": ["tourism", "business", "student", "medical", "family", "transit"],
  "DK": ["tourism", "business", "student", "medical", "family", "transit"],
  "FI": ["tourism", "business", "student", "medical", "family", "transit"],
  "PL": ["tourism", "business", "student", "medical", "family", "transit"],
  "RO": ["tourism", "business", "student", "medical", "family", "transit"],
  "HU": ["tourism", "business", "student", "medical", "family", "transit"],
  "US": ["tourism", "business", "student", "medical", "transit"],
  "CA": ["tourism", "business", "student", "medical", "family", "transit"],
  "GB": ["tourism", "business", "student", "medical", "family", "transit"],
};

const ALL_VISA_TYPE_LABELS: Record<string, string> = {
  tourism: "سياحية",
  business: "أعمال",
  student: "دراسية",
  medical: "علاجية",
  family: "زيارة عائلية",
  transit: "عبور",
};

const CONTINENTS: Continent[] = [
  {
    name: "الاتحاد الأوروبي / شنغن",
    emoji: "🇪🇺",
    countries: [
      { code: "FR", name: "فرنسا", flag: "🇫🇷", requiresAppointment: true },
      { code: "DE", name: "ألمانيا", flag: "🇩🇪", requiresAppointment: true },
      { code: "ES", name: "إسبانيا", flag: "🇪🇸", requiresAppointment: true },
      { code: "IT", name: "إيطاليا", flag: "🇮🇹", requiresAppointment: true },
      { code: "BE", name: "بلجيكا", flag: "🇧🇪", requiresAppointment: true },
      { code: "NL", name: "هولندا", flag: "🇳🇱", requiresAppointment: true },
      { code: "CH", name: "سويسرا", flag: "🇨🇭", requiresAppointment: true },
      { code: "AT", name: "النمسا", flag: "🇦🇹", requiresAppointment: true },
      { code: "GR", name: "اليونان", flag: "🇬🇷", requiresAppointment: true },
      { code: "PT", name: "البرتغال", flag: "🇵🇹", requiresAppointment: true },
      { code: "CZ", name: "التشيك", flag: "🇨🇿", requiresAppointment: true },
      { code: "SE", name: "السويد", flag: "🇸🇪", requiresAppointment: true },
      { code: "NO", name: "النرويج", flag: "🇳🇴", requiresAppointment: true },
      { code: "DK", name: "الدنمارك", flag: "🇩🇰", requiresAppointment: true },
      { code: "FI", name: "فنلندا", flag: "🇫🇮", requiresAppointment: true },
      { code: "PL", name: "بولندا", flag: "🇵🇱", requiresAppointment: true },
      { code: "RO", name: "رومانيا", flag: "🇷🇴", requiresAppointment: true },
      { code: "HU", name: "المجر", flag: "🇭🇺", requiresAppointment: true },
    ],
  },
  {
    name: "أمريكا الشمالية والمملكة المتحدة",
    emoji: "🌎",
    countries: [
      { code: "US", name: "الولايات المتحدة الأمريكية", flag: "🇺🇸", requiresAppointment: true },
      { code: "CA", name: "كندا", flag: "🇨🇦", requiresAppointment: true },
      { code: "GB", name: "المملكة المتحدة", flag: "🇬🇧", requiresAppointment: true },
    ],
  },
  {
    name: "آسيا والشرق الأوسط",
    emoji: "🌏",
    countries: [
      { code: "AE", name: "الإمارات العربية المتحدة", flag: "🇦🇪" },
      { code: "OM", name: "سلطنة عمان", flag: "🇴🇲" },
      { code: "BH", name: "البحرين", flag: "🇧🇭" },
      { code: "QA", name: "قطر", flag: "🇶🇦" },
      { code: "JO", name: "الأردن", flag: "🇯🇴" },
      { code: "SA", name: "السعودية", flag: "🇸🇦" },
      { code: "AZ", name: "أذربيجان", flag: "🇦🇿" },
      { code: "AM", name: "أرمينيا", flag: "🇦🇲" },
      { code: "UZ", name: "أوزبكستان", flag: "🇺🇿" },
      { code: "TJ", name: "طاجيكستان", flag: "🇹🇯" },
      { code: "LK", name: "سريلانكا", flag: "🇱🇰" },
      { code: "SG", name: "سنغافورة", flag: "🇸🇬" },
      { code: "VN", name: "فيتنام", flag: "🇻🇳" },
      { code: "PK", name: "باكستان", flag: "🇵🇰" },
      { code: "MM", name: "ميانمار", flag: "🇲🇲" },
      { code: "IR", name: "إيران", flag: "🇮🇷" },
      { code: "KG", name: "قيرغيزستان", flag: "🇰🇬" },
      { code: "KZ", name: "كازاخستان", flag: "🇰🇿" },
    ],
  },
  {
    name: "إفريقيا",
    emoji: "🌍",
    countries: [
      { code: "KE", name: "كينيا", flag: "🇰🇪", note: "عبر نظام تصريح السفر الإلكتروني eTA" },
      { code: "ZA", name: "جنوب أفريقيا", flag: "🇿🇦" },
      { code: "ET", name: "إثيوبيا", flag: "🇪🇹" },
      { code: "TZ", name: "تنزانيا", flag: "🇹🇿" },
      { code: "RW", name: "رواندا", flag: "🇷🇼" },
      { code: "CI", name: "كوت ديفوار", flag: "🇨🇮" },
      { code: "GA", name: "الغابون", flag: "🇬🇦" },
      { code: "ZM", name: "زامبيا", flag: "🇿🇲" },
      { code: "LS", name: "ليسوتو", flag: "🇱🇸" },
      { code: "DJ", name: "جيبوتي", flag: "🇩🇯" },
    ],
  },
  {
    name: "الأمريكتان ومنطقة البحر الكاريبي",
    emoji: "🏝️",
    countries: [
      { code: "CO", name: "كولومبيا", flag: "🇨🇴" },
      { code: "AG", name: "أنتيغوا وباربودا", flag: "🇦🇬" },
      { code: "BS", name: "جزر البهاما", flag: "🇧🇸" },
      { code: "KN", name: "سانت كيتس ونيفيس", flag: "🇰🇳" },
    ],
  },
  {
    name: "أوروبا وأوقيانوسيا",
    emoji: "🌐",
    countries: [
      { code: "AL", name: "ألبانيا", flag: "🇦🇱" },
      { code: "MD", name: "مولدوفا", flag: "🇲🇩" },
      { code: "AU", name: "أستراليا", flag: "🇦🇺", note: "تأشيرة زائر إلكترونية" },
    ],
  },
];

const ALL_COUNTRIES = CONTINENTS.flatMap(c => c.countries);

type Step = "country" | "form" | "done";

export default function Visas() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>("country");
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [activeContinent, setActiveContinent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: "", lastName: "", birthDate: "", birthPlace: "",
    profession: "", address: "", phone: "", passportNumber: "",
    passportIssueDate: "", passportIssuePlace: "", passportExpiryDate: "",
    travelDate: "", visaType: "tourism", duration: "", notes: "",
    appointmentDate: "", appointmentTime: "",
  });

  const getVisaTypesForCountry = (code: string) => {
    const types = COUNTRY_VISA_TYPES[code] || ["tourism", "business", "medical", "transit", "family"];
    return types.map(id => ({ id, label: ALL_VISA_TYPE_LABELS[id] || id }));
  };

  const [photo, setPhoto] = useState<File | null>(null);
  const [passportPhoto, setPassportPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [passportPreview, setPassportPreview] = useState<string | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const passportRef = useRef<HTMLInputElement>(null);

  const continentNames: Record<string, string> = {
    "الاتحاد الأوروبي / شنغن": "الاتحاد الأوروبي / شنغن",
    "أمريكا الشمالية والمملكة المتحدة": "أمريكا الشمالية والمملكة المتحدة",
    "آسيا والشرق الأوسط": t("visas.continentAsia"),
    "إفريقيا": t("visas.continentAfrica"),
    "الأمريكتان ومنطقة البحر الكاريبي": t("visas.continentAmericas"),
    "أوروبا وأوقيانوسيا": t("visas.continentEurope"),
  };

  const filteredContinents = search
    ? CONTINENTS.map(cont => ({
        ...cont,
        countries: cont.countries.filter(c =>
          c.name.includes(search) || c.code.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter(cont => cont.countries.length > 0)
    : CONTINENTS;

  const handleFileChange = (file: File | null, type: "photo" | "passport") => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === "photo") {
        setPhoto(file);
        setPhotoPreview(e.target?.result as string);
      } else {
        setPassportPhoto(file);
        setPassportPreview(e.target?.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCountry) return;
    setIsLoading(true);
    try {
      const payload = { ...form, destination: selectedCountry.name };

      const res = await fetch(`${BASE}/visa-requests`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStep("done");
      toast({ title: t("visas.successTitle") });
    } catch (err: any) {
      toast({ variant: "destructive", title: t("common.error"), description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const updateForm = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

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
              {t("visas.badge")}
            </span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              {t("visas.title")} <span className="text-primary">{t("visas.titleHighlight")}</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t("visas.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center gap-4 mb-10">
          {[
            { s: "country", label: t("visas.step1"), num: 1 },
            { s: "form", label: t("visas.step2"), num: 2 },
            { s: "done", label: t("visas.step3"), num: 3 },
          ].map((st, i) => (
            <div key={st.s} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step === st.s ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" :
                (["country","form","done"].indexOf(step) > i ? "bg-green-500 text-white" : "bg-muted text-muted-foreground")
              }`}>{st.num}</div>
              <span className={`text-sm font-medium hidden sm:inline ${step === st.s ? "text-primary" : "text-muted-foreground"}`}>{st.label}</span>
              {i < 2 && <div className="w-12 h-0.5 bg-border mx-2" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === "country" && (
            <motion.div key="country" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="max-w-4xl mx-auto">
                <div className="relative mb-8">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    className="h-14 pr-12 text-lg rounded-2xl bg-card border-border/50"
                    placeholder={t("visas.searchCountry")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                {!search && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {CONTINENTS.map((cont) => (
                      <motion.button
                        key={cont.name}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setActiveContinent(activeContinent === cont.name ? null : cont.name)}
                        className={`p-5 rounded-2xl border-2 text-center transition-all ${
                          activeContinent === cont.name
                            ? "border-primary bg-primary/10 shadow-lg"
                            : "border-border/50 bg-card hover:border-primary/40 hover:shadow-md"
                        }`}
                      >
                        <div className="text-3xl mb-2">{cont.emoji}</div>
                        <div className="font-bold text-sm">{continentNames[cont.name] || cont.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">{cont.countries.length} {t("visas.countries")}</div>
                      </motion.button>
                    ))}
                  </div>
                )}

                {filteredContinents.map((cont) => {
                  if (!search && activeContinent && activeContinent !== cont.name) return null;
                  if (!search && !activeContinent) return null;
                  return (
                    <div key={cont.name} className="mb-8">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="text-2xl">{cont.emoji}</span> {continentNames[cont.name] || cont.name}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {cont.countries.map((country) => (
                          <motion.button
                            key={country.code}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => { setSelectedCountry(country); setStep("form"); }}
                            className={`p-4 rounded-2xl border-2 text-center transition-all hover:shadow-lg ${
                              selectedCountry?.code === country.code
                                ? "border-primary bg-primary/5 shadow-md"
                                : "border-border/50 bg-card hover:border-primary/40"
                            }`}
                          >
                            <div className="text-3xl mb-2">{country.flag}</div>
                            <div className="font-bold text-sm">{country.name}</div>
                            {country.requiresAppointment && (
                              <div className="text-xs bg-amber-100 text-amber-700 font-semibold mt-1.5 px-2 py-0.5 rounded-full inline-block">📅 موعد</div>
                            )}
                            {country.note && (
                              <div className="text-xs text-muted-foreground mt-1 leading-tight">{country.note}</div>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {search && filteredContinents.length === 0 && (
                  <div className="text-center py-16 text-muted-foreground">
                    <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>{t("visas.noResults")}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === "form" && selectedCountry && (
            <motion.div key="form" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="max-w-3xl mx-auto">
                <button onClick={() => setStep("country")} className="flex items-center gap-2 text-primary hover:underline mb-6">
                  <ChevronLeft className="w-4 h-4" /> {t("visas.backToCountry")}
                </button>

                <div className={`border rounded-2xl p-5 mb-8 flex items-center gap-4 ${selectedCountry.requiresAppointment ? "bg-amber-50 border-amber-200" : "bg-primary/5 border-primary/20"}`}>
                  <span className="text-4xl">{selectedCountry.flag}</span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-lg">
                        {selectedCountry.requiresAppointment ? "تأشيرة بموعد سفارة" : t("visas.eVisa")} — {selectedCountry.name}
                      </h3>
                      {selectedCountry.requiresAppointment && (
                        <span className="text-xs bg-amber-200 text-amber-800 font-bold px-2 py-0.5 rounded-full">يستلزم موعد</span>
                      )}
                    </div>
                    {selectedCountry.note && <p className="text-sm text-muted-foreground">{selectedCountry.note}</p>}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="bg-card border border-border/50 rounded-2xl p-6">
                    <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" /> {t("visas.personalInfo")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>{t("visas.firstName")} *</Label>
                        <Input required className="h-12 rounded-xl bg-muted/50" placeholder={t("visas.firstName")} value={form.firstName} onChange={(e) => updateForm("firstName", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>{t("visas.lastName")} *</Label>
                        <Input required className="h-12 rounded-xl bg-muted/50" placeholder={t("visas.lastName")} value={form.lastName} onChange={(e) => updateForm("lastName", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>{t("visas.birthDate")} *</Label>
                        <Input required type="date" className="h-12 rounded-xl bg-muted/50" dir="ltr" value={form.birthDate} onChange={(e) => updateForm("birthDate", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>{t("visas.birthPlace")} *</Label>
                        <Input required className="h-12 rounded-xl bg-muted/50" placeholder={t("visas.birthPlacePh")} value={form.birthPlace} onChange={(e) => updateForm("birthPlace", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>{t("visas.profession")} *</Label>
                        <Input required className="h-12 rounded-xl bg-muted/50" placeholder={t("visas.professionPh")} value={form.profession} onChange={(e) => updateForm("profession", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>{t("visas.phone")} *</Label>
                        <Input required type="tel" dir="ltr" className="h-12 rounded-xl bg-muted/50" placeholder="+213 XX XX XX XX" value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <Label>{t("visas.address")} *</Label>
                        <Input required className="h-12 rounded-xl bg-muted/50" placeholder={t("visas.addressFull")} value={form.address} onChange={(e) => updateForm("address", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border/50 rounded-2xl p-6">
                    <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-primary" /> {t("visas.passportInfo")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>{t("visas.passportNumber")} *</Label>
                        <Input required dir="ltr" className="h-12 rounded-xl bg-muted/50" placeholder={t("visas.passportNumber")} value={form.passportNumber} onChange={(e) => updateForm("passportNumber", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>{t("visas.passportPlace")} *</Label>
                        <Input required className="h-12 rounded-xl bg-muted/50" placeholder={t("visas.birthPlacePh")} value={form.passportIssuePlace} onChange={(e) => updateForm("passportIssuePlace", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>{t("visas.passportIssue")} *</Label>
                        <Input required type="date" dir="ltr" className="h-12 rounded-xl bg-muted/50" value={form.passportIssueDate} onChange={(e) => updateForm("passportIssueDate", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>{t("visas.passportExpiry")} *</Label>
                        <Input required type="date" dir="ltr" className="h-12 rounded-xl bg-muted/50" value={form.passportExpiryDate} onChange={(e) => updateForm("passportExpiryDate", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border/50 rounded-2xl p-6">
                    <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-primary" /> {t("visas.visaDetails")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>{t("visas.visaType")}</Label>
                        <select
                          className="w-full h-12 rounded-xl bg-muted/50 border border-input px-3 text-sm"
                          value={form.visaType}
                          onChange={(e) => updateForm("visaType", e.target.value)}
                        >
                          {getVisaTypesForCountry(selectedCountry.code).map(vt => (
                            <option key={vt.id} value={vt.id}>{vt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>{t("visas.travelDate")}</Label>
                        <Input type="date" dir="ltr" className="h-12 rounded-xl bg-muted/50" value={form.travelDate} onChange={(e) => updateForm("travelDate", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>{t("visas.stayDuration")}</Label>
                        <Input className="h-12 rounded-xl bg-muted/50" placeholder={t("visas.stayDurationPh")} value={form.duration} onChange={(e) => updateForm("duration", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  {selectedCountry.requiresAppointment && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                      <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-amber-800">
                        <Calendar className="w-5 h-5" /> موعد السفارة المطلوب
                      </h3>
                      <p className="text-sm text-amber-700 mb-5">
                        تأشيرة {selectedCountry.name} تستلزم حجز موعد في السفارة. حدد التاريخ والوقت المفضل لديك وسيتولى فريقنا تنسيق الموعد نيابةً عنك.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label>التاريخ المفضل للموعد *</Label>
                          <Input
                            required
                            type="date"
                            dir="ltr"
                            className="h-12 rounded-xl bg-white border-amber-300"
                            min={new Date().toISOString().split("T")[0]}
                            value={form.appointmentDate}
                            onChange={(e) => updateForm("appointmentDate", e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>الوقت المفضل</Label>
                          <select
                            className="w-full h-12 rounded-xl bg-white border border-amber-300 px-3 text-sm"
                            value={form.appointmentTime}
                            onChange={(e) => updateForm("appointmentTime", e.target.value)}
                          >
                            <option value="">اختر الوقت المناسب</option>
                            <option value="08:00">08:00 صباحاً</option>
                            <option value="09:00">09:00 صباحاً</option>
                            <option value="10:00">10:00 صباحاً</option>
                            <option value="11:00">11:00 صباحاً</option>
                            <option value="12:00">12:00 ظهراً</option>
                            <option value="13:00">01:00 مساءً</option>
                            <option value="14:00">02:00 مساءً</option>
                            <option value="15:00">03:00 مساءً</option>
                            <option value="16:00">04:00 مساءً</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-card border border-border/50 rounded-2xl p-6">
                    <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                      <Camera className="w-5 h-5 text-primary" /> {t("visas.photos")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="mb-3 block">{t("visas.personalPhoto")}</Label>
                        <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0] || null, "photo")} />
                        {photoPreview ? (
                          <div className="relative w-40 h-48 mx-auto">
                            <img src={photoPreview} alt={t("visas.personalPhoto")} className="w-full h-full object-cover rounded-xl border-2 border-primary/30" />
                            <button type="button" onClick={() => { setPhoto(null); setPhotoPreview(null); }} className="absolute -top-2 -left-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => photoRef.current?.click()}
                            className="w-full h-40 border-2 border-dashed border-border/60 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-primary/40 hover:bg-primary/5 transition-all">
                            <ImageIcon className="w-10 h-10 text-muted-foreground/50" />
                            <span className="text-sm text-muted-foreground">{t("visas.clickUploadPhoto")}</span>
                            <span className="text-xs text-muted-foreground/60">{t("visas.photoLimit")}</span>
                          </button>
                        )}
                      </div>

                      <div>
                        <Label className="mb-3 block">{t("visas.passportPhoto")}</Label>
                        <input ref={passportRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0] || null, "passport")} />
                        {passportPreview ? (
                          <div className="relative w-full h-48 mx-auto">
                            <img src={passportPreview} alt={t("visas.passportPhoto")} className="w-full h-full object-cover rounded-xl border-2 border-primary/30" />
                            <button type="button" onClick={() => { setPassportPhoto(null); setPassportPreview(null); }} className="absolute -top-2 -left-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => passportRef.current?.click()}
                            className="w-full h-40 border-2 border-dashed border-border/60 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-primary/40 hover:bg-primary/5 transition-all">
                            <Upload className="w-10 h-10 text-muted-foreground/50" />
                            <span className="text-sm text-muted-foreground">{t("visas.clickUploadPassport")}</span>
                            <span className="text-xs text-muted-foreground/60">{t("visas.photoLimit")}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border/50 rounded-2xl p-6">
                    <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" /> {t("visas.additionalNotes")}
                    </h3>
                    <textarea
                      className="w-full h-28 rounded-xl bg-muted/50 border border-input p-4 text-sm resize-none"
                      placeholder={t("visas.notesPlaceholder")}
                      value={form.notes}
                      onChange={(e) => updateForm("notes", e.target.value)}
                    />
                  </div>

                  <Button type="submit" className="w-full h-14 text-lg rounded-2xl shadow-lg shadow-primary/20" disabled={isLoading}>
                    {isLoading ? t("visas.sending") : t("visas.submitVisa")}
                  </Button>
                </form>
              </div>
            </motion.div>
          )}

          {step === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto text-center py-16">
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-3xl font-serif font-bold mb-4">{t("visas.successTitle")}</h2>
              <p className="text-muted-foreground text-lg mb-3">
                {t("visas.successDesc")} <span className="font-bold text-primary">{selectedCountry?.name}</span>
              </p>
              <p className="text-muted-foreground mb-8">{t("visas.successTeam")}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => { setStep("country"); setForm({ firstName: "", lastName: "", birthDate: "", birthPlace: "", profession: "", address: "", phone: "", passportNumber: "", passportIssueDate: "", passportIssuePlace: "", passportExpiryDate: "", travelDate: "", visaType: "tourism", duration: "", notes: "", appointmentDate: "", appointmentTime: "" }); setPhoto(null); setPassportPhoto(null); setPhotoPreview(null); setPassportPreview(null); setSelectedCountry(null); }} className="rounded-xl h-12 px-8">
                  {t("visas.anotherVisa")}
                </Button>
                <Button variant="outline" onClick={() => window.location.href = "/"} className="rounded-xl h-12 px-8">
                  {t("visas.backHome")}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
