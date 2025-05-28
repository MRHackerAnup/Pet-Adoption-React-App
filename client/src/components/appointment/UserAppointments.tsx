import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Appointment } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, AlertCircle } from "lucide-react";
import { Loader2 } from "lucide-react";

export function UserAppointments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [cancelAppointmentId, setCancelAppointmentId] = useState<number | null>(null);

  const { 
    data: appointments, 
    isLoading, 
    error 
  } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments/user"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/appointments/user");
      return res.json();
    },
    enabled: !!user,
  });

  const cancelMutation = useMutation({
    mutationFn: async (appointmentId: number) => {
      const res = await apiRequest("PATCH", `/api/appointments/${appointmentId}/status`, {
        status: "Canceled"
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Appointment Canceled",
        description: "Your appointment has been canceled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments/user"] });
      setCancelAppointmentId(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to cancel appointment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function handleCancel(appointmentId: number) {
    setCancelAppointmentId(appointmentId);
  }

  function confirmCancel() {
    if (cancelAppointmentId) {
      cancelMutation.mutate(cancelAppointmentId);
    }
  }

  const getBadgeColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "Confirmed":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "Completed":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "Canceled":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p>Error loading appointments. Please try again later.</p>
      </div>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium mb-2">No Appointments</h3>
        <p className="text-gray-500">You don't have any scheduled appointments.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Your Appointments</h2>
      
      {appointments.map((appointment) => (
        <Card key={appointment.id} className="w-full">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Visit on {format(new Date(appointment.date), "MMMM d, yyyy")}</CardTitle>
                <CardDescription>
                  <div className="flex items-center mt-1">
                    <Clock className="h-4 w-4 mr-1" />
                    {appointment.time}
                  </div>
                </CardDescription>
              </div>
              <Badge className={getBadgeColor(appointment.status)}>
                {appointment.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 mt-1" />
                <div>
                  <p className="font-medium">Location details will be provided once the appointment is confirmed</p>
                </div>
              </div>
              {appointment.notes && (
                <div className="mt-2">
                  <p className="font-medium">Notes:</p>
                  <p className="text-gray-700">{appointment.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            {appointment.status === "Scheduled" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" onClick={() => handleCancel(appointment.id)}>
                    Cancel Appointment
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel this appointment? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setCancelAppointmentId(null)}>
                      No, keep it
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={confirmCancel}>
                      Yes, cancel appointment
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}