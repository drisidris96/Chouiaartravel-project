import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, User, MapPin, Phone, CreditCard, FileText, CheckCircle, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";

const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "") + "/api";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ServiceRequestModal({ open, onClose }: Props) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", address: "",
    phone: "", passportNumber: "", serviceDescription: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/service-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setDone(true);
    } catch (err: any) {
      toast({ variant: "destructive", title: t("serviceModal.sendFailed"), description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => { setDone(false); setForm({ firstName: "", lastName: "", address: "", phone: "", passportNumber: "", serviceDescription: "" }); }, 300);
  };

  const inp = "w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            onClick={handleClose}
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div className="bg-background rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

              <div className="relative bg-gradient-to-l from-primary to-primary/80 rounded-t-3xl px-6 py-5 text-primary-foreground">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{t("serviceModal.title")}</h2>
                    <p className="text-primary-foreground/80 text-sm">{t("serviceModal.subtitle")}</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="absolute top-4 left-4 w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6">
                {done ? (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                      <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{t("serviceModal.successTitle")}</h3>
                    <p className="text-muted-foreground mb-6">
                      {t("serviceModal.successDesc")}
                    </p>
                    <Button onClick={handleClose} className="rounded-2xl px-8">{t("serviceModal.close")}</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5 text-foreground">
                          <User className="w-3.5 h-3.5 text-primary" /> {t("serviceModal.firstName")} *
                        </label>
                        <input required value={form.firstName} onChange={set("firstName")} placeholder={t("serviceModal.firstNamePh")} className={inp} />
                      </div>
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5 text-foreground">
                          <User className="w-3.5 h-3.5 text-primary" /> {t("serviceModal.lastName")} *
                        </label>
                        <input required value={form.lastName} onChange={set("lastName")} placeholder={t("serviceModal.lastNamePh")} className={inp} />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5 text-foreground">
                        <MapPin className="w-3.5 h-3.5 text-primary" /> {t("serviceModal.address")} *
                      </label>
                      <input required value={form.address} onChange={set("address")} placeholder={t("serviceModal.addressPh")} className={inp} />
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5 text-foreground">
                        <Phone className="w-3.5 h-3.5 text-primary" /> {t("serviceModal.phone")} *
                      </label>
                      <input required type="tel" dir="ltr" value={form.phone} onChange={set("phone")} placeholder="+213 XX XX XX XX" className={inp} />
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5 text-foreground">
                        <CreditCard className="w-3.5 h-3.5 text-primary" /> {t("serviceModal.passport")} *
                      </label>
                      <input required dir="ltr" value={form.passportNumber} onChange={set("passportNumber")} placeholder="A 00000000" className={inp} />
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5 text-foreground">
                        <FileText className="w-3.5 h-3.5 text-primary" /> {t("serviceModal.serviceDesc")} *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={form.serviceDescription}
                        onChange={set("serviceDescription")}
                        placeholder={t("serviceModal.serviceDescPh")}
                        className={`${inp} resize-none`}
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full rounded-2xl h-12 font-bold gap-2" disabled={loading}>
                      <Send className="w-4 h-4" />
                      {loading ? t("serviceModal.sending") : t("serviceModal.send")}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
