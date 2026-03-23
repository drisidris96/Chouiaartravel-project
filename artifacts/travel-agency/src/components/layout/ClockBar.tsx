import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { toHijri } from "hijri-converter";
import { useLanguage } from "@/i18n/LanguageContext";

const hijriMonthsAr = [
  "محرم", "صفر", "ربيع الأول", "ربيع الثاني",
  "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان",
  "رمضان", "شوال", "ذو القعدة", "ذو الحجة",
];

const hijriMonthsFr = [
  "Mouharram", "Safar", "Rabi' al-Awwal", "Rabi' ath-Thani",
  "Joumada al-Oula", "Joumada ath-Thania", "Rajab", "Chaabane",
  "Ramadan", "Chawwal", "Dhou al-Qi'da", "Dhou al-Hijja",
];

const hijriMonthsEn = [
  "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' ath-Thani",
  "Jumada al-Ula", "Jumada ath-Thaniya", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhul-Qi'dah", "Dhul-Hijjah",
];

const gregorianMonthsAr = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

const gregorianMonthsFr = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const gregorianMonthsEn = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function ClockBar() {
  const { lang } = useLanguage();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");

  const hijri = toHijri(now.getFullYear(), now.getMonth() + 1, now.getDate());

  const hijriMonths = lang === "ar" ? hijriMonthsAr : lang === "fr" ? hijriMonthsFr : hijriMonthsEn;
  const gregMonths = lang === "ar" ? gregorianMonthsAr : lang === "fr" ? gregorianMonthsFr : gregorianMonthsEn;

  const hijriSuffix = lang === "ar" ? " هـ" : lang === "fr" ? " H" : " AH";
  const gregSuffix = lang === "ar" ? " م" : "";

  const hijriDate = `${hijri.hd} ${hijriMonths[hijri.hm - 1]} ${hijri.hy}${hijriSuffix}`;
  const gregDate = `${now.getDate()} ${gregMonths[now.getMonth()]} ${now.getFullYear()}${gregSuffix}`;
  const timeDisplay = `${hours}:${minutes}:${seconds}`;

  return (
    <div className="bg-[#1B3A5C] text-white py-1.5 px-4">
      <div className="container mx-auto flex items-center justify-between text-xs sm:text-sm">
        <div className="font-medium" style={{ fontFamily: "'Amiri', serif" }}>
          {hijriDate}
        </div>

        <div className="flex items-center gap-1.5 font-bold text-[#C8A54C]" dir="ltr">
          <Clock className="w-3.5 h-3.5" />
          <span className="tracking-wider font-mono">{timeDisplay}</span>
        </div>

        <div className="font-medium" dir="ltr" style={{ fontFamily: "'Inter', sans-serif" }}>
          {gregDate}
        </div>
      </div>
    </div>
  );
}
