# CleanCan - App de Citas para Limpieza de Trash Cans

## Design Guidelines

### Design References
- **Modern service booking apps**: Clean, trustworthy, professional
- **Style**: Fresh & Clean + Green/Blue tones + Service-oriented

### Color Palette
- Primary: #10B981 (Emerald Green - main brand)
- Secondary: #059669 (Dark Green - hover/active)
- Accent: #3B82F6 (Blue - info/links)
- Background: #F0FDF4 (Light Green tint)
- Surface: #FFFFFF (White cards)
- Text Primary: #1F2937 (Dark Gray)
- Text Secondary: #6B7280 (Medium Gray)
- Warning: #F59E0B (Amber - pending status)
- Success: #10B981 (Green - confirmed)
- Danger: #EF4444 (Red - cancelled)

### Typography
- Font: Inter (system default from shadcn)
- Headings: font-bold
- Body: font-normal

### Key Component Styles
- Cards: White background, subtle shadow, rounded-xl
- Buttons: Emerald green primary, rounded-lg
- Badges: Colored by status

### Images to Generate
1. **hero-trash-can-cleaning.jpg** - Professional trash can cleaning service, sparkling clean bins, outdoor suburban setting (photorealistic)
2. **clean-service-worker.jpg** - Friendly service worker cleaning trash cans with pressure washer, professional uniform (photorealistic)
3. **before-after-clean.jpg** - Split image showing dirty vs sparkling clean trash can, dramatic difference (photorealistic)
4. **happy-customer-home.jpg** - Happy homeowner in front of clean suburban home with clean trash cans (photorealistic)

---

## Development Tasks

### Files to Create/Modify:

1. **frontend/index.html** - Update title to "CleanCan - Limpieza de Trash Cans"
2. **frontend/src/App.tsx** - Main router with all routes
3. **frontend/src/pages/Index.tsx** - Landing page / home (hero, services, CTA)
4. **frontend/src/pages/BookingPage.tsx** - Booking flow: select service, address, phone, date/time, Zelle payment info
5. **frontend/src/pages/MyAppointments.tsx** - User's appointment history
6. **frontend/src/pages/AdminDashboard.tsx** - Admin panel: view all appointments, confirm payments, manage schedules, set days off
7. **frontend/src/components/Header.tsx** - Navigation header with auth
8. **frontend/src/lib/api.ts** - Already exists, web SDK client

### Database Tables (Created):
- **appointments** - user_id, trash_can_count, service_price, address, phone, appointment_date, appointment_time, payment_status, appointment_status, payment_proof_url, notes, created_at
- **schedules** - day_of_week, time_slot, is_available (seeded with default data)
- **days_off** - date, reason

### Flow:
1. User lands on homepage → clicks "Reservar Cita"
2. Login required → Atoms Cloud Auth
3. Booking form: select 1/2/3 cans → enter address & phone → pick date → pick available time slot → see Zelle payment instructions ($20 deposit) → submit
4. Admin sees new appointment → confirms payment → updates status
5. Admin can manage schedule availability and days off