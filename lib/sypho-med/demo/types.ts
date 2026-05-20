/**
 * @file lib/sypho-med/demo/types.ts
 * @description Type definitions for the Sypho Med interactive mock dashboard.
 */

/** Supported global clinic preset identifiers. */
export type ClinicPresetId = 'london' | 'muscat' | 'berlin' | 'amsterdam';

/** Primary navigation views within the mock dashboard. */
export type DemoViewId = 'overview' | 'pipeline' | 'booking' | 'inbox';

/** Kanban pipeline column identifiers. */
export type PipelineColumnId = 'lead' | 'qualified' | 'scheduled' | 'completed';

/** A single card on the CRM pipeline board. */
export interface PipelineCard {
  id: string;
  patientName: string;
  service: string;
  valueLabel: string;
  priority: 'high' | 'normal';
  columnId: PipelineColumnId;
}

/** CRM pipeline column definition. */
export interface PipelineColumn {
  id: PipelineColumnId;
  title: string;
  accent: string;
}

/** Doctor available for booking. */
export interface DemoDoctor {
  id: string;
  name: string;
  specialty: string;
  avatarInitials: string;
}

/** Bookable clinical service. */
export interface DemoService {
  id: string;
  name: string;
  durationMinutes: number;
  priceLabel: string;
}

/** Time slot for appointment booking. */
export interface DemoTimeSlot {
  id: string;
  label: string;
  available: boolean;
}

/** Live activity feed entry. */
export interface DemoActivity {
  id: string;
  message: string;
  time: string;
  category: 'booking' | 'ai' | 'inbox' | 'pipeline';
}

/** Unified inbox conversation thread. */
export interface DemoInboxThread {
  id: string;
  patientName: string;
  preview: string;
  time: string;
  unread: boolean;
  channel: 'whatsapp' | 'sms';
}

/** Message within an inbox thread. */
export interface DemoInboxMessage {
  id: string;
  sender: 'patient' | 'clinic' | 'riley';
  body: string;
  time: string;
}

/** Full clinic preset dataset. */
export interface ClinicPreset {
  id: ClinicPresetId;
  label: string;
  city: string;
  countryCode: string;
  timezone: string;
  currencySymbol: string;
  metrics: {
    bookingsToday: number;
    pipelineValue: string;
    conversionRate: string;
    utilization: string;
  };
  weeklyChart: number[];
  pipelineCards: PipelineCard[];
  doctors: DemoDoctor[];
  services: DemoService[];
  timeSlots: DemoTimeSlot[];
  activities: DemoActivity[];
  inboxThreads: DemoInboxThread[];
  inboxMessages: Record<string, DemoInboxMessage[]>;
  rileySuggestions: string[];
}
