import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Trash2, MapPin, Phone, CalendarDays, Clock, DollarSign,
  ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, Copy,
} from 'lucide-react';
import { client } from '@/lib/api';
import { SERVICE_OPTIONS, getServiceByCans } from '@/lib/services';
import { toast } from 'sonner';
import { format, addDays, getDay } from 'date-fns';

const CITY = 'Las Vegas';
const STATE = 'NV';
const ZELLE_NUMBER = '(702) 689-1663';
const ZELLE_NUMBER_RAW = '7026891663';

// Convert JS getDay (0=Sun) to our format (0=Mon)
function jsDayToOurDay(jsDay: number): number {
  return jsDay === 0 ? 6 : jsDay - 1;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    toast.success('Phone number copied!');
  }).catch(() => {
    toast.error('Could not copy. Please copy manually.');
  });
}

export default function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCans = parseInt(searchParams.get('cans') || '1');

  // Important notice acknowledgment
  const [noticeAcknowledged, setNoticeAcknowledged] = useState(false);
  const [noticeChecked, setNoticeChecked] = useState(false);

  const [step, setStep] = useState(1);
  const [selectedCans, setSelectedCans] = useState(initialCans);

  // Address fields
  const [streetNumber, setStreetNumber] = useState('');
  const [streetName, setStreetName] = useState('');
  const [zipCode, setZipCode] = useState('');

  const [phone, setPhone] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Data from backend
  const [schedules, setSchedules] = useState<any[]>([]);
  const [daysOff, setDaysOff] = useState<any[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<any[]>([]);

  useEffect(() => {
    loadSchedules();
    loadDaysOff();
    loadExistingAppointments();
  }, []);

  const loadSchedules = async () => {
    try {
      const res = await client.entities.schedules.query({ query: { is_available: true }, limit: 100 });
      setSchedules(res.data?.items || []);
    } catch {
      console.error('Failed to load schedules');
    }
  };

  const loadDaysOff = async () => {
    try {
      const res = await client.entities.days_off.query({ query: {}, limit: 100 });
      setDaysOff(res.data?.items || []);
    } catch {
      console.error('Failed to load days off');
    }
  };

  const loadExistingAppointments = async () => {
    try {
      const res = await client.entities.appointments.queryAll({
        query: {},
        limit: 500,
        fields: ['appointment_date', 'appointment_time', 'appointment_status'],
      });
      setExistingAppointments(
        (res.data?.items || []).filter((a: any) => a.appointment_status !== 'cancelled')
      );
    } catch {
      console.error('Failed to load appointments');
    }
  };

  const selectedService = getServiceByCans(selectedCans);

  // Build full address string
  const fullAddress = useMemo(() => {
    const parts = [];
    if (streetNumber.trim()) parts.push(streetNumber.trim());
    if (streetName.trim()) parts.push(streetName.trim());
    parts.push(CITY);
    parts.push(STATE);
    if (zipCode.trim()) parts.push(zipCode.trim());
    return parts.join(', ');
  }, [streetNumber, streetName, zipCode]);

  // Disabled dates: days off + days with no available schedule slots
  const disabledDates = useMemo(() => {
    const offDates = new Set(daysOff.map((d: any) => d.date));
    const availableDays = new Set(schedules.map((s: any) => s.day_of_week));
    return (date: Date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      if (offDates.has(dateStr)) return true;
      const ourDay = jsDayToOurDay(getDay(date));
      if (!availableDays.has(ourDay)) return true;
      if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true;
      return false;
    };
  }, [daysOff, schedules]);

  // Available time slots for selected date
  const availableTimeSlots = useMemo(() => {
    if (!selectedDate) return [];
    const ourDay = jsDayToOurDay(getDay(selectedDate));
    const daySlots = schedules.filter((s: any) => s.day_of_week === ourDay && s.is_available);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const bookedSlots = new Set(
      existingAppointments
        .filter((a: any) => a.appointment_date === dateStr)
        .map((a: any) => a.appointment_time)
    );
    return daySlots
      .map((s: any) => s.time_slot)
      .filter((slot: string) => !bookedSlots.has(slot))
      .sort();
  }, [selectedDate, schedules, existingAppointments]);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !streetNumber.trim() || !streetName.trim() || !zipCode.trim() || !phone.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setSubmitting(true);
    try {
      await client.entities.appointments.create({
        data: {
          trash_can_count: selectedCans,
          service_price: selectedService.price,
          address: fullAddress,
          phone: phone.trim(),
          appointment_date: format(selectedDate, 'yyyy-MM-dd'),
          appointment_time: selectedTime,
          payment_status: 'pending',
          appointment_status: 'pending',
          notes: '',
          payment_proof_url: '',
          created_at: new Date().toISOString(),
        },
      });
      setSubmitted(true);
      toast.success('Appointment booked successfully!');
    } catch (err: any) {
      toast.error(err?.message || 'Error booking appointment');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── ZELLE PAYMENT INFO COMPONENT ───
  const ZellePaymentCard = ({ showSteps }: { showSteps?: boolean }) => (
    <div className="bg-white border-2 border-purple-200 rounded-xl p-5 text-left space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-white" />
        </div>
        <h3 className="font-bold text-purple-900 text-lg">Pay $20 Deposit via Zelle</h3>
      </div>

      {/* Zelle number with copy */}
      <div className="bg-white rounded-lg border-2 border-purple-300 p-4">
        <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide mb-1">Send Zelle to this number:</p>
        <div className="flex items-center justify-between gap-3">
          <span className="text-2xl font-bold text-purple-900 tracking-wide">{ZELLE_NUMBER}</span>
          <Button
            size="sm"
            onClick={() => copyToClipboard(ZELLE_NUMBER_RAW)}
            className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5 flex-shrink-0"
          >
            <Copy className="w-4 h-4" /> Copy
          </Button>
        </div>
      </div>

      {showSteps && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-purple-800">How to pay:</p>
          <div className="space-y-1.5">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
              <p className="text-sm text-purple-700">Open your bank app and go to <strong>Zelle</strong></p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
              <p className="text-sm text-purple-700">Send <strong>$20.00</strong> to <strong>{ZELLE_NUMBER}</strong></p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
              <p className="text-sm text-purple-700">In the memo, write your <strong>name</strong> and <strong>appointment date</strong></p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
              <p className="text-sm text-purple-700">We'll confirm your appointment once we receive the deposit</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-purple-100 rounded-lg p-3 border border-purple-200">
        <p className="text-sm text-purple-800">
          💰 <strong>$20.00</strong> deposit now · Remaining <strong>${selectedService.price - 20}</strong> due on the day of service
        </p>
      </div>
    </div>
  );

  // ─── SUCCESS SCREEN ───
  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8 space-y-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Appointment Booked!</h2>
            <div className="space-y-2 text-gray-600">
              <p><strong>Service:</strong> {selectedService.name} ({selectedCans} can{selectedCans > 1 ? 's' : ''}) - ${selectedService.price}</p>
              <p><strong>Date:</strong> {selectedDate && format(selectedDate, 'PPP')}</p>
              <p><strong>Time:</strong> {selectedTime}</p>
              <p><strong>Address:</strong> {fullAddress}</p>
            </div>

            {/* Zelle Payment Info */}
            <ZellePaymentCard showSteps />

            {/* Loyalty Discount */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-left">
              <p className="font-semibold text-purple-800 mb-2">🎉 Loyalty Discount!</p>
              <p className="text-sm text-purple-700">
                If you schedule your next service within <strong>4 months</strong>, you'll receive a <strong>$5 discount per trash can</strong>!
              </p>
              <p className="text-sm text-purple-700 mt-1">
                We recommend cleaning your trash cans every <strong>3-4 months</strong> to keep them fresh and sanitized. 🧼
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/my-appointments')} className="flex-1">
                My Appointments
              </Button>
              <Button onClick={() => navigate('/')} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
                Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── IMPORTANT NOTICE (shown before booking flow) ───
  if (!noticeAcknowledged) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-amber-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 text-center">Important Notice</h2>
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5 space-y-3">
              <p className="text-amber-900 font-semibold text-lg text-center">
                ⚠️ Please Read Before Booking
              </p>
              <p className="text-amber-800 text-base leading-relaxed">
                We clean your trash cans <strong>on the same day your trash is collected</strong> at your home.
                We need the cans to be <strong>empty</strong> so we can properly clean them.
              </p>
              <p className="text-amber-800 text-base leading-relaxed">
                Please make sure to schedule your appointment for your <strong>regular trash collection day</strong>.
                If the cans are not empty when we arrive, we will not be able to perform the service.
              </p>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <Checkbox
                id="acknowledge"
                checked={noticeChecked}
                onCheckedChange={(checked) => setNoticeChecked(checked === true)}
                className="mt-0.5"
              />
              <label htmlFor="acknowledge" className="text-sm text-gray-700 cursor-pointer leading-relaxed">
                I have read and understand that the service will be performed on my trash collection day and my cans must be empty.
              </label>
            </div>
            <Button
              onClick={() => setNoticeAcknowledged(true)}
              disabled={!noticeChecked}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              I Understand, Continue to Booking
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="w-full text-gray-500"
            >
              Go Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── BOOKING FLOW ───
  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= s ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {s}
              </div>
              {s < 4 && <div className={`w-8 h-0.5 ${step > s ? 'bg-purple-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Select Service */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-purple-600" />
                Choose Your Service
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {SERVICE_OPTIONS.map((s) => (
                  <div
                    key={s.cans}
                    onClick={() => setSelectedCans(s.cans)}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedCans === s.cans
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex">
                        {Array.from({ length: s.cans }).map((_, i) => (
                          <Trash2 key={i} className="w-6 h-6 text-purple-600" />
                        ))}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">{s.name}</span>
                        <p className="text-xs text-gray-500">{s.description}</p>
                        <p className="text-xs text-gray-400">{s.cans} trash can{s.cans > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-purple-600">${s.price}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={() => setStep(2)} className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
                  Next <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Address & Phone */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-600" />
                Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Location badge */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <p className="text-sm text-purple-800">
                  Service area: <strong>Las Vegas, Nevada</strong>
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2 col-span-1">
                  <Label htmlFor="streetNumber">Street #</Label>
                  <Input
                    id="streetNumber"
                    placeholder="1234"
                    value={streetNumber}
                    onChange={(e) => setStreetNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="streetName">Street Name</Label>
                  <Input
                    id="streetName"
                    placeholder="Main St"
                    value={streetName}
                    onChange={(e) => setStreetName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={CITY}
                    disabled
                    className="bg-gray-100 text-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={STATE}
                    disabled
                    className="bg-gray-100 text-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    placeholder="89101"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    maxLength={5}
                  />
                </div>
              </div>

              {/* Preview full address */}
              {(streetNumber || streetName || zipCode) && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Full Address Preview:</p>
                  <p className="text-sm font-medium text-gray-800">{fullAddress}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="phone"
                    placeholder="(702) 555-1234"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button
                  onClick={() => {
                    if (!streetNumber.trim() || !streetName.trim() || !zipCode.trim() || !phone.trim()) {
                      toast.error('Please fill in all fields');
                      return;
                    }
                    if (zipCode.trim().length < 5) {
                      toast.error('Please enter a valid 5-digit ZIP code');
                      return;
                    }
                    setStep(3);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Date & Time */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-purple-600" />
                Choose Date & Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Reminder */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  Remember: Choose your <strong>trash collection day</strong>. Cans must be empty for cleaning.
                </p>
              </div>
              <div>
                <Label className="mb-2 block">Date</Label>
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setSelectedTime('');
                    }}
                    disabled={disabledDates}
                    fromDate={new Date()}
                    toDate={addDays(new Date(), 60)}
                    className="rounded-lg border"
                  />
                </div>
              </div>
              {selectedDate && (
                <div>
                  <Label className="mb-2 block">
                    Available Time Slots - {format(selectedDate, 'EEEE, MMMM d')}
                  </Label>
                  {availableTimeSlots.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">No available time slots for this date</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {availableTimeSlots.map((slot: string) => (
                        <Button
                          key={slot}
                          variant={selectedTime === slot ? 'default' : 'outline'}
                          onClick={() => setSelectedTime(slot)}
                          className={`${
                            selectedTime === slot
                              ? 'bg-purple-600 hover:bg-purple-700 text-white'
                              : 'hover:border-purple-300'
                          }`}
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          {slot}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button
                  onClick={() => {
                    if (!selectedDate || !selectedTime) {
                      toast.error('Please select a date and time');
                      return;
                    }
                    setStep(4);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Confirm & Pay */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                Confirm & Pay
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-gray-900">Appointment Summary</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-gray-500">Service:</span>
                  <span className="font-medium">{selectedService.name} ({selectedCans} can{selectedCans > 1 ? 's' : ''})</span>
                  <span className="text-gray-500">Total Price:</span>
                  <span className="font-medium text-purple-600">${selectedService.price}</span>
                  <span className="text-gray-500">Address:</span>
                  <span className="font-medium">{fullAddress}</span>
                  <span className="text-gray-500">Phone:</span>
                  <span className="font-medium">{phone}</span>
                  <span className="text-gray-500">Date:</span>
                  <span className="font-medium">{selectedDate && format(selectedDate, 'PPP')}</span>
                  <span className="text-gray-500">Time:</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
              </div>

              {/* Zelle Payment Info */}
              <ZellePaymentCard showSteps />

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(3)} className="gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
                >
                  {submitting ? 'Booking...' : 'Confirm Appointment'}
                  <CheckCircle className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}