import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Globe, User, CreditCard, Calendar, MapPin, Phone, Briefcase,
  CheckCircle, XCircle, Clock, Loader2, Eye, FileText, Image as ImageIcon
} from "lucide-react";

const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "") + "/api";

type VisaRequest = {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: string;
  birthPlace: string;
  profession: string;
  address: string;
  phone: string;
  passportNumber: string;
  passportIssueDate: string;
  passportIssuePlace: string;
  passportExpiryDate: string;
  destination: string;
  travelDate: string | null;
  visaType: string | null;
  duration: string | null;
  photoUrl: string | null;
  passportPhotoUrl: string | null;
  notes: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
};

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "في الانتظار", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
  processing: { label: "قيد المعالجة", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Loader2 },
  approved: { label: "مقبول", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
  rejected: { label: "مرفوض", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
  cancelled: { label: "ملغي", color: "bg-gray-100 text-gray-700 border-gray-200", icon: XCircle },
};

const VISA_TYPE_LABELS: Record<string, string> = {
  tourism: "سياحية",
  business: "أعمال",
  medical: "علاجية",
  transit: "عبور",
  family: "زيارة عائلية",
};

export default function ManageVisaRequests() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<VisaRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filter, setFilter] = useState("all");

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${BASE}/visa-requests`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) setRequests(data.visaRequests);
    } catch {
      toast({ variant: "destructive", title: "خطأ في تحميل الطلبات" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`${BASE}/visa-requests/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
        toast({ title: `تم تحديث الحالة إلى: ${STATUS_MAP[status]?.label}` });
      }
    } catch {
      toast({ variant: "destructive", title: "خطأ في تحديث الحالة" });
    }
  };

  const filtered = filter === "all" ? requests : requests.filter(r => r.status === filter);

  if (loading) return <div className="text-center py-20 text-muted-foreground">جاري التحميل...</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold">🌍 طلبات الفيزا الإلكترونية</h1>
          <p className="text-muted-foreground text-sm mt-1">{requests.length} طلب إجمالي</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "all", label: "الكل" },
            { key: "pending", label: "انتظار" },
            { key: "processing", label: "معالجة" },
            { key: "approved", label: "مقبول" },
            { key: "rejected", label: "مرفوض" },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f.key ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >{f.label}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>لا توجد طلبات {filter !== "all" && `بحالة "${STATUS_MAP[filter]?.label}"`}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((req) => {
            const st = STATUS_MAP[req.status] || STATUS_MAP.pending;
            const isExpanded = expandedId === req.id;
            return (
              <div key={req.id} className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="p-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : req.id)}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Globe className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{req.firstName} {req.lastName}</h3>
                        <p className="text-sm text-muted-foreground">{req.destination} • {new Date(req.createdAt).toLocaleDateString("ar-DZ")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${st.color}`}>
                        {st.label}
                      </span>
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border/50 p-5 bg-muted/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      <InfoRow icon={User} label="الاسم الكامل" value={`${req.firstName} ${req.lastName}`} />
                      <InfoRow icon={Calendar} label="تاريخ الميلاد" value={req.birthDate} />
                      <InfoRow icon={MapPin} label="مكان الميلاد" value={req.birthPlace} />
                      <InfoRow icon={Briefcase} label="المهنة" value={req.profession} />
                      <InfoRow icon={Phone} label="الهاتف" value={req.phone} />
                      <InfoRow icon={MapPin} label="العنوان" value={req.address} />
                      <InfoRow icon={CreditCard} label="رقم الجواز" value={req.passportNumber} />
                      <InfoRow icon={Calendar} label="إصدار الجواز" value={`${req.passportIssueDate} — ${req.passportIssuePlace}`} />
                      <InfoRow icon={Calendar} label="انتهاء الجواز" value={req.passportExpiryDate} />
                      <InfoRow icon={Globe} label="الوجهة" value={req.destination} />
                      <InfoRow icon={FileText} label="نوع الفيزا" value={VISA_TYPE_LABELS[req.visaType || "tourism"] || req.visaType || "-"} />
                      {req.travelDate && <InfoRow icon={Calendar} label="تاريخ السفر" value={req.travelDate} />}
                      {req.duration && <InfoRow icon={Clock} label="مدة الإقامة" value={req.duration} />}
                    </div>

                    {(req.photoUrl || req.passportPhotoUrl) && (
                      <div className="flex gap-4 mb-6 flex-wrap">
                        {req.photoUrl && (
                          <a href={`${BASE}/visa-requests/uploads/${req.photoUrl}`} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm hover:bg-blue-100 transition-colors">
                            <ImageIcon className="w-4 h-4" /> عرض الصورة الشخصية
                          </a>
                        )}
                        {req.passportPhotoUrl && (
                          <a href={`${BASE}/visa-requests/uploads/${req.passportPhotoUrl}`} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm hover:bg-blue-100 transition-colors">
                            <CreditCard className="w-4 h-4" /> عرض صورة الجواز
                          </a>
                        )}
                      </div>
                    )}

                    {req.notes && (
                      <div className="p-3 bg-muted/50 rounded-xl mb-6 text-sm">
                        <span className="font-bold">ملاحظات الزبون:</span> {req.notes}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {req.status !== "processing" && (
                        <Button size="sm" variant="outline" className="rounded-xl gap-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                          onClick={() => updateStatus(req.id, "processing")}>
                          <Loader2 className="w-3.5 h-3.5" /> قيد المعالجة
                        </Button>
                      )}
                      {req.status !== "approved" && (
                        <Button size="sm" className="rounded-xl gap-1 bg-green-600 hover:bg-green-700"
                          onClick={() => updateStatus(req.id, "approved")}>
                          <CheckCircle className="w-3.5 h-3.5" /> قبول
                        </Button>
                      )}
                      {req.status !== "rejected" && (
                        <Button size="sm" variant="destructive" className="rounded-xl gap-1"
                          onClick={() => updateStatus(req.id, "rejected")}>
                          <XCircle className="w-3.5 h-3.5" /> رفض
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
      <div>
        <span className="text-xs text-muted-foreground">{label}</span>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
