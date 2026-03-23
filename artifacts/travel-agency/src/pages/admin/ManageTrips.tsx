import { useState } from "react";
import { useGetTrips, useCreateTrip, useDeleteTrip, getGetTripsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, MapPin, Edit } from "lucide-react";
import { format } from "date-fns";

export default function ManageTrips() {
  const { data: trips, isLoading } = useGetTrips();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const createTrip = useCreateTrip({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetTripsQueryKey() });
        toast({ title: "تم إضافة الرحلة بنجاح" });
        setIsDialogOpen(false);
      },
      onError: () => toast({ variant: "destructive", title: "حدث خطأ أثناء الإضافة" })
    }
  });

  const deleteTrip = useDeleteTrip({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetTripsQueryKey() });
        toast({ title: "تم حذف الرحلة" });
      }
    }
  });

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الرحلة؟ لا يمكن التراجع عن هذا الإجراء.")) {
      deleteTrip.mutate({ id });
    }
  };

  const [formData, setFormData] = useState({
    title: "", description: "", destination: "", country: "", imageUrl: "",
    price: 0, duration: 1, maxCapacity: 10, startDate: "", endDate: "",
    featured: false, includes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTrip.mutate({
      data: {
        ...formData,
        includes: formData.includes.split("\n").filter(i => i.trim() !== "")
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif font-bold text-foreground">إدارة الرحلات</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl shadow-lg shadow-primary/20 gap-2">
              <Plus className="w-4 h-4" /> إضافة رحلة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">إضافة رحلة جديدة</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>عنوان الرحلة</Label>
                  <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>رابط الصورة</Label>
                  <Input dir="ltr" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label>الوجهة (المدينة)</Label>
                  <Input required value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>الدولة</Label>
                  <Input required value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>السعر (ر.س)</Label>
                  <Input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>المدة (أيام)</Label>
                  <Input type="number" required value={formData.duration} onChange={e => setFormData({...formData, duration: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>السعة القصوى (أشخاص)</Label>
                  <Input type="number" required value={formData.maxCapacity} onChange={e => setFormData({...formData, maxCapacity: Number(e.target.value)})} />
                </div>
                <div className="flex items-center space-x-2 space-x-reverse pt-8">
                  <Checkbox id="featured" checked={formData.featured} onCheckedChange={(c) => setFormData({...formData, featured: !!c})} />
                  <Label htmlFor="featured" className="cursor-pointer">رحلة مميزة (تعرض في الرئيسية)</Label>
                </div>
                <div className="space-y-2">
                  <Label>تاريخ البداية</Label>
                  <Input type="date" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>تاريخ النهاية</Label>
                  <Input type="date" required value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>الوصف</Label>
                <Textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              
              <div className="space-y-2">
                <Label>ماذا تشمل الرحلة؟ (عنصر واحد في كل سطر)</Label>
                <Textarea rows={4} value={formData.includes} onChange={e => setFormData({...formData, includes: e.target.value})} placeholder="تذاكر الطيران&#10;إقامة في فندق 5 نجوم..." />
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button type="submit" className="w-full md:w-auto px-8 rounded-xl" disabled={createTrip.isPending}>
                  {createTrip.isPending ? "جاري الحفظ..." : "حفظ الرحلة"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-right whitespace-nowrap">الرحلة</TableHead>
                <TableHead className="text-right">الوجهة</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">السعر</TableHead>
                <TableHead className="text-right">الشواغر</TableHead>
                <TableHead className="text-center">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">جاري التحميل...</TableCell>
                </TableRow>
              ) : trips?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">لا توجد رحلات. أضف رحلة جديدة للبدء.</TableCell>
                </TableRow>
              ) : (
                trips?.map((trip) => (
                  <TableRow key={trip.id} className="group">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <img src={trip.imageUrl || `https://picsum.photos/seed/${trip.id}/100/100`} className="w-12 h-12 rounded-lg object-cover" alt="" />
                        <span>{trip.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground whitespace-nowrap">
                        <MapPin className="w-4 h-4" /> {trip.destination}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(trip.startDate), "dd MMM")} - {format(new Date(trip.endDate), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="font-sans font-bold whitespace-nowrap">{trip.price.toLocaleString()} ر.س</TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${trip.availableSpots > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-destructive/10 text-destructive'}`}>
                        {trip.availableSpots} / {trip.maxCapacity}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(trip.id)} disabled={deleteTrip.isPending}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
