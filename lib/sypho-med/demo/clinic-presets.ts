/**
 * @file lib/sypho-med/demo/clinic-presets.ts
 * @description Pre-populated mock data for London, Muscat, Berlin, and Amsterdam clinics.
 */

import type { ClinicPreset, ClinicPresetId } from '@/lib/sypho-med/demo/types';

const PIPELINE_COLUMNS = [
  { id: 'lead' as const, title: 'New leads', accent: 'from-silver-500/20 to-transparent' },
  { id: 'qualified' as const, title: 'Qualified', accent: 'from-neon-500/15 to-transparent' },
  { id: 'scheduled' as const, title: 'Scheduled', accent: 'from-neon-400/20 to-transparent' },
  { id: 'completed' as const, title: 'Completed', accent: 'from-emerald-500/15 to-transparent' },
];

export { PIPELINE_COLUMNS };

const LONDON: ClinicPreset = {
  id: 'london',
  label: 'London',
  city: 'London',
  countryCode: 'GB',
  timezone: 'GMT',
  currencySymbol: '£',
  metrics: {
    bookingsToday: 47,
    pipelineValue: '£128k',
    conversionRate: '34%',
    utilization: '91%',
  },
  weeklyChart: [42, 58, 51, 72, 65, 88, 74],
  pipelineCards: [
    { id: 'l1', patientName: 'Emma Richardson', service: 'Dermatology consult', valueLabel: '£240', priority: 'high', columnId: 'lead' },
    { id: 'l2', patientName: 'James Okonkwo', service: 'MRI follow-up', valueLabel: '£890', priority: 'normal', columnId: 'lead' },
    { id: 'l3', patientName: 'Sophie Laurent', service: 'Aesthetic package', valueLabel: '£1.2k', priority: 'high', columnId: 'qualified' },
    { id: 'l4', patientName: 'Oliver Chen', service: 'GP annual', valueLabel: '£180', priority: 'normal', columnId: 'qualified' },
    { id: 'l5', patientName: 'Amira Hassan', service: 'Cardiology review', valueLabel: '£420', priority: 'normal', columnId: 'scheduled' },
    { id: 'l6', patientName: 'Thomas Wright', service: 'Physio block', valueLabel: '£360', priority: 'normal', columnId: 'completed' },
  ],
  doctors: [
    { id: 'ld1', name: 'Dr. Sarah Mitchell', specialty: 'General Practice', avatarInitials: 'SM' },
    { id: 'ld2', name: 'Dr. James Al-Rashid', specialty: 'Cardiology', avatarInitials: 'JA' },
    { id: 'ld3', name: 'Dr. Elena Vogel', specialty: 'Dermatology', avatarInitials: 'EV' },
  ],
  services: [
    { id: 'ls1', name: 'Consultation', durationMinutes: 30, priceLabel: '£180' },
    { id: 'ls2', name: 'Follow-up', durationMinutes: 15, priceLabel: '£95' },
    { id: 'ls3', name: 'Comprehensive screening', durationMinutes: 60, priceLabel: '£420' },
  ],
  timeSlots: [
    { id: 'lt1', label: '09:00', available: true },
    { id: 'lt2', label: '09:30', available: false },
    { id: 'lt3', label: '10:00', available: true },
    { id: 'lt4', label: '11:00', available: true },
    { id: 'lt5', label: '14:00', available: true },
    { id: 'lt6', label: '15:30', available: false },
    { id: 'lt7', label: '16:00', available: true },
  ],
  activities: [
    { id: 'la1', message: 'Riley confirmed MRI slot via WhatsApp', time: '2m ago', category: 'ai' },
    { id: 'la2', message: 'Dr. Al-Rashid — consultation booked', time: '8m ago', category: 'booking' },
    { id: 'la3', message: 'Emma Richardson moved to Qualified', time: '14m ago', category: 'pipeline' },
    { id: 'la4', message: 'New WhatsApp thread from James Okonkwo', time: '22m ago', category: 'inbox' },
  ],
  inboxThreads: [
    { id: 'lth1', patientName: 'Emma Richardson', preview: 'Yes, Thursday 2pm works perfectly', time: '2m', unread: true, channel: 'whatsapp' },
    { id: 'lth2', patientName: 'James Okonkwo', preview: 'Can I reschedule my MRI?', time: '18m', unread: true, channel: 'whatsapp' },
    { id: 'lth3', patientName: 'Sophie Laurent', preview: 'Thank you — see you then', time: '1h', unread: false, channel: 'whatsapp' },
  ],
  inboxMessages: {
    lth1: [
      { id: 'lm1', sender: 'patient', body: 'Hi, I need to book a dermatology consult', time: '10:42' },
      { id: 'lm2', sender: 'riley', body: 'Hello Emma — I can offer Thursday at 14:00 with Dr. Vogel. Shall I confirm?', time: '10:43' },
      { id: 'lm3', sender: 'patient', body: 'Yes, Thursday 2pm works perfectly', time: '10:44' },
    ],
    lth2: [
      { id: 'lm4', sender: 'patient', body: 'Can I reschedule my MRI?', time: '09:15' },
      { id: 'lm5', sender: 'riley', body: 'Of course, James. I have Friday 11:00 or Monday 09:30 available.', time: '09:16' },
    ],
    lth3: [
      { id: 'lm6', sender: 'patient', body: 'Thank you — see you then', time: 'Yesterday' },
    ],
  },
  rileySuggestions: [
    'Confirm Emma\'s Thursday slot and send prep instructions',
    'Offer James two MRI reschedule options',
    'Follow up with Sophie on aesthetic package deposit',
  ],
};

const MUSCAT: ClinicPreset = {
  id: 'muscat',
  label: 'Muscat',
  city: 'Muscat',
  countryCode: 'OM',
  timezone: 'GST',
  currencySymbol: 'OMR',
  metrics: {
    bookingsToday: 38,
    pipelineValue: 'OMR 48k',
    conversionRate: '41%',
    utilization: '87%',
  },
  weeklyChart: [35, 48, 44, 62, 58, 76, 68],
  pipelineCards: [
    { id: 'm1', patientName: 'Fatima Al-Balushi', service: 'Women\'s health', valueLabel: 'OMR 85', priority: 'high', columnId: 'lead' },
    { id: 'm2', patientName: 'Khalid Al-Hinai', service: 'Executive screening', valueLabel: 'OMR 320', priority: 'high', columnId: 'qualified' },
    { id: 'm3', patientName: 'Layla Al-Saidi', service: 'Dental implant consult', valueLabel: 'OMR 150', priority: 'normal', columnId: 'qualified' },
    { id: 'm4', patientName: 'Youssef Rahman', service: 'Orthopaedic review', valueLabel: 'OMR 95', priority: 'normal', columnId: 'scheduled' },
    { id: 'm5', patientName: 'Noor Al-Zadjali', service: 'Paediatric check-up', valueLabel: 'OMR 65', priority: 'normal', columnId: 'scheduled' },
    { id: 'm6', patientName: 'Hamad Al-Abri', service: 'Lab panel', valueLabel: 'OMR 45', priority: 'normal', columnId: 'completed' },
  ],
  doctors: [
    { id: 'md1', name: 'Dr. Aisha Al-Harthi', specialty: 'Family Medicine', avatarInitials: 'AH' },
    { id: 'md2', name: 'Dr. Omar Al-Farsi', specialty: 'Orthopaedics', avatarInitials: 'OF' },
    { id: 'md3', name: 'Dr. Hana Al-Rashdi', specialty: 'Dentistry', avatarInitials: 'HR' },
  ],
  services: [
    { id: 'ms1', name: 'Consultation', durationMinutes: 30, priceLabel: 'OMR 35' },
    { id: 'ms2', name: 'Executive health screen', durationMinutes: 90, priceLabel: 'OMR 320' },
    { id: 'ms3', name: 'Follow-up visit', durationMinutes: 20, priceLabel: 'OMR 25' },
  ],
  timeSlots: [
    { id: 'mt1', label: '08:00', available: true },
    { id: 'mt2', label: '09:00', available: true },
    { id: 'mt3', label: '10:30', available: false },
    { id: 'mt4', label: '11:30', available: true },
    { id: 'mt5', label: '14:00', available: true },
    { id: 'mt6', label: '16:30', available: true },
  ],
  activities: [
    { id: 'ma1', message: 'Riley booked executive screen for Khalid', time: '5m ago', category: 'ai' },
    { id: 'ma2', message: 'Fatima added to New leads pipeline', time: '12m ago', category: 'pipeline' },
    { id: 'ma3', message: 'WhatsApp reminder sent — Layla implant consult', time: '25m ago', category: 'inbox' },
    { id: 'ma4', message: 'Dr. Al-Farsi rota updated for Friday', time: '40m ago', category: 'booking' },
  ],
  inboxThreads: [
    { id: 'mth1', patientName: 'Fatima Al-Balushi', preview: 'Is the women\'s health package available?', time: '5m', unread: true, channel: 'whatsapp' },
    { id: 'mth2', patientName: 'Khalid Al-Hinai', preview: 'Confirmed for executive screening', time: '32m', unread: false, channel: 'whatsapp' },
    { id: 'mth3', patientName: 'Layla Al-Saidi', preview: 'Riley: Your implant consult is Tuesday 10:30', time: '1h', unread: false, channel: 'whatsapp' },
  ],
  inboxMessages: {
    mth1: [
      { id: 'mm1', sender: 'patient', body: 'Is the women\'s health package available this week?', time: '11:02' },
      { id: 'mm2', sender: 'riley', body: 'Salam Fatima — yes, Dr. Al-Harthi has Wednesday 09:00. Would you like me to reserve it?', time: '11:03' },
    ],
    mth2: [
      { id: 'mm3', sender: 'riley', body: 'Your executive screening is confirmed for Sunday 08:00.', time: '10:30' },
      { id: 'mm4', sender: 'patient', body: 'Confirmed for executive screening', time: '10:31' },
    ],
    mth3: [
      { id: 'mm5', sender: 'riley', body: 'Your implant consult is Tuesday 10:30 with Dr. Al-Rashdi.', time: 'Yesterday' },
    ],
  },
  rileySuggestions: [
    'Reserve women\'s health slot for Fatima on Wednesday',
    'Send Khalid pre-screen fasting instructions',
    'Request deposit for Layla\'s implant pathway',
  ],
};

const BERLIN: ClinicPreset = {
  id: 'berlin',
  label: 'Berlin',
  city: 'Berlin',
  countryCode: 'DE',
  timezone: 'CET',
  currencySymbol: '€',
  metrics: {
    bookingsToday: 52,
    pipelineValue: '€156k',
    conversionRate: '38%',
    utilization: '94%',
  },
  weeklyChart: [48, 62, 55, 78, 70, 92, 81],
  pipelineCards: [
    { id: 'b1', patientName: 'Lukas Müller', service: 'Orthopädie Erstgespräch', valueLabel: '€195', priority: 'normal', columnId: 'lead' },
    { id: 'b2', patientName: 'Anna Schmidt', service: 'Hautarzt Kontrolle', valueLabel: '€120', priority: 'normal', columnId: 'lead' },
    { id: 'b3', patientName: 'Mehmet Yilmaz', service: 'Kardiologie', valueLabel: '€280', priority: 'high', columnId: 'qualified' },
    { id: 'b4', patientName: 'Clara Weber', service: 'Physiotherapie Paket', valueLabel: '€450', priority: 'normal', columnId: 'scheduled' },
    { id: 'b5', patientName: 'Jonas Fischer', service: 'Labor Panel', valueLabel: '€89', priority: 'normal', columnId: 'scheduled' },
    { id: 'b6', patientName: 'Petra Hoffmann', service: 'Allgemeinmedizin', valueLabel: '€95', priority: 'normal', columnId: 'completed' },
  ],
  doctors: [
    { id: 'bd1', name: 'Dr. Klaus Brenner', specialty: 'Allgemeinmedizin', avatarInitials: 'KB' },
    { id: 'bd2', name: 'Dr. Nina Krämer', specialty: 'Dermatologie', avatarInitials: 'NK' },
    { id: 'bd3', name: 'Dr. Stefan Richter', specialty: 'Orthopädie', avatarInitials: 'SR' },
  ],
  services: [
    { id: 'bs1', name: 'Erstgespräch', durationMinutes: 30, priceLabel: '€95' },
    { id: 'bs2', name: 'Folgetermin', durationMinutes: 15, priceLabel: '€65' },
    { id: 'bs3', name: 'Vorsorgeuntersuchung', durationMinutes: 45, priceLabel: '€195' },
  ],
  timeSlots: [
    { id: 'bt1', label: '08:30', available: true },
    { id: 'bt2', label: '09:00', available: true },
    { id: 'bt3', label: '10:00', available: false },
    { id: 'bt4', label: '11:30', available: true },
    { id: 'bt5', label: '13:00', available: true },
    { id: 'bt6', label: '15:00', available: true },
    { id: 'bt7', label: '17:00', available: false },
  ],
  activities: [
    { id: 'ba1', message: 'Riley — Mehmet auf Qualifiziert verschoben', time: '3m ago', category: 'pipeline' },
    { id: 'ba2', message: 'Dr. Krämer — Termin um 11:30 gebucht', time: '11m ago', category: 'booking' },
    { id: 'ba3', message: 'Anna Schmidt via WhatsApp kontaktiert', time: '19m ago', category: 'inbox' },
    { id: 'ba4', message: 'Autonomer Workflow: Erinnerungen versendet', time: '35m ago', category: 'ai' },
  ],
  inboxThreads: [
    { id: 'bth1', patientName: 'Anna Schmidt', preview: 'Kann ich auf Donnerstag verschieben?', time: '8m', unread: true, channel: 'whatsapp' },
    { id: 'bth2', patientName: 'Mehmet Yilmaz', preview: 'Danke, der Termin passt', time: '45m', unread: false, channel: 'whatsapp' },
    { id: 'bth3', patientName: 'Lukas Müller', preview: 'Riley: Orthopädie Slots verfügbar', time: '2h', unread: false, channel: 'whatsapp' },
  ],
  inboxMessages: {
    bth1: [
      { id: 'bm1', sender: 'patient', body: 'Kann ich auf Donnerstag verschieben?', time: '14:20' },
      { id: 'bm2', sender: 'riley', body: 'Guten Tag Anna — Donnerstag 14:30 bei Dr. Krämer ist frei. Soll ich buchen?', time: '14:21' },
    ],
    bth2: [
      { id: 'bm3', sender: 'patient', body: 'Danke, der Termin passt', time: '13:00' },
    ],
    bth3: [
      { id: 'bm4', sender: 'riley', body: 'Lukas, Dr. Richter hat Montag 09:00 und Dienstag 15:00 frei.', time: 'Yesterday' },
    ],
  },
  rileySuggestions: [
    'Donnerstag 14:30 für Anna bestätigen',
    'Mehmet Kardiologie-Unterlagen vorbereiten',
    'Lukas Orthopädie-Slot nachfassen',
  ],
};

const AMSTERDAM: ClinicPreset = {
  id: 'amsterdam',
  label: 'Amsterdam',
  city: 'Amsterdam',
  countryCode: 'NL',
  timezone: 'CET',
  currencySymbol: '€',
  metrics: {
    bookingsToday: 44,
    pipelineValue: '€142k',
    conversionRate: '36%',
    utilization: '89%',
  },
  weeklyChart: [44, 55, 49, 68, 63, 85, 72],
  pipelineCards: [
    { id: 'a1', patientName: 'Sophie van Dijk', service: 'Huisarts consult', valueLabel: '€85', priority: 'normal', columnId: 'lead' },
    { id: 'a2', patientName: 'Mohammed El Amrani', service: 'Fysiotherapie', valueLabel: '€220', priority: 'high', columnId: 'lead' },
    { id: 'a3', patientName: 'Lisa de Vries', service: 'Huidtherapie', valueLabel: '€140', priority: 'normal', columnId: 'qualified' },
    { id: 'a4', patientName: 'Pieter Jansen', service: 'Cardiologie', valueLabel: '€265', priority: 'normal', columnId: 'scheduled' },
    { id: 'a5', patientName: 'Eva Bakker', service: 'Preventief pakket', valueLabel: '€380', priority: 'high', columnId: 'scheduled' },
    { id: 'a6', patientName: 'Tim Visser', service: 'Lab follow-up', valueLabel: '€75', priority: 'normal', columnId: 'completed' },
  ],
  doctors: [
    { id: 'ad1', name: 'Dr. Marieke de Boer', specialty: 'Huisartsgeneeskunde', avatarInitials: 'MB' },
    { id: 'ad2', name: 'Dr. Raj Patel', specialty: 'Cardiologie', avatarInitials: 'RP' },
    { id: 'ad3', name: 'Dr. Fleur van Berg', specialty: 'Dermatologie', avatarInitials: 'FB' },
  ],
  services: [
    { id: 'as1', name: 'Consult', durationMinutes: 25, priceLabel: '€85' },
    { id: 'as2', name: 'Vervolgafspraak', durationMinutes: 15, priceLabel: '€55' },
    { id: 'as3', name: 'Preventiepakket', durationMinutes: 50, priceLabel: '€380' },
  ],
  timeSlots: [
    { id: 'at1', label: '09:00', available: true },
    { id: 'at2', label: '09:45', available: true },
    { id: 'at3', label: '10:30', available: false },
    { id: 'at4', label: '13:15', available: true },
    { id: 'at5', label: '14:00', available: true },
    { id: 'at6', label: '16:45', available: true },
  ],
  activities: [
    { id: 'aa1', message: 'Riley booked preventief pakket for Eva', time: '4m ago', category: 'ai' },
    { id: 'aa2', message: 'Mohammed moved to Qualified', time: '16m ago', category: 'pipeline' },
    { id: 'aa3', message: 'Pieter cardiologie — bevestiging verzonden', time: '28m ago', category: 'booking' },
    { id: 'aa4', message: 'Nieuw WhatsApp-gesprek: Sophie van Dijk', time: '50m ago', category: 'inbox' },
  ],
  inboxThreads: [
    { id: 'ath1', patientName: 'Sophie van Dijk', preview: 'Huisarts consult volgende week?', time: '6m', unread: true, channel: 'whatsapp' },
    { id: 'ath2', patientName: 'Mohammed El Amrani', preview: 'Fysio pakket — akkoord', time: '22m', unread: false, channel: 'whatsapp' },
    { id: 'ath3', patientName: 'Eva Bakker', preview: 'Riley: Preventie ingepland', time: '1h', unread: false, channel: 'whatsapp' },
  ],
  inboxMessages: {
    ath1: [
      { id: 'am1', sender: 'patient', body: 'Huisarts consult volgende week mogelijk?', time: '15:10' },
      { id: 'am2', sender: 'riley', body: 'Hoi Sophie — dinsdag 10:00 bij Dr. de Boer is beschikbaar.', time: '15:11' },
    ],
    ath2: [
      { id: 'am3', sender: 'patient', body: 'Fysio pakket — akkoord', time: '14:40' },
    ],
    ath3: [
      { id: 'am4', sender: 'riley', body: 'Eva, je preventiepakket staat op vrijdag 09:00.', time: 'Yesterday' },
    ],
  },
  rileySuggestions: [
    'Bevestig huisarts-slot voor Sophie op dinsdag',
    'Stuur Mohammed fysio-oefenplan',
    'Vraag Eva om intake-formulier',
  ],
};

/** All clinic presets keyed by id. */
export const CLINIC_PRESETS: Record<ClinicPresetId, ClinicPreset> = {
  london: LONDON,
  muscat: MUSCAT,
  berlin: BERLIN,
  amsterdam: AMSTERDAM,
};

/** Ordered list for preset switcher UI. */
export const CLINIC_PRESET_ORDER: ClinicPresetId[] = [
  'london',
  'muscat',
  'berlin',
  'amsterdam',
];

/**
 * Returns a clinic preset by id.
 */
export function getClinicPreset(id: ClinicPresetId): ClinicPreset {
  return CLINIC_PRESETS[id];
}
