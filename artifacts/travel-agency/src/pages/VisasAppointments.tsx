import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CalendarClock, User, CheckCircle, ChevronLeft, ArrowLeft, Clock, Info } from "lucide-react";
import { useLocation } from "wouter";

const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "") + "/api";

const APPOINTMENT_COUNTRIES = [
  {
    group: "الاتحاد الأوروبي — شنغن",
    emoji: "🇪🇺",
    note: "مراكز VFS Global وTLS Contact",
    countries: [
      { code: "FR", name: "فرنسا", flag: "🇫🇷", center: "TLS Contact — الجزائر العاصمة / وهران / قسنطينة" },
      { code: "DE", name: "ألمانيا", flag: "🇩🇪", center: "VFS Global — الجزائر العاصمة" },
      { code: "ES", name: "إسبانيا", flag: "🇪🇸", center: "TLS Contact — الجزائر العاصمة / وهران" },
      { code: "IT", name: "إيطاليا", flag: "🇮🇹", center: "VFS Global — الجزائر العاصمة" },
      { code: "BE", name: "بلجيكا", flag: "🇧🇪", center: "VFS Global — الجزائر العاصمة" },
      { code: "NL", name: "هولندا", flag: "🇳🇱", center: "VFS Global — الجزائر العاصمة" },
      { code: "CH", name: "سويسرا", flag: "🇨🇭", center: "TLS Contact — الجزائر العاصمة" },
      { code: "AT", name: "النمسا", flag: "🇦🇹", center: "VFS Global — الجزائر العاصمة" },
      { code: "GR", name: "اليونان", flag: "🇬🇷", center: "VFS Global — الجزائر العاصمة" },
      { code: "PT", name: "البرتغال", flag: "🇵🇹", center: "VFS Global — الجزائر العاصمة" },
      { code: "SE", name: "السويد", flag: "🇸🇪", center: "VFS Global — الجزائر العاصمة" },
      { code: "NO", name: "النرويج", flag: "🇳🇴", center: "VFS Global — الجزائر العاصمة" },
      { code: "DK", name: "الدنمارك", flag: "🇩🇰", center: "VFS Global — الجزائر العاصمة" },
      { code: "FI", name: "فنلندا", flag: "🇫🇮", center: "VFS Global — الجزائر العاصمة" },
      { code: "PL", name: "بولندا", flag: "🇵🇱", center: "VFS Global — الجزائر العاصمة" },
      { code: "CZ", name: "التشيك", flag: "🇨🇿", center: "VFS Global — الجزائر العاصمة" },
    ],
  },
  {
    group: "أمريكا الشمالية والمملكة المتحدة",
    emoji: "🌎",
    note: "السفارات الأمريكية والكندية والبريطانية",
    countries: [
      { code: "US", name: "الولايات المتحدة الأمريكية", flag: "🇺🇸", center: "السفارة الأمريكية — الجزائر العاصمة" },
      { code: "CA", name: "كندا", flag: "🇨🇦", center: "VFS Global (كندا) — الجزائر العاصمة" },
      { code: "GB", name: "المملكة المتحدة", flag: "🇬🇧", center: "VFS Global (UK) — الجزائر العاصمة" },
    ],
  },
];

type Step = "country" | "form" | "done";

export default function VisasAppointments() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<Step>("country");
  const [selectedCountry, setSelectedCountry] = useState<(typeof APPOINTMENT_COUNTRIES[0]["countries"][0]) | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: "", lastName: "", birthDate: "",
    phone: "", passportNumber: "", passportExpiryDate: "",
    visaType: "tourism", numberOfPersons: "1",
    preferredDate1: "", preferredDate2: "", preferredTime: "",
    notes: "",
  });

  const updateForm = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCountry) return;
    setIsLoading(true);
    try {
      const body = { ...form, destination: selectedCountry.name, visaCategory: "appointment" };
      const res = await fetch(`${BASE}/visa-requests`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStep("done");
      toast({ title: "✅ تم حجز طلب الموعد!" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "خطأ", description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <section className="relative py-16 bg-gradient-to-br from-violet-500/10 via-background to-background">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <button onClick={() => setLocation("/visas")} className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-4 transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" /> العودة لقائمة التأشيرات
            </button>
            <div className="mb-4">
              <span className="inline-block bg-violet-100 text-violet-800 px-5 py-2 rounded-full text-sm font-bold">
                📅 حجز المواعيد القنصلية — RDV Visa
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              حجز <span className="text-primary">موعد فيزا</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              نتولى حجز موعدك في مراكز VFS وTLS والسفارات — الاتحاد الأوروبي، أمريكا الشمالية، المملكة المتحدة
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-8 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            <strong>كيف يعمل هذا؟</strong> — أرسل لنا طلبك مع التواريخ المفضلة لديك، وسيقوم فريق شويعر بحجز الموعد نيابةً عنك في مراكز VFS وTLS أو السفارة المعنية.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-10">
          {[
            { s: "country", label: "اختيار الدولة", num: 1 },
            { s: "form", label: "تفاصيل الموعد", num: 2 },
            { s: "done", label: "تم الحجز", num: 3 },
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
              {APPOINTMENT_COUNTRIES.map((group) => (
                <div key={group.group} className="mb-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{group.emoji}</span>
                    <div>
                      <h3 className="text-xl font-bold">{group.group}</h3>
                      <p className="text-xs text-muted-foreground">{group.note}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {group.countries.map((country) => (
                      <motion.button
                        key={country.code}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { setSelectedCountry(country); setStep("form"); }}
                        className="p-4 rounded-2xl border-2 text-center transition-all hover:shadow-lg border-border/50 bg-card hover:border-primary/40"
                      >
                        <div className="text-3xl mb-2">{country.flag}</div>
                        <div className="font-bold text-sm">{country.name}</div>
                        <div className="text-xs text-violet-600 font-semibold mt-1">📅 موعد</div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {step === "form" && selectedCountry && (
            <motion.div key="form" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <button onClick={() => setStep("country")} className="flex items-center gap-2 text-primary hover:underline mb-6">
                <ChevronLeft className="w-4 h-4" /> العودة لاختيار الدولة
              </button>

              <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5 mb-8 flex items-start gap-4">
                <span className="text-4xl">{selectedCountry.flag}</span>
                <div>
                  <h3 className="font-bold text-lg">حجز موعد — {selectedCountry.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedCountry.center}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
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
                      <Label>رقم الهاتف *</Label>
                      <Input required type="tel" dir="ltr" className="h-12 rounded-xl bg-muted/50" placeholder="+213 XX XX XX XX" value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>رقم جواز السفر *</Label>
                      <Input required dir="ltr" className="h-12 rounded-xl bg-muted/50" placeholder="XXXXXXXXX" value={form.passportNumber} onChange={(e) => updateForm("passportNumber", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>تاريخ انتهاء الجواز *</Label>
                      <Input required type="date" dir="ltr" className="h-12 rounded-xl bg-muted/50" value={form.passportExpiryDate} onChange={(e) => updateForm("passportExpiryDate", e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border/50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                    <CalendarClock className="w-5 h-5 text-primary" /> تفاصيل الموعد
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>نوع التأشيرة *</Label>
                      <select className="w-full h-12 rounded-xl bg-muted/50 border border-input px-3 text-sm" value={form.visaType} onChange={(e) => updateForm("visaType", e.target.value)}>
                        <option value="tourism">سياحية</option>
                        <option value="business">أعمال</option>
                        <option value="student">دراسية</option>
                        <option value="medical">علاجية</option>
                        <option value="family">زيارة عائلية</option>
                        <option value="transit">عبور</option>
                        <option value="work">عمل</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>عدد الأشخاص *</Label>
                      <select className="w-full h-12 rounded-xl bg-muted/50 border border-input px-3 text-sm" value={form.numberOfPersons} onChange={(e) => updateForm("numberOfPersons", e.target.value)}>
                        {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} شخص</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>التاريخ المفضل الأول *</Label>
                      <Input required type="date" dir="ltr" className="h-12 rounded-xl bg-muted/50" min={new Date().toISOString().split("T")[0]} value={form.preferredDate1} onChange={(e) => updateForm("preferredDate1", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>التاريخ المفضل الثاني (بديل)</Label>
                      <Input type="date" dir="ltr" className="h-12 rounded-xl bg-muted/50" min={new Date().toISOString().split("T")[0]} value={form.preferredDate2} onChange={(e) => updateForm("preferredDate2", e.target.value)} />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <Label>الوقت المفضل</Label>
                      <select className="w-full h-12 rounded-xl bg-muted/50 border border-input px-3 text-sm" value={form.preferredTime} onChange={(e) => updateForm("preferredTime", e.target.value)}>
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

                <div className="bg-card border border-border/50 rounded-2xl p-6">
                  <Label className="mb-3 block font-bold">ملاحظات إضافية</Label>
                  <textarea className="w-full min-h-[80px] rounded-xl bg-muted/50 border border-input px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="أي تفاصيل إضافية تساعدنا في تنسيق موعدك..." value={form.notes} onChange={(e) => updateForm("notes", e.target.value)} />
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="rounded-full px-6" onClick={() => setStep("country")}>
                    <ChevronLeft className="w-4 h-4 ml-1" /> رجوع
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1 h-14 rounded-full text-base font-bold gap-2">
                    {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Clock className="w-5 h-5" />}
                    {isLoading ? "جارٍ الإرسال..." : "إرسال طلب الموعد"}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {step === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto text-center py-16">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold mb-4">تم استلام طلب الموعد!</h2>
              <p className="text-muted-foreground mb-8">سيتواصل معك فريق شويعر خلال 24 ساعة لتأكيد الموعد وإعطائك تفاصيل الملف المطلوب.</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => { setStep("country"); setSelectedCountry(null); }} variant="outline" className="rounded-full px-6">طلب موعد آخر</Button>
                <Button onClick={() => setLocation("/")} className="rounded-full px-6">العودة للرئيسية</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
