import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Sparkles, Clock, DollarSign, CheckCircle, Star } from 'lucide-react';
import { SERVICE_OPTIONS } from '@/lib/services';

const HERO_IMG = 'https://mgx-backend-cdn.metadl.com/generate/images/889995/2026-02-18/f8a715c8-a182-4fc8-8a13-48e0610f584f.png';
const WORKER_IMG = 'https://mgx-backend-cdn.metadl.com/generate/images/889995/2026-02-18/00133a9f-ea3c-431a-bed6-b00f8c977c6b.png';
const CLEAN_BIN_IMG = 'https://mgx-backend-cdn.metadl.com/generate/images/889995/2026-02-18/a34fa6be-8b81-4d14-8a18-c748b6d7980b.png';
const HAPPY_IMG = 'https://mgx-backend-cdn.metadl.com/generate/images/889995/2026-02-18/c8c3d70c-07f1-485b-a4b9-447d3334dc69.png';

const services = SERVICE_OPTIONS;

export default function IndexPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Professional Cleaning Service
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Your Trash Cans <span className="text-purple-600">Like New</span> in Minutes
              </h1>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/booking')}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-6 rounded-xl shadow-lg shadow-purple-200"
                >
                  Book Appointment
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-lg px-8 py-6 rounded-xl border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  View Pricing
                </Button>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-600">100% Guaranteed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-600">Flexible Scheduling</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src={HERO_IMG}
                alt="Trash can cleaning service"
                className="rounded-2xl shadow-2xl w-full object-cover aspect-video"
              />
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">4.9/5</p>
                  <p className="text-xs text-gray-500">200+ happy customers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services / Pricing */}
      <section id="services" className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose how many trash cans you need cleaned. Fair and transparent pricing.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {services.map((s) => (
              <Card
                key={s.cans}
                className={`relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer ${
                  s.popular ? 'border-2 border-purple-500 shadow-lg' : 'border border-gray-200'
                }`}
                onClick={() => navigate(`/booking?cans=${s.cans}`)}
              >
                {s.popular && (
                  <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    POPULAR
                  </div>
                )}
                <CardContent className="p-8 text-center space-y-4">
                  <div className="flex justify-center">
                    {Array.from({ length: s.cans }).map((_, i) => (
                      <Trash2 key={i} className="w-8 h-8 text-purple-600 mx-1" />
                    ))}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{s.name}</h3>
                  <p className="text-sm text-gray-500">{s.description}</p>
                  <div className="text-4xl font-bold text-purple-600">${s.price}</div>
                  <p className="text-sm text-gray-500">per service</p>
                  <Button
                    className={`w-full rounded-lg ${
                      s.popular
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-gray-100 hover:bg-purple-50 text-purple-700'
                    }`}
                  >
                    Book Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-gray-500 flex items-center justify-center gap-2">
              <DollarSign className="w-4 h-4" />
              $20 deposit via Zelle to confirm your appointment
            </p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Booking is easy, fast, and secure</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Choose Your Service', desc: 'Select how many trash cans you want cleaned' },
              { step: '2', title: 'Schedule Your Appointment', desc: 'Enter your address and pick an available time slot' },
              { step: '3', title: 'Pay the Deposit', desc: 'Send $20 via Zelle to confirm' },
              { step: '4', title: 'All Done!', desc: 'We confirm your appointment and arrive on time' },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-3">
                <div className="w-14 h-14 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Our Work</h2>
            <p className="text-lg text-gray-600">Results that speak for themselves</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <img src={WORKER_IMG} alt="Worker cleaning" className="rounded-xl shadow-lg w-full object-cover aspect-video" />
            <img src={CLEAN_BIN_IMG} alt="Clean residential trash can" className="rounded-xl shadow-lg w-full object-cover aspect-video" />
            <img src={HAPPY_IMG} alt="Happy customer" className="rounded-xl shadow-lg w-full object-cover aspect-video" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Ready for Spotless Trash Cans?</h2>
          <p className="text-gray-600 text-lg">Book your appointment now and enjoy professional service.</p>
          <Button
            size="lg"
            onClick={() => navigate('/booking')}
            className="bg-purple-600 text-white hover:bg-purple-700 text-lg px-10 py-6 rounded-xl shadow-lg"
          >
            Book My Appointment
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-gray-500 py-10 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <img src="/assets/likenew-logo.png" alt="LikeNew Logo" className="w-8 h-8 rounded-lg object-cover" />
            <span className="text-lg font-bold text-gray-900">LikeNew</span>
          </div>
          <p className="text-sm">© 2026 LikeNew. All rights reserved.</p>
          <p className="text-sm">Professional trash can cleaning service</p>
        </div>
      </footer>
    </div>
  );
}