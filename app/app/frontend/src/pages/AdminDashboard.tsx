import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import {
  CalendarDays, Clock, MapPin, Phone, Trash2,
  CheckCircle, XCircle, Settings, CalendarOff,
  LogOut, ExternalLink, ChevronDown, ChevronRight, Navigation,
} from 'lucide-react';
import { client } from '@/lib/api';
import { getServiceByCans } from '@/lib/services';
import { toast } from 'sonner';
import { format } from 'date-fns';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-purple-100 text-purple-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

// Extract ZIP code from address string (last 5-digit number)
function extractZipCode(address: string): string {
  const match = address.match(/\b(\d{5})\b/);
  return match ? match[1] : '00000';
}

function openGoogleMaps(address: string) {
  const encoded = encodeURIComponent(address);
  window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, '_blank');
}

// Open Google Maps Directions with multiple stops (sorted by ZIP for proximity)
function openGoogleMapsRoute(addresses: string[]) {
  if (addresses.length === 0) return;
  if (addresses.length === 1) {
    openGoogleMaps(addresses[0]);
    return;
  }

  // First address = origin, last = destination, middle = waypoints
  const origin = encodeURIComponent(addresses[0]);
  const destination = encodeURIComponent(addresses[addresses.length - 1]);
  const waypoints = addresses.slice(1, -1).map((a) => encodeURIComponent(a)).join('|');

  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
  if (waypoints) {
    url += `&waypoints=${waypoints}`;
  }
  url += '&travelmode=driving';
  window.open(url, '_blank');
}

interface DayGroup {
  date: string;
  zipGroups: { zip: string; appointments: any[] }[];
  totalCount: number;
  allAddressesSorted: string[];
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [daysOff, setDaysOff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDayOff, setNewDayOff] = useState<Date | undefined>(undefined);
  const [dayOffReason, setDayOffReason] = useState('');
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  // Check admin auth
  useEffect(() => {
    const isAdmin = localStorage.getItem('likenew_admin_auth');
    if (isAdmin !== 'true') {
      navigate('/admin-login');
      return;
    }
    loadAll();
  }, [navigate]);

  const handleAdminLogout = () => {
    localStorage.removeItem('likenew_admin_auth');
    localStorage.removeItem('likenew_admin_email');
    toast.success('Logged out');
    navigate('/admin-login');
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [aptsRes, schedRes, daysRes] = await Promise.all([
        client.entities.appointments.queryAll({ query: {}, sort: 'appointment_date', limit: 500 }),
        client.entities.schedules.query({ query: {}, limit: 100 }),
        client.entities.days_off.query({ query: {}, limit: 100 }),
      ]);
      const allApts = aptsRes.data?.items || [];
      setAppointments(allApts);
      setSchedules(schedRes.data?.items || []);
      setDaysOff(daysRes.data?.items || []);

      // Auto-expand today and the next upcoming day
      const today = format(new Date(), 'yyyy-MM-dd');
      const dates = [...new Set(allApts.map((a: any) => a.appointment_date))].sort();
      const upcoming = dates.filter((d: string) => d >= today).slice(0, 2);
      setExpandedDays(new Set(upcoming));
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (id: number, status: string, paymentStatus?: string) => {
    try {
      const updateData: any = { appointment_status: status };
      if (paymentStatus) updateData.payment_status = paymentStatus;
      await client.entities.appointments.update({ id: String(id), data: updateData });
      toast.success(`Appointment ${statusLabels[status] || status}`);
      loadAll();
    } catch (err: any) {
      toast.error(err?.message || 'Error updating');
    }
  };

  const toggleScheduleSlot = async (scheduleId: number, currentAvailable: boolean) => {
    try {
      await client.entities.schedules.update({
        id: String(scheduleId),
        data: { is_available: !currentAvailable },
      });
      toast.success('Schedule updated');
      loadAll();
    } catch (err: any) {
      toast.error(err?.message || 'Error updating schedule');
    }
  };

  const addDayOff = async () => {
    if (!newDayOff) {
      toast.error('Please select a date');
      return;
    }
    try {
      await client.entities.days_off.create({
        data: {
          date: format(newDayOff, 'yyyy-MM-dd'),
          reason: dayOffReason || 'Day off',
        },
      });
      toast.success('Day off added');
      setNewDayOff(undefined);
      setDayOffReason('');
      loadAll();
    } catch (err: any) {
      toast.error(err?.message || 'Error adding day off');
    }
  };

  const removeDayOff = async (id: number) => {
    try {
      await client.entities.days_off.delete({ id: String(id) });
      toast.success('Day off removed');
      loadAll();
    } catch (err: any) {
      toast.error(err?.message || 'Error removing');
    }
  };

  const toggleDay = (date: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  // Group appointments by date, then by ZIP code (sorted)
  const groupedByDay = useMemo((): DayGroup[] => {
    const activeApts = appointments.filter(
      (a: any) => a.appointment_status === 'pending' || a.appointment_status === 'confirmed'
    );

    // Group by date
    const dateMap = new Map<string, any[]>();
    for (const apt of activeApts) {
      const date = apt.appointment_date || 'Unknown';
      if (!dateMap.has(date)) dateMap.set(date, []);
      dateMap.get(date)!.push(apt);
    }

    // Sort dates ascending
    const sortedDates = [...dateMap.keys()].sort();

    return sortedDates.map((date) => {
      const dayApts = dateMap.get(date)!;

      // Group by ZIP code
      const zipMap = new Map<string, any[]>();
      for (const apt of dayApts) {
        const zip = extractZipCode(apt.address || '');
        if (!zipMap.has(zip)) zipMap.set(zip, []);
        zipMap.get(zip)!.push(apt);
      }

      // Sort ZIP groups numerically
      const sortedZips = [...zipMap.keys()].sort((a, b) => a.localeCompare(b));

      const zipGroups = sortedZips.map((zip) => ({
        zip,
        appointments: zipMap.get(zip)!.sort((a: any, b: any) =>
          (a.appointment_time || '').localeCompare(b.appointment_time || '')
        ),
      }));

      // Build sorted address list for route (grouped by ZIP for proximity)
      const allAddressesSorted: string[] = [];
      for (const zg of zipGroups) {
        for (const apt of zg.appointments) {
          if (apt.address) allAddressesSorted.push(apt.address);
        }
      }

      return { date, zipGroups, totalCount: dayApts.length, allAddressesSorted };
    });
  }, [appointments]);

  const completedAppointments = appointments
    .filter((a: any) => a.appointment_status === 'completed' || a.appointment_status === 'cancelled')
    .sort((a: any, b: any) => (b.appointment_date || '').localeCompare(a.appointment_date || ''));

  // Group schedules by day
  const schedulesByDay = DAY_NAMES.map((name, idx) => ({
    name,
    dayIndex: idx,
    slots: schedules.filter((s: any) => s.day_of_week === idx).sort((a: any, b: any) => a.time_slot.localeCompare(b.time_slot)),
  }));

  const totalPending = appointments.filter((a: any) => a.appointment_status === 'pending').length;
  const totalConfirmed = appointments.filter((a: any) => a.appointment_status === 'confirmed').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Las Vegas, NV — Appointments by day & ZIP code</p>
          </div>
          <Button
            variant="outline"
            onClick={handleAdminLogout}
            className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-600">{totalPending}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{totalConfirmed}</p>
              <p className="text-sm text-gray-500">Confirmed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{completedAppointments.length}</p>
              <p className="text-sm text-gray-500">History</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-600">{daysOff.length}</p>
              <p className="text-sm text-gray-500">Days Off</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="appointments">
          <TabsList className="mb-6">
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="schedules">Schedules</TabsTrigger>
            <TabsTrigger value="daysoff">Days Off</TabsTrigger>
          </TabsList>

          {/* Appointments Tab — grouped by day, then by ZIP */}
          <TabsContent value="appointments" className="space-y-4">
            {groupedByDay.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No active appointments</p>
                </CardContent>
              </Card>
            ) : (
              groupedByDay.map((dayGroup) => (
                <Card key={dayGroup.date} className="overflow-hidden">
                  {/* Day Header — clickable to expand/collapse */}
                  <div className="flex items-center bg-gray-50">
                    <button
                      onClick={() => toggleDay(dayGroup.date)}
                      className="flex-1 flex items-center justify-between p-4 hover:bg-gray-100 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        {expandedDays.has(dayGroup.date) ? (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-500" />
                        )}
                        <CalendarDays className="w-5 h-5 text-purple-600" />
                        <span className="font-bold text-gray-900 text-lg">{dayGroup.date}</span>
                        <Badge className="bg-purple-100 text-purple-800 text-sm">
                          {dayGroup.totalCount} appointment{dayGroup.totalCount > 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </button>
                    {/* START ROUTE button — opens Google Maps Directions with all addresses for the day */}
                    <div className="pr-4">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openGoogleMapsRoute(dayGroup.allAddressesSorted);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-md"
                      >
                        <Navigation className="w-4 h-4" />
                        Start Route
                      </Button>
                    </div>
                  </div>

                  {/* Expanded content */}
                  {expandedDays.has(dayGroup.date) && (
                    <CardContent className="p-4 space-y-4">
                      {/* Route summary */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                        <Navigation className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-800">
                          <strong>Route order (by ZIP code proximity):</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {dayGroup.zipGroups.map((zg, idx) => (
                              <span key={zg.zip} className="inline-flex items-center">
                                <Badge className="bg-blue-100 text-blue-700 text-xs">
                                  {idx + 1}. ZIP {zg.zip} ({zg.appointments.length})
                                </Badge>
                                {idx < dayGroup.zipGroups.length - 1 && (
                                  <span className="mx-1 text-blue-400">→</span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {dayGroup.zipGroups.map((zipGroup, zipIdx) => (
                        <div key={zipGroup.zip} className="space-y-2">
                          {/* ZIP code header with route step number */}
                          <div className="flex items-center gap-2 px-2">
                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {zipIdx + 1}
                            </div>
                            <MapPin className="w-4 h-4 text-blue-500" />
                            <span className="font-semibold text-blue-700 text-sm">
                              ZIP: {zipGroup.zip}
                            </span>
                            <span className="text-xs text-gray-400">
                              ({zipGroup.appointments.length} appointment{zipGroup.appointments.length > 1 ? 's' : ''})
                            </span>
                            {/* Route just this ZIP group */}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const addrs = zipGroup.appointments.map((a: any) => a.address).filter(Boolean);
                                openGoogleMapsRoute(addrs);
                              }}
                              className="gap-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 text-xs h-7 px-2"
                            >
                              <Navigation className="w-3 h-3" /> Route this ZIP
                            </Button>
                          </div>

                          {/* Appointments in this ZIP */}
                          <div className="space-y-2 pl-2">
                            {zipGroup.appointments.map((apt: any, aptIdx: number) => (
                              <div
                                key={apt.id}
                                className={`rounded-lg border p-3 ${
                                  apt.appointment_status === 'pending'
                                    ? 'border-l-4 border-l-amber-400 bg-white'
                                    : 'border-l-4 border-l-purple-400 bg-white'
                                }`}
                              >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                                  <div className="space-y-1 flex-1">
                                    {/* Stop number indicator */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-700 text-xs font-bold">
                                        {aptIdx + 1}
                                      </span>
                                      <div className="flex">
                                        {Array.from({ length: apt.trash_can_count || 1 }).map((_, i) => (
                                          <Trash2 key={i} className="w-4 h-4 text-purple-600" />
                                        ))}
                                      </div>
                                      <span className="font-semibold text-sm">
                                        {getServiceByCans(apt.trash_can_count).name} ({apt.trash_can_count} can{apt.trash_can_count > 1 ? 's' : ''})
                                      </span>
                                      <Badge className="bg-purple-100 text-purple-800 text-xs">${apt.service_price}</Badge>
                                      <Badge className={`text-xs ${statusColors[apt.appointment_status]}`}>
                                        {statusLabels[apt.appointment_status]}
                                      </Badge>
                                      <Badge className={`text-xs ${statusColors[apt.payment_status] || 'bg-gray-100'}`}>
                                        {apt.payment_status === 'pending' ? '💰 Unpaid' : '✅ Paid'}
                                      </Badge>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm text-gray-600">
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {apt.appointment_time}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Phone className="w-3 h-3" /> {apt.phone}
                                      </span>
                                      <button
                                        onClick={() => openGoogleMaps(apt.address)}
                                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline text-left col-span-1 sm:col-span-2"
                                      >
                                        <MapPin className="w-3 h-3" /> {apt.address} <ExternalLink className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="flex gap-2 flex-wrap">
                                    {apt.appointment_status === 'pending' && (
                                      <Button
                                        size="sm"
                                        onClick={() => updateAppointmentStatus(apt.id, 'confirmed', 'paid')}
                                        className="bg-purple-600 hover:bg-purple-700 text-white gap-1"
                                      >
                                        <CheckCircle className="w-3 h-3" /> Confirm
                                      </Button>
                                    )}
                                    {apt.appointment_status === 'confirmed' && (
                                      <Button
                                        size="sm"
                                        onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                                        className="bg-blue-500 hover:bg-blue-600 text-white gap-1"
                                      >
                                        <CheckCircle className="w-3 h-3" /> Complete
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openGoogleMaps(apt.address)}
                                      className="gap-1 text-blue-600 border-blue-300 hover:bg-blue-50"
                                    >
                                      <MapPin className="w-3 h-3" /> Navigate
                                    </Button>
                                    {apt.appointment_status === 'pending' && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => updateAppointmentStatus(apt.id, 'cancelled')}
                                        className="gap-1 text-red-600 border-red-300 hover:bg-red-50"
                                      >
                                        <XCircle className="w-3 h-3" /> Cancel
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-3">
            {completedAppointments.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No history yet</p>
                </CardContent>
              </Card>
            ) : (
              completedAppointments.map((apt: any) => (
                <Card key={apt.id} className="opacity-75">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Trash2 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">
                          {getServiceByCans(apt.trash_can_count).name} ({apt.trash_can_count} can{apt.trash_can_count > 1 ? 's' : ''}) — {apt.appointment_date} {apt.appointment_time}
                        </span>
                        <Badge className={statusColors[apt.appointment_status] || 'bg-gray-100'}>
                          {statusLabels[apt.appointment_status] || apt.appointment_status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openGoogleMaps(apt.address)}
                          className="text-blue-500 hover:text-blue-700"
                          title="Open in Google Maps"
                        >
                          <MapPin className="w-4 h-4" />
                        </button>
                        <span className="font-semibold">${apt.service_price}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Schedules Tab */}
          <TabsContent value="schedules" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-600" />
                  Manage Schedules by Day
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {schedulesByDay.map((day) => (
                    <div key={day.dayIndex}>
                      <h3 className="font-semibold text-gray-900 mb-2">{day.name}</h3>
                      {day.slots.length === 0 ? (
                        <p className="text-sm text-gray-400">No time slots configured</p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {day.slots.map((slot: any) => (
                            <div
                              key={slot.id}
                              className={`flex items-center justify-between p-2 rounded-lg border text-sm ${
                                slot.is_available ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <span className={slot.is_available ? 'text-purple-700' : 'text-gray-400 line-through'}>
                                {slot.time_slot}
                              </span>
                              <Switch
                                checked={slot.is_available}
                                onCheckedChange={() => toggleScheduleSlot(slot.id, slot.is_available)}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Days Off Tab */}
          <TabsContent value="daysoff" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarOff className="w-5 h-5 text-red-500" />
                    Add Day Off
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={newDayOff}
                      onSelect={setNewDayOff}
                      fromDate={new Date()}
                      className="rounded-lg border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reason (optional)</Label>
                    <Input
                      placeholder="e.g. Vacation, Holiday..."
                      value={dayOffReason}
                      onChange={(e) => setDayOffReason(e.target.value)}
                    />
                  </div>
                  <Button onClick={addDayOff} className="w-full bg-red-500 hover:bg-red-600 text-white">
                    Add Day Off
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Scheduled Days Off</CardTitle>
                </CardHeader>
                <CardContent>
                  {daysOff.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No days off scheduled</p>
                  ) : (
                    <div className="space-y-2">
                      {daysOff
                        .sort((a: any, b: any) => a.date.localeCompare(b.date))
                        .map((day: any) => (
                          <div key={day.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                            <div>
                              <p className="font-medium text-gray-900">{day.date}</p>
                              {day.reason && <p className="text-sm text-gray-500">{day.reason}</p>}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeDayOff(day.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-100"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}