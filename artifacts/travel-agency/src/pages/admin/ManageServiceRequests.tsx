import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, User, MapPin, Phone, CreditCard, FileText, Clock, CheckCircle, XCircle, Loader, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "") + "/api";

type Status = "pending" | "in_progress" | "done" | "cancelled";

interface ServiceRequest {
  id: number;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  passportNumber: string;
  serviceDescription: string;
  status: Status;
  createdAt: string;
}

const STATUS_CONFIG: Record<Status, { label: string; color: string; icon: typeof Clock }> = {
  pending:     { label: "قيد الانتظار",  color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
  in_progress: { label: "قيد المعالجة", color: "bg-blue-100 text-blue-700 border-blue-200",    icon: Loader },
  done:        { label: "منجز",          color: "bg-green-100 text-green-700 border-green-200",  icon: CheckCircle },
  cancelled:   { label: "ملغي",          color: "bg-red-100 text-red-700 border-red-200",        icon: XCircle },
};

function RequestCard({ r, onStatusChange }: { r: ServiceRequest; onStatusChange: (id: number, s: Status) => void }) {
  const status = STATUS_CONFIG[r.status];
  const StatusIcon = status.icon;

  return (
    <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="h-2 bg-gradient-to-l from-violet-500 to-primary" />
      <div className="p-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-bold text-base">{r.firstName} {r.lastName}</p>
              <p className="text-xs text-muted-foreground">#{r.id} · {new Date(r.createdAt).toLocaleDateString("ar-DZ")}</p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full border ${status.color}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {status.label}
          </span>
        </div>

        {/* Details */}
        <div className="bg-muted/40 rounded-2xl p-4 mb-4 space-y-2.5">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <span className="text-sm">{r.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm font-mono" dir="ltr">{r.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm font-mono" dir="ltr">{r.passportNumber}</span>
          </div>
        </div>

        {/* Service description */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-muted-foreground">الخدمة المطلوبة</span>
          </div>
          <p className="text-sm bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 leading-relaxed">
            {r.serviceDescription}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {r.status === "pending" && (
            <>
              <Button size="sm" className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs"
                onClick={() => onStatusChange(r.id, "in_progress")}>
                <Loader className="w-3.5 h-3.5 ml-1" /> قيد المعالجة
              </Button>
              <Button size="sm" variant="outline" className="flex-1 rounded-xl border-red-300 text-red-600 hover:bg-red-50 text-xs"
                onClick={() => onStatusChange(r.id, "cancelled")}>
                <XCircle className="w-3.5 h-3.5 ml-1" /> إلغاء
              </Button>
            </>
          )}
          {r.status === "in_progress" && (
            <>
              <Button size="sm" className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs"
                onClick={() => onStatusChange(r.id, "done")}>
                <CheckCircle className="w-3.5 h-3.5 ml-1" /> تم الإنجاز
              </Button>
              <Button size="sm" variant="outline" className="flex-1 rounded-xl border-red-300 text-red-600 hover:bg-red-50 text-xs"
                onClick={() => onStatusChange(r.id, "cancelled")}>
                <XCircle className="w-3.5 h-3.5 ml-1" /> إلغاء
              </Button>
            </>
          )}
          {(r.status === "done" || r.status === "cancelled") && (
            <Button size="sm" variant="outline" className="w-full rounded-xl text-xs"
              onClick={() => onStatusChange(r.id, "pending")}>
              <RefreshCw className="w-3.5 h-3.5 ml-1" /> إعادة تفعيل
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ManageServiceRequests() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | Status>("all");

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/service-requests`, { credentials: "include" });
      const data = await res.json();
      setRequests(data.requests ?? []);
    } catch {
      toast({ variant: "destructive", title: "فشل تحميل الطلبات" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleStatusChange = async (id: number, status: Status) => {
    try {
      await fetch(`${BASE}/service-requests/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
      const labels: Record<Status, string> = { pending: "قيد الانتظار", in_progress: "قيد المعالجة", done: "منجز", cancelled: "ملغي" };
      toast({ title: `تم تغيير الحالة إلى: ${labels[status]}` });
    } catch {
      toast({ variant: "destructive", title: "فشل تحديث الحالة" });
    }
  };

  const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter);
  const counts = {
    all: requests.length,
    pending: requests.filter(r => r.status === "pending").length,
    in_progress: requests.filter(r => r.status === "in_progress").length,
    done: requests.filter(r => r.status === "done").length,
    cancelled: requests.filter(r => r.status === "cancelled").length,
  };

  const tabs: { key: "all" | Status; label: string }[] = [
    { key: "all",        label: `الكل (${counts.all})` },
    { key: "pending",    label: `انتظار (${counts.pending})` },
    { key: "in_progress",label: `معالجة (${counts.in_progress})` },
    { key: "done",       label: `منجز (${counts.done})` },
    { key: "cancelled",  label: `ملغي (${counts.cancelled})` },
  ];

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">طلبات الخدمات الأخرى</h1>
          <p className="text-muted-foreground text-sm">{counts.pending} طلب ينتظر المراجعة</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 rounded-xl" onClick={fetchRequests}>
          <RefreshCw className="w-4 h-4" /> تحديث
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
              filter === t.key
                ? "bg-primary text-primary-foreground border-primary shadow-md"
                : "bg-card border-border/50 text-muted-foreground hover:border-primary/40"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-6 h-6 animate-spin text-primary ml-2" />
          <span className="text-muted-foreground">جاري التحميل...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border/50 rounded-3xl">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">لا توجد طلبات</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((r) => (
            <RequestCard key={r.id} r={r} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
}
