import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MapPinOff } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const texts = {
  ar: { title: "لقد ضللت الطريق!", desc: "الصفحة التي تبحث عنها غير موجودة. ربما تم تغيير مسار الرحلة أو حذفت الوجهة.", btn: "العودة للرئيسية" },
  fr: { title: "Vous êtes perdu !", desc: "La page que vous recherchez n'existe pas. Le parcours a peut-être été modifié.", btn: "Retour à l'accueil" },
  en: { title: "You're lost!", desc: "The page you're looking for doesn't exist. The route may have been changed or removed.", btn: "Back to Home" },
};

export default function NotFound() {
  const { lang } = useLanguage();
  const t = texts[lang];

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
        <MapPinOff className="w-12 h-12 text-muted-foreground" />
      </div>
      <h1 className="text-4xl font-serif font-bold text-foreground mb-4">{t.title}</h1>
      <p className="text-lg text-muted-foreground max-w-md mb-8">{t.desc}</p>
      <Link href="/">
        <Button size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20">
          {t.btn}
        </Button>
      </Link>
    </div>
  );
}
