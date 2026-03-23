import { useState, useEffect, useRef } from "react";
import { Bell, X, FileText, CalendarCheck, Plane, Star, Sparkles, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "") + "/api";

type Notif = {
  id: string;
  type: "visa" | "booking" | "reservation" | "service";
  title: string;
  desc: string;
  time: string;
  read: boolean;
};

const TYPE_ICONS = {
  visa: FileText,
  booking: Plane,
  reservation: CalendarCheck,
  service: Sparkles,
};

const TYPE_COLORS = {
  visa: "text-blue-500 bg-blue-50",
  booking: "text-green-500 bg-green-50",
  reservation: "text-amber-500 bg-amber-50",
  service: "text-violet-500 bg-violet-50",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  return `منذ ${days} يوم`;
}

export function NotificationBell({ isAdmin }: { isAdmin?: boolean }) {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("notif_read") || "[]")); } catch { return new Set(); }
  });
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifs = async () => {
    try {
      const res = await fetch(`${BASE}/admin/notifications`, { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setNotifs(data);
    } catch {}
  };

  useEffect(() => {
    if (isAdmin) {
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 30000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const unread = notifs.filter(n => !readIds.has(n.id)).length;

  const markAllRead = () => {
    const all = new Set(notifs.map(n => n.id));
    setReadIds(all);
    localStorage.setItem("notif_read", JSON.stringify([...all]));
  };

  const markRead = (id: string) => {
    const next = new Set([...readIds, id]);
    setReadIds(next);
    localStorage.setItem("notif_read", JSON.stringify([...next]));
  };

  if (!isAdmin) return null;

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => { setOpen(!open); fetchNotifs(); }}
        className="relative p-2 rounded-full hover:bg-muted/60 transition-colors"
        aria-label="الإشعارات"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md"
          >
            {unread > 9 ? "9+" : unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 bg-card border border-border/50 rounded-2xl shadow-2xl z-50 w-96 max-h-[500px] flex flex-col ltr:right-0 rtl:left-0"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
              <h3 className="font-bold text-base">الإشعارات</h3>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                    تحديد الكل كمقروء
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="p-1 rounded-full hover:bg-muted">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {notifs.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">لا توجد إشعارات جديدة</p>
                </div>
              ) : (
                notifs.map((notif) => {
                  const Icon = TYPE_ICONS[notif.type];
                  const isRead = readIds.has(notif.id);
                  return (
                    <button
                      key={notif.id}
                      onClick={() => markRead(notif.id)}
                      className={`w-full text-start px-4 py-3 border-b border-border/30 hover:bg-muted/40 transition-colors flex gap-3 ${!isRead ? "bg-primary/5" : ""}`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${TYPE_COLORS[notif.type]}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm truncate">{notif.title}</p>
                          {!isRead && <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{notif.desc}</p>
                        <p className="text-xs text-muted-foreground/60 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {timeAgo(notif.time)}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
