import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { MapPin, Calendar, Users, Star } from "lucide-react";
import type { Trip } from "@workspace/api-client-react";
import { useLanguage } from "@/i18n/LanguageContext";

export function TripCard({ trip }: { trip: Trip }) {
  const { t } = useLanguage();

  return (
    <Link href={`/trips/${trip.id}`}>
      <Card className="group overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer h-full flex flex-col bg-background">
        <div className="relative h-64 overflow-hidden">
          <img
            src={trip.imageUrl || `https://picsum.photos/seed/${trip.id}/800/600`}
            alt={trip.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {trip.featured && (
            <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-bold shadow-lg shadow-black/20">
              {t("tripCard.featured")}
            </div>
          )}
          
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
            <div>
              <p className="text-white/90 text-sm font-medium flex items-center gap-1.5 mb-1">
                <MapPin className="w-4 h-4" />
                {trip.destination}, {trip.country}
              </p>
              <h3 className="text-2xl font-serif font-bold text-white leading-tight">
                {trip.title}
              </h3>
            </div>
          </div>
        </div>
        
        <CardContent className="pt-6 pb-4 flex-1">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-1.5 text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-md">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-bold text-sm">{trip.rating}</span>
              <span className="text-muted-foreground text-xs">({trip.reviewCount})</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground text-sm">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {trip.duration} {t("tripCard.days")}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {trip.availableSpots} {t("tripCard.spots")}
              </span>
            </div>
          </div>
          
          <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
            {trip.description}
          </p>
        </CardContent>
        
        <CardFooter className="border-t border-border/50 pt-4 pb-4 flex justify-center items-center bg-muted/20">
          <div className="text-primary font-semibold text-sm group-hover:underline underline-offset-4 decoration-2">
            {t("tripCard.viewDetails")}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
