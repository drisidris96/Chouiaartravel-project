import { useState, useEffect } from "react";
import { useGetTrips } from "@workspace/api-client-react";
import { TripCard } from "@/components/TripCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, SlidersHorizontal } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Trips() {
  const [destination, setDestination] = useState("");
  const [debouncedDestination, setDebouncedDestination] = useState("");
  const { t } = useLanguage();

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedDestination(destination), 500);
    return () => clearTimeout(handler);
  }, [destination]);

  const { data: trips, isLoading } = useGetTrips({
    destination: debouncedDestination || undefined,
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-secondary text-secondary-foreground py-20 mb-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">{t("trips.title")}</h1>
          <p className="text-lg text-secondary-foreground/70 max-w-2xl mx-auto">
            {t("trips.subtitle")}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-lg shadow-black/5 sticky top-28">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border/50">
              <SlidersHorizontal className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-lg">{t("trips.filter")}</h2>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="destination">{t("trips.destination")}</Label>
                <div className="relative">
                  <Search className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="destination"
                    placeholder={t("trips.searchPlaceholder")}
                    className="pr-10 rounded-xl bg-muted/50"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col space-y-4">
                  <Skeleton className="h-64 rounded-xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : trips && trips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-3xl border border-border/50 border-dashed">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-2">{t("trips.noResults")}</h3>
              <p className="text-muted-foreground max-w-md">
                {t("trips.noResultsDesc")}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
