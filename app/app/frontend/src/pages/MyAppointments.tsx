import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, MapPin, Phone, Trash2, DollarSign, Plus, XCircle } from 'lucide-react';
import { client } from '@/lib/api';
import { toast } from 'sonner';
import { getServiceByCans } from '@/lib/services';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-purple-100 text-purple-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
};

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  paid: 'bg-purple-100 text-purple-800',
  confirmed: 'bg-purple-100 text-purple-800',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const paymentLabels: Record<string, string> = {
  pending: 'Payment Pending',
  paid: 'Paid',
  confirmed: 'Payment Confirmed',
};

export default function MyAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const res = await client.entities.appointments.query({ query: {}, sort: '-created_at', limit: 50 });
      setAppointments(res.data?.items || []);
    } catch (err) {
      console.error('Failed to load appointments', err);
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId: number) => {
    try {
      await client.entities.appointments.update({
        id: String(appointmentId),
        data: { appointment_status: 'cancelled' },
      });
      toast.success('Appointment cancelled');
      loadAppointments();
    } catch (err: any) {
      toast.error(err?.message || 'Error cancelling appointment');
    }
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
            <p className="text-gray-600">Your booking history</p>
          </div>
          <Button onClick={() => navigate('/booking')} className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
            <Plus className="w-4 h-4" /> New Appointment
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-4" />
            <p className="text-gray-500">Loading appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center space-y-4">
              <CalendarDays className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-700">No appointments yet</h3>
              <p className="text-gray-500">Book your first trash can cleaning</p>
              <Button onClick={() => navigate('/booking')} className="bg-purple-600 hover:bg-purple-700 text-white">
                Book Now
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt: any) => (
              <Card key={apt.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex">
                          {Array.from({ length: apt.trash_can_count || 1 }).map((_, i) => (
                            <Trash2 key={i} className="w-5 h-5 text-purple-600" />
                          ))}
                        </div>
                        <span className="font-semibold text-gray-900">
                          {getServiceByCans(apt.trash_can_count).name} ({apt.trash_can_count} can{apt.trash_can_count > 1 ? 's' : ''})
                        </span>
                        <Badge className={statusColors[apt.appointment_status] || 'bg-gray-100 text-gray-800'}>
                          {statusLabels[apt.appointment_status] || apt.appointment_status}
                        </Badge>
                        <Badge className={paymentStatusColors[apt.payment_status] || 'bg-gray-100 text-gray-800'}>
                          {paymentLabels[apt.payment_status] || apt.payment_status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-gray-400" />
                          {apt.appointment_date}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {apt.appointment_time}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {apt.address}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {apt.phone}
                        </div>
                      </div>
                    </div>
                  <div className="text-right space-y-2">
                    <div className="flex items-center gap-1 text-purple-600 font-bold text-xl justify-end">
                      <DollarSign className="w-5 h-5" />
                      {apt.service_price}
                    </div>
                    {(apt.appointment_status === 'pending' || apt.appointment_status === 'confirmed') && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => cancelAppointment(apt.id)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}