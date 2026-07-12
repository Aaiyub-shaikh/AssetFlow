import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Booking } from "@/types/booking";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookingCalendarProps {
  bookings: Booking[];
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  onDateClick?: (date: Date) => void;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  bookings,
  currentMonth,
  onMonthChange,
  onDateClick
}) => {
  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const daysByWeek = useMemo(() => {
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  }, [days]);

  const getBookingsForDate = (date: Date) => {
    return bookings.filter((booking) => isSameDay(new Date(booking.startTime), date));
  };

  const previousMonth = () => {
    onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Calendar View</CardTitle>
            <CardDescription>Resource bookings calendar</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={previousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[150px] text-center">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {daysByWeek.map((week, weekIdx) =>
            week.map((day, dayIdx) => {
              const dateBookings = getBookingsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={`${weekIdx}-${dayIdx}`}
                  onClick={() => onDateClick?.(day)}
                  className={`min-h-[100px] p-2 border rounded-lg cursor-pointer transition-colors ${
                    isCurrentMonth ? "bg-white" : "bg-muted/50"
                  } ${isToday ? "border-primary border-2" : "border-border"} hover:bg-accent`}
                >
                  <div
                    className={`text-sm font-medium mb-1 ${
                      isCurrentMonth ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {format(day, "d")}
                  </div>

                  <div className="space-y-1">
                    {dateBookings.slice(0, 2).map((booking) => (
                      <div
                        key={booking._id}
                        className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded truncate hover:bg-primary/20"
                      >
                        {booking.title}
                      </div>
                    ))}
                    {dateBookings.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{dateBookings.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingCalendar;
