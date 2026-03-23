import { useGetBookings, useUpdateBookingStatus, getGetBookingsQueryKey } from "@workspace/api-client-react";
import type { BookingStatus } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function ManageBookings() {
  const { data: bookings, isLoading } = useGetBookings();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateStatus = useUpdateBookingStatus({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetBookingsQueryKey() });
        toast({ title: "تم تحديث حالة الحجز" });
      },
      onError: () => toast({ variant: "destructive", title: "حدث خطأ" })
    }
  });

  const handleStatusChange = (id: number, status: BookingStatus) => {
    updateStatus.mutate({ id, data: { status } });
  };

  const statusColors = {
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
    cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const statusLabels = {
    pending: "معلق",
    confirmed: "مؤكد",
    cancelled: "ملغي",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-bold text-foreground">إدارة الحجوزات</h1>

      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-right">رقم الحجز</TableHead>
                <TableHead className="text-right">العميل</TableHead>
                <TableHead className="text-right">الرحلة</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">الإجمالي</TableHead>
                <TableHead className="text-center">الحالة والإجراء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">جاري التحميل...</TableCell>
                </TableRow>
              ) : bookings?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">لا توجد حجوزات حالياً.</TableCell>
                </TableRow>
              ) : (
                bookings?.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-mono text-muted-foreground">#{booking.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{booking.guestName}</div>
                      <div className="text-xs text-muted-foreground" dir="ltr">{booking.guestPhone}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium line-clamp-1 max-w-[200px]">{booking.trip?.title || `رحلة #${booking.tripId}`}</div>
                      <div className="text-xs text-muted-foreground">{booking.numberOfPeople} أشخاص</div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {format(new Date(booking.createdAt), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="font-sans font-bold whitespace-nowrap">
                      {booking.totalPrice.toLocaleString()} ر.س
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <Select 
                          defaultValue={booking.status} 
                          onValueChange={(val: BookingStatus) => handleStatusChange(booking.id, val)}
                          disabled={updateStatus.isPending}
                        >
                          <SelectTrigger className={`w-[120px] h-8 text-xs font-bold border rounded-full ${statusColors[booking.status]}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">معلق</SelectItem>
                            <SelectItem value="confirmed">مؤكد</SelectItem>
                            <SelectItem value="cancelled">ملغي</SelectItem>
                          </SelectContent>
                        </Select>
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
