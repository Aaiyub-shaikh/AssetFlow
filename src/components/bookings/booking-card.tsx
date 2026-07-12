import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Booking } from "@/types/booking";
import { StatusBadge } from "./status-badge";
import { formatDistanceToNow, format } from "date-fns";
import { Clock, MapPin, Users, X, Edit2 } from "lucide-react";

interface BookingCardProps {
  booking: Booking;
  onCancel?: () => void;
  onReschedule?: () => void;
  isLoading?: boolean;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onCancel,
  onReschedule,
  isLoading = false
}) => {
  const startTime = new Date(booking.startTime);
  const endTime = new Date(booking.endTime);
  const now = new Date();

  const isUpcoming = startTime > now;
  const isOngoing = startTime <= now && endTime > now;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{booking.title}</CardTitle>
            <CardDescription className="mt-1">
              {booking.resource.name} • {booking.resource.location}
            </CardDescription>
          </div>
          <StatusBadge status={booking.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Time Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>{format(startTime, "MMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm ml-6">
            <span className="font-medium">
              {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
            </span>
            {isUpcoming && (
              <span className="text-xs text-muted-foreground">
                ({formatDistanceToNow(startTime, { addSuffix: true })})
              </span>
            )}
            {isOngoing && <Badge variant="secondary">In Progress</Badge>}
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span>{booking.resource.location}</span>
        </div>

        {/* Attendees */}
        {booking.attendees && booking.attendees.length > 0 && (
          <div className="flex items-start gap-2 text-sm">
            <Users className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {booking.attendees.map((attendee) => (
                <Badge key={attendee._id} variant="outline" className="text-xs">
                  {attendee.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {booking.description && (
          <div className="text-sm text-muted-foreground pt-2 border-t">
            {booking.description}
          </div>
        )}

        {/* Actions */}
        {(booking.status === "upcoming" || booking.status === "ongoing") && (
          <div className="flex gap-2 pt-2 border-t">
            {booking.isCancellationAllowed && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                disabled={isLoading}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
            )}
            {isUpcoming && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReschedule}
                disabled={isLoading}
                className="gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Reschedule
              </Button>
            )}
          </div>
        )}

        {/* Cancelled Reason */}
        {booking.status === "cancelled" && booking.cancellationReason && (
          <div className="text-sm text-destructive pt-2 border-t italic">
            Reason: {booking.cancellationReason}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingCard;
