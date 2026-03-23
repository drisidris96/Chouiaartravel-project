import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { translations, type Lang } from "./translations";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (path: string) => string;
  dir: "rtl" | "ltr";
}

const LanguageContext = createContext<LanguageContextType | null>(null);

function getNestedValue(obj: any, path: string): string {
  const keys = path.split(".");
  let current = obj;
  for (const key of keys) {
    if (current === undefined || current === null) return path;
    current = current[key];
  }
  return typeof current === "string" ? current : path;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("lang");
    if (saved === "ar" || saved === "fr" || saved === "en") return saved;
    return "ar";
  });

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem("lang", newLang);
  }, []);

  const t = useCallback(
    (path: string) => getNestedValue(translations[lang], path),
    [lang]
  );

  const dir = (translations[lang].dir || "rtl") as "rtl" | "ltr";

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [dir, lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

export function AlgeriaFlag({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 900 600" className="rounded-full" style={{ width: size, height: size }}>
      <rect width="450" height="600" fill="#006233" />
      <rect x="450" width="450" height="600" fill="#FFFFFF" />
      <circle cx="450" cy="300" r="150" fill="#D21034" />
      <circle cx="480" cy="300" r="120" fill="#FFFFFF" />
      <polygon points="455,210 475,270 540,270 487,305 507,365 455,330 403,365 423,305 370,270 435,270" fill="#D21034" />
    </svg>
  );
}

export function FranceFlag({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 900 600" className="rounded-full" style={{ width: size, height: size }}>
      <rect width="300" height="600" fill="#002395" />
      <rect x="300" width="300" height="600" fill="#FFFFFF" />
      <rect x="600" width="300" height="600" fill="#ED2939" />
    </svg>
  );
}

export function UKFlag({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 30" className="rounded-full" style={{ width: size, height: size }}>
      <clipPath id="s"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
      <clipPath id="t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
      <g clipPath="url(#s)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
      </g>
    </svg>
  );
}

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);

  const languages: { code: Lang; label: string; Flag: typeof AlgeriaFlag }[] = [
    { code: "ar", label: "العربية", Flag: AlgeriaFlag },
    { code: "fr", label: "Français", Flag: FranceFlag },
    { code: "en", label: "English", Flag: UKFlag },
  ];

  const current = languages.find((l) => l.code === lang)!;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-muted/60 hover:bg-primary/10 transition-colors border border-border/40"
      >
        <current.Flag size={18} />
        <span className="text-xs font-medium hidden sm:inline">{current.label}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 bg-card border border-border/50 rounded-xl shadow-lg z-50 py-1 min-w-[140px] ltr:right-0 rtl:left-0">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setLang(l.code);
                  setOpen(false);
                }}
                className={`flex items-center gap-2.5 w-full px-3 py-2.5 text-sm transition-colors ${
                  lang === l.code
                    ? "bg-primary/10 text-primary font-semibold"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                <l.Flag size={18} />
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
