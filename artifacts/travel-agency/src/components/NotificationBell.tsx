import { useState, useEffect, useRef } from "react";
import { Bell, X, FileText, CalendarCheck, Plane, Sparkles, Clock, Headphones } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "") + "/api";

type NotifType = "visa" | "booking" | "reservation" | "service" | "support";

type Notif = {
  id: string;
  type: NotifType;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  dbId?: number;
};

const TYPE_ICONS: Record<NotifType, typeof FileText> = {
  visa: FileText,
  booking: Plane,
  reservation: CalendarCheck,
  service: Sparkles,
  support: Headphones,
};

const TYPE_COLORS: Record<NotifType, string> = {
  visa: "text-blue-500 bg-blue-50",
  booking: "text-green-500 bg-green-50",
  reservation: "text-amber-500 bg-amber-50",
  service: "text-violet-500 bg-violet-50",
  support: "text-rose-500 bg-rose-50",
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
  const [localReadIds, setLocalReadIds] = useState<Set<string>>(() => {
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

  const isRead = (n: Notif) => n.read || localReadIds.has(n.id);

  const unread = notifs.filter(n => !isRead(n)).length;

  const markRead = async (notif: Notif) => {
    const next = new Set([...localReadIds, notif.id]);
    setLocalReadIds(next);
    localStorage.setItem("notif_read", JSON.stringify([...next]));

    // For support messages — mark as read in DB so it persists
    if (notif.type === "support" && notif.dbId && !notif.read) {
      try {
        await fetch(`${BASE}/support/${notif.dbId}/read`, {
          method: "PATCH",
          credentials: "include",
        });
        setNotifs(prev => prev.map(n =>
          n.id === notif.id ? { ...n, read: true } : n
        ));
      } catch {}
    }
  };

  const markAllRead = async () => {
    const all = new Set(notifs.map(n => n.id));
    setLocalReadIds(all);
    localStorage.setItem("notif_read", JSON.stringify([...all]));

    // Mark all unread support messages as read in DB
    const unreadSupports = notifs.filter(n => n.type === "support" && !n.read && n.dbId);
    for (const n of unreadSupports) {
      try {
        await fetch(`${BASE}/support/${n.dbId}/read`, {
          method: "PATCH",
          credentials: "include",
        });
      } catch {}
    }
    setNotifs(prev => prev.map(n => n.type === "support" ? { ...n, read: true } : n));
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
              <h3 className="font-bold text-base flex items-center gap-2">
                الإشعارات
                {unread > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {unread}
                  </span>
                )}
              </h3>
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
                  const read = isRead(notif);
                  return (
                    <button
                      key={notif.id}
                      onClick={() => markRead(notif)}
                      className={`w-full text-start px-4 py-3 border-b border-border/30 hover:bg-muted/40 transition-colors flex gap-3 ${!read ? "bg-primary/5" : ""}`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${TYPE_COLORS[notif.type]}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm truncate">{notif.title}</p>
                          {!read && <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{notif.desc}</p>
                        <p className="text-xs text-muted-foreground/60 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {timeAgo(notif.time)}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer hint for support messages */}
            {notifs.some(n => n.type === "support" && !isRead(n)) && (
              <div className="px-4 py-2.5 border-t border-border/40 bg-rose-50/50">
                <p className="text-xs text-rose-600 flex items-center gap-1.5">
                  <Headphones className="w-3.5 h-3.5" />
                  لديك رسائل دعم جديدة تحتاج ردّاً
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
