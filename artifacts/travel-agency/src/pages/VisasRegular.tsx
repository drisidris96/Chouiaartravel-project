import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Globe, Search, User, CreditCard, FileText,
  Camera, Upload, CheckCircle, ChevronLeft,
  X, Image as ImageIcon, Paperclip, ArrowLeft
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useLocation } from "wouter";

const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "") + "/api";

type Country = { code: string; name: string; flag: string; continent: string; visaTypes: string[] };

const VISA_TYPE_LABELS: Record<string, string> = {
  tourism: "سياحية",
  business: "أعمال",
  student: "دراسية",
  medical: "علاجية",
  family: "زيارة عائلية",
  transit: "عبور",
  work: "عمل",
  residency: "إقامة",
  cultural: "ثقافية",
};

const REGULAR_COUNTRIES: { continent: string; emoji: string; countries: Country[] }[] = [
  {
    continent: "أوروبا (شنغن)",
    emoji: "🇪🇺",
    countries: [
      { code: "FR", name: "فرنسا", flag: "🇫🇷", continent: "أوروبا (شنغن)", visaTypes: ["tourism","business","student","medical","family","transit"] },
      { code: "DE", name: "ألمانيا", flag: "🇩🇪", continent: "أوروبا (شنغن)", visaTypes: ["tourism","business","student","medical","family","transit"] },
      { code: "ES", name: "إسبانيا", flag: "🇪🇸", continent: "أوروبا (شنغن)", visaTypes: ["tourism","business","student","medical","family","transit"] },
      { code: "IT", name: "إيطاليا", flag: "🇮🇹", continent: "أوروبا (شنغن)", visaTypes: ["tourism","business","student","medical","family","transit"] },
      { code: "BE", name: "بلجيكا", flag: "🇧🇪", continent: "أوروبا (شنغن)", visaTypes: ["tourism","business","student","medical","family","transit"] },
      { code: "NL", name: "هولندا", flag: "🇳🇱", continent: "أوروبا (شنغن)", visaTypes: ["tourism","business","student","medical","family","transit"] },
      { code: "CH", name: "سويسرا", flag: "🇨🇭", continent: "أوروبا (شنغن)", visaTypes: ["tourism","business","student","medical","family","transit"] },
      { code: "AT", name: "النمسا", flag: "🇦🇹", continent: "أوروبا (شنغن)", visaTypes: ["tourism","business","student","medical","family","transit"] },
      { code: "GR", name: "اليونان", flag: "🇬🇷", continent: "أوروبا (شنغن)", visaTypes: ["tourism","business","student","medical","family","transit"] },
      { code: "PT", name: "البرتغال", flag: "🇵🇹", continent: "أوروبا (شنغن)", visaTypes: ["tourism","business","student","medical","family","transit"] },
      { code: "SE", name: "السويد", flag: "🇸🇪", continent: "أوروبا (شنغن)", visaTypes: ["tourism","business","student","medical","family","transit"] },
      { code: "NO", name: "النرويج", flag: "🇳🇴", continent: "أوروبا (شنغن)", visaTypes: ["tourism","business","student","medical","family","transit"] },
      { code: "DK", name: "الدنمارك", flag: "🇩🇰", continent: "أوروبا (شنغن)", visaTypes: ["tourism","business","student","medical","family","transit"] },
      { code: "FI", name: "فنلندا", flag: "🇫🇮", continent: "أوروبا (شنغن)", visaTypes: ["tourism","business","student","medical","family","transit"] },
      { code: "PL", name: "بولندا", flag: "🇵🇱", continent: "أوروبا (شنغن)", visaTypes: ["tourism","business","student","medical","family","transit"] },
      { code: "CZ", name: "التشيك", flag: "🇨🇿", continent: "أوروبا (شنغن)", visaTypes: ["tourism","business","student","medical","family","transit"] },
      { code: "RO", name: "رومانيا", flag: "🇷🇴", continent: "أوروبا (شنغن)", visaTypes: ["tourism","business","student","medical","family","transit"] },
      { code: "HU", name: "المجر", flag: "🇭🇺", continent: "أوروبا (شنغن)", visaTypes: ["tourism","business","student","medical","family","transit"] },
    ],
  },
  {
    continent: "أوروبا (خارج شنغن)",
    emoji: "🌍",
    countries: [
      { code: "GB", name: "المملكة المتحدة", flag: "🇬🇧", continent: "أوروبا (خارج شنغن)", visaTypes: ["tourism","business","student","medical","family","transit","work"] },
      { code: "RS", name: "صربيا", flag: "🇷🇸", continent: "أوروبا (خارج شنغن)", visaTypes: ["tourism","business","student","transit"] },
      { code: "BA", name: "البوسنة والهرسك", flag: "🇧🇦", continent: "أوروبا (خارج شنغن)", visaTypes: ["tourism","business","transit"] },
      { code: "UA", name: "أوكرانيا", flag: "🇺🇦", continent: "أوروبا (خارج شنغن)", visaTypes: ["tourism","business","transit"] },
      { code: "BY", name: "بيلاروسيا", flag: "🇧🇾", continent: "أوروبا (خارج شنغن)", visaTypes: ["tourism","business","transit"] },
      { code: "RU", name: "روسيا", flag: "🇷🇺", continent: "أوروبا (خارج شنغن)", visaTypes: ["tourism","business","student","transit"] },
    ],
  },
  {
    continent: "أمريكا الشمالية",
    emoji: "🌎",
    countries: [
      { code: "US", name: "الولايات المتحدة الأمريكية", flag: "🇺🇸", continent: "أمريكا الشمالية", visaTypes: ["tourism","business","student","medical","transit","work"] },
      { code: "CA", name: "كندا", flag: "🇨🇦", continent: "أمريكا الشمالية", visaTypes: ["tourism","business","student","medical","family","transit","work","residency"] },
      { code: "MX", name: "المكسيك", flag: "🇲🇽", continent: "أمريكا الشمالية", visaTypes: ["tourism","business","transit"] },
    ],
  },
  {
    continent: "آسيا والمحيط الهادئ",
    emoji: "🌏",
    countries: [
      { code: "JP", name: "اليابان", flag: "🇯🇵", continent: "آسيا والمحيط الهادئ", visaTypes: ["tourism","business","student","medical","transit","cultural"] },
      { code: "KR", name: "كوريا الجنوبية", flag: "🇰🇷", continent: "آسيا والمحيط الهادئ", visaTypes: ["tourism","business","student","medical","transit"] },
      { code: "CN", name: "الصين", flag: "🇨🇳", continent: "آسيا والمحيط الهادئ", visaTypes: ["tourism","business","student","transit"] },
      { code: "IN", name: "الهند", flag: "🇮🇳", continent: "آسيا والمحيط الهادئ", visaTypes: ["tourism","business","student","medical","transit"] },
      { code: "MY", name: "ماليزيا", flag: "🇲🇾", continent: "آسيا والمحيط الهادئ", visaTypes: ["tourism","business","transit"] },
      { code: "TH", name: "تايلاند", flag: "🇹🇭", continent: "آسيا والمحيط الهادئ", visaTypes: ["tourism","business","transit"] },
      { code: "ID", name: "إندونيسيا", flag: "🇮🇩", continent: "آسيا والمحيط الهادئ", visaTypes: ["tourism","business","transit"] },
      { code: "PH", name: "الفلبين", flag: "🇵🇭", continent: "آسيا والمحيط الهادئ", visaTypes: ["tourism","business","transit"] },
      { code: "BD", name: "بنغلاديش", flag: "🇧🇩", continent: "آسيا والمحيط الهادئ", visaTypes: ["tourism","business","transit"] },
      { code: "NP", name: "نيبال", flag: "🇳🇵", continent: "آسيا والمحيط الهادئ", visaTypes: ["tourism","business","transit"] },
    ],
  },
  {
    continent: "إفريقيا",
    emoji: "🌍",
    countries: [
      { code: "ZA", name: "جنوب أفريقيا", flag: "🇿🇦", continent: "إفريقيا", visaTypes: ["tourism","business","student","transit"] },
      { code: "EG", name: "مصر", flag: "🇪🇬", continent: "إفريقيا", visaTypes: ["tourism","business","family","transit"] },
      { code: "MA", name: "المغرب", flag: "🇲🇦", continent: "إفريقيا", visaTypes: ["tourism","business","family"] },
      { code: "TN", name: "تونس", flag: "🇹🇳", continent: "إفريقيا", visaTypes: ["tourism","business","family"] },
      { code: "NG", name: "نيجيريا", flag: "🇳🇬", continent: "إفريقيا", visaTypes: ["tourism","business","transit"] },
      { code: "GH", name: "غانا", flag: "🇬🇭", continent: "إفريقيا", visaTypes: ["tourism","business","transit"] },
    ],
  },
  {
    continent: "أمريكا اللاتينية",
    emoji: "🏝️",
    countries: [
      { code: "BR", name: "البرازيل", flag: "🇧🇷", continent: "أمريكا اللاتينية", visaTypes: ["tourism","business","student","transit"] },
      { code: "AR", name: "الأرجنتين", flag: "🇦🇷", continent: "أمريكا اللاتينية", visaTypes: ["tourism","business","transit"] },
      { code: "CL", name: "تشيلي", flag: "🇨🇱", continent: "أمريكا اللاتينية", visaTypes: ["tourism","business","transit"] },
      { code: "PE", name: "بيرو", flag: "🇵🇪", continent: "أمريكا اللاتينية", visaTypes: ["tourism","business","transit"] },
    ],
  },
];

type Step = "country" | "form" | "done";

export default function VisasRegular() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
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
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [passportScan, setPassportScan] = useState<File | null>(null);
  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [passportPreview, setPassportPreview] = useState<string | null>(null);

  const photoRef = useRef<HTMLInputElement>(null);
  const passportRef = useRef<HTMLInputElement>(null);
  const extraRef = useRef<HTMLInputElement>(null);

  const updateForm = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleFileChange = (file: File | null, type: "photo" | "passport") => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === "photo") { setPhoto(file); setPhotoPreview(e.target?.result as string); }
      else { setPassportScan(file); setPassportPreview(e.target?.result as string); }
    };
    reader.readAsDataURL(file);
  };

  const handleExtraFiles = (files: FileList | null) => {
    if (!files) return;
    setExtraFiles(prev => [...prev, ...Array.from(files)]);
  };

  const filteredContinents = search
    ? REGULAR_COUNTRIES.map(c => ({ ...c, countries: c.countries.filter(ct => ct.name.includes(search) || ct.code.toLowerCase().includes(search.toLowerCase())) })).filter(c => c.countries.length > 0)
    : REGULAR_COUNTRIES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCountry) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v); });
      formData.append("destination", selectedCountry.name);
      formData.append("visaCategory", "regular");
      if (photo) formData.append("photo", photo);
      if (passportScan) formData.append("passportPhoto", passportScan);
      extraFiles.forEach((f, i) => formData.append(`extraFile_${i}`, f));

      const res = await fetch(`${BASE}/visa-requests`, {
        method: "POST", credentials: "include", body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStep("done");
      toast({ title: "✅ تم إرسال طلبك بنجاح!" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "خطأ", description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <section className="relative py-16 overflow-hidden bg-gradient-to-br from-amber-500/10 via-background to-background">
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <button onClick={() => setLocation("/visas")} className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-4 transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" /> العودة لقائمة التأشيرات
            </button>
            <div className="mb-4">
              <span className="inline-block bg-amber-100 text-amber-800 px-5 py-2 rounded-full text-sm font-bold">
                📋 التأشيرات العادية — Embassy Visa
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              تقديم ملف <span className="text-primary">تأشيرة</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              اختر الدولة الوجهة وأملأ الاستمارة — سيتولى فريقنا متابعة ملفك لدى القنصلية
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-center gap-4 mb-10">
          {[
            { s: "country", label: "اختيار الدولة", num: 1 },
            { s: "form", label: "معلومات الطلب", num: 2 },
            { s: "done", label: "تم الإرسال", num: 3 },
          ].map((st, i) => (
            <div key={st.s} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step === st.s ? "bg-primary text-primary-foreground shadow-lg" :
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
                  <Input className="h-14 pr-12 text-lg rounded-2xl bg-card border-border/50" placeholder="ابحث عن الدولة..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>

                {!search && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                    {REGULAR_COUNTRIES.map((cont) => (
                      <motion.button key={cont.continent} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => setActiveContinent(activeContinent === cont.continent ? null : cont.continent)}
                        className={`p-5 rounded-2xl border-2 text-center transition-all ${activeContinent === cont.continent ? "border-primary bg-primary/10 shadow-lg" : "border-border/50 bg-card hover:border-primary/40"}`}
                      >
                        <div className="text-3xl mb-2">{cont.emoji}</div>
                        <div className="font-bold text-sm">{cont.continent}</div>
                        <div className="text-xs text-muted-foreground mt-1">{cont.countries.length} دولة</div>
                      </motion.button>
                    ))}
                  </div>
                )}

                {filteredContinents.map((cont) => {
                  if (!search && activeContinent && activeContinent !== cont.continent) return null;
                  if (!search && !activeContinent) return null;
                  return (
                    <div key={cont.continent} className="mb-8">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="text-2xl">{cont.emoji}</span> {cont.continent}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {cont.countries.map((country) => (
                          <motion.button key={country.code} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            onClick={() => { setSelectedCountry(country); setForm(p => ({ ...p, visaType: country.visaTypes[0] })); setStep("form"); }}
                            className="p-4 rounded-2xl border-2 text-center transition-all hover:shadow-lg border-border/50 bg-card hover:border-primary/40"
                          >
                            <div className="text-3xl mb-2">{country.flag}</div>
                            <div className="font-bold text-sm">{country.name}</div>
                            <div className="text-xs text-amber-600 font-semibold mt-1">🏛️ سفارة</div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {search && filteredContinents.length === 0 && (
                  <div className="text-center py-16 text-muted-foreground">
                    <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>لا توجد نتائج لـ "{search}"</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === "form" && selectedCountry && (
            <motion.div key="form" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="max-w-3xl mx-auto">
                <button onClick={() => setStep("country")} className="flex items-center gap-2 text-primary hover:underline mb-6">
                  <ChevronLeft className="w-4 h-4" /> العودة لاختيار الدولة
                </button>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 flex items-center gap-4">
                  <span className="text-4xl">{selectedCountry.flag}</span>
                  <div>
                    <h3 className="font-bold text-lg">تأشيرة سفارة — {selectedCountry.name}</h3>
                    <p className="text-sm text-muted-foreground">تقديم الملف لدى القنصلية الجزائرية أو السفارة المحلية</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="bg-card border border-border/50 rounded-2xl p-6">
                    <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" /> المعلومات الشخصية
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>الاسم *</Label>
                        <Input required className="h-12 rounded-xl bg-muted/50" placeholder="الاسم" value={form.firstName} onChange={(e) => updateForm("firstName", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>اللقب *</Label>
                        <Input required className="h-12 rounded-xl bg-muted/50" placeholder="اللقب" value={form.lastName} onChange={(e) => updateForm("lastName", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>تاريخ الميلاد *</Label>
                        <Input required type="date" dir="ltr" className="h-12 rounded-xl bg-muted/50" value={form.birthDate} onChange={(e) => updateForm("birthDate", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>مكان الميلاد *</Label>
                        <Input required className="h-12 rounded-xl bg-muted/50" placeholder="الولاية" value={form.birthPlace} onChange={(e) => updateForm("birthPlace", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>المهنة *</Label>
                        <Input required className="h-12 rounded-xl bg-muted/50" placeholder="مثال: موظف، طالب، تاجر..." value={form.profession} onChange={(e) => updateForm("profession", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>رقم الهاتف *</Label>
                        <Input required type="tel" dir="ltr" className="h-12 rounded-xl bg-muted/50" placeholder="+213 XX XX XX XX" value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <Label>العنوان الكامل *</Label>
                        <Input required className="h-12 rounded-xl bg-muted/50" placeholder="الولاية، المدينة، الحي، الشارع..." value={form.address} onChange={(e) => updateForm("address", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border/50 rounded-2xl p-6">
                    <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-primary" /> معلومات جواز السفر
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>رقم جواز السفر *</Label>
                        <Input required dir="ltr" className="h-12 rounded-xl bg-muted/50" placeholder="XXXXXXXXX" value={form.passportNumber} onChange={(e) => updateForm("passportNumber", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>مكان الإصدار *</Label>
                        <Input required className="h-12 rounded-xl bg-muted/50" placeholder="الولاية" value={form.passportIssuePlace} onChange={(e) => updateForm("passportIssuePlace", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>تاريخ الإصدار *</Label>
                        <Input required type="date" dir="ltr" className="h-12 rounded-xl bg-muted/50" value={form.passportIssueDate} onChange={(e) => updateForm("passportIssueDate", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>تاريخ الانتهاء *</Label>
                        <Input required type="date" dir="ltr" className="h-12 rounded-xl bg-muted/50" value={form.passportExpiryDate} onChange={(e) => updateForm("passportExpiryDate", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border/50 rounded-2xl p-6">
                    <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-primary" /> تفاصيل التأشيرة
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>نوع التأشيرة *</Label>
                        <select className="w-full h-12 rounded-xl bg-muted/50 border border-input px-3 text-sm" value={form.visaType} onChange={(e) => updateForm("visaType", e.target.value)}>
                          {selectedCountry.visaTypes.map(vt => (
                            <option key={vt} value={vt}>{VISA_TYPE_LABELS[vt] || vt}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>تاريخ السفر المرتقب</Label>
                        <Input type="date" dir="ltr" className="h-12 rounded-xl bg-muted/50" value={form.travelDate} onChange={(e) => updateForm("travelDate", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>مدة الإقامة</Label>
                        <Input className="h-12 rounded-xl bg-muted/50" placeholder="مثال: 15 يوم" value={form.duration} onChange={(e) => updateForm("duration", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border/50 rounded-2xl p-6">
                    <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                      <Camera className="w-5 h-5 text-primary" /> الصور والوثائق
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <Label className="mb-3 block">الصورة الشخصية *</Label>
                        <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0] || null, "photo")} />
                        {photoPreview ? (
                          <div className="relative w-36 h-44 mx-auto">
                            <img src={photoPreview} alt="الصورة" className="w-full h-full object-cover rounded-xl border-2 border-primary/30" />
                            <button type="button" onClick={() => { setPhoto(null); setPhotoPreview(null); }} className="absolute -top-2 -left-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => photoRef.current?.click()} className="w-full h-40 border-2 border-dashed border-border/60 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-primary/40 hover:bg-primary/5 transition-all">
                            <ImageIcon className="w-10 h-10 text-muted-foreground/50" />
                            <span className="text-sm text-muted-foreground">اضغط لرفع الصورة</span>
                            <span className="text-xs text-muted-foreground/60">JPG, PNG — خلفية بيضاء</span>
                          </button>
                        )}
                      </div>

                      <div>
                        <Label className="mb-3 block">نسخة جواز السفر *</Label>
                        <input ref={passportRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0] || null, "passport")} />
                        {passportPreview ? (
                          <div className="relative w-full h-40 mx-auto">
                            <img src={passportPreview} alt="جواز السفر" className="w-full h-full object-cover rounded-xl border-2 border-primary/30" />
                            <button type="button" onClick={() => { setPassportScan(null); setPassportPreview(null); }} className="absolute -top-2 -left-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => passportRef.current?.click()} className="w-full h-40 border-2 border-dashed border-border/60 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-primary/40 hover:bg-primary/5 transition-all">
                            <CreditCard className="w-10 h-10 text-muted-foreground/50" />
                            <span className="text-sm text-muted-foreground">اضغط لرفع نسخة الجواز</span>
                            <span className="text-xs text-muted-foreground/60">JPG, PNG, PDF</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="mb-3 block">ملفات إضافية (اختياري)</Label>
                      <input ref={extraRef} type="file" multiple accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={(e) => handleExtraFiles(e.target.files)} />
                      <button type="button" onClick={() => extraRef.current?.click()} className="w-full h-20 border-2 border-dashed border-border/40 rounded-xl flex items-center justify-center gap-3 hover:border-primary/40 hover:bg-muted/30 transition-all">
                        <Paperclip className="w-6 h-6 text-muted-foreground/50" />
                        <span className="text-sm text-muted-foreground">رفع وثائق إضافية (عقد عمل، كشف حساب، دعوة...)</span>
                      </button>
                      {extraFiles.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {extraFiles.map((f, i) => (
                            <div key={i} className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full text-sm">
                              <FileText className="w-3.5 h-3.5" />
                              <span className="max-w-[150px] truncate">{f.name}</span>
                              <button type="button" onClick={() => setExtraFiles(prev => prev.filter((_, j) => j !== i))} className="text-destructive hover:text-red-700">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-card border border-border/50 rounded-2xl p-6">
                    <Label className="mb-3 block font-bold">ملاحظات إضافية</Label>
                    <textarea
                      className="w-full min-h-[100px] rounded-xl bg-muted/50 border border-input px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="أي معلومات إضافية تود إضافتها..."
                      value={form.notes}
                      onChange={(e) => updateForm("notes", e.target.value)}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" className="rounded-full px-6" onClick={() => setStep("country")}>
                      <ChevronLeft className="w-4 h-4 ml-1" /> رجوع
                    </Button>
                    <Button type="submit" disabled={isLoading} className="flex-1 h-14 rounded-full text-base font-bold gap-2">
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Upload className="w-5 h-5" />
                      )}
                      {isLoading ? "جارٍ الإرسال..." : "إرسال الطلب"}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {step === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto text-center py-16">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold mb-4">تم استلام طلبك!</h2>
              <p className="text-muted-foreground mb-8">سيتواصل معك فريق وكالة شويعر في أقرب وقت لمتابعة ملف التأشيرة الخاص بك.</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => { setStep("country"); setSelectedCountry(null); }} variant="outline" className="rounded-full px-6">تقديم طلب آخر</Button>
                <Button onClick={() => setLocation("/")} className="rounded-full px-6">العودة للرئيسية</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
