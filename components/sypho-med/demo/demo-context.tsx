/**
 * @file components/sypho-med/demo/demo-context.tsx
 * @description Encapsulated local React state for the interactive mock dashboard.
 */

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  CLINIC_PRESET_ORDER,
  getClinicPreset,
} from '@/lib/sypho-med/demo/clinic-presets';
import type {
  ClinicPresetId,
  DemoActivity,
  DemoInboxMessage,
  DemoViewId,
  PipelineCard,
  PipelineColumnId,
} from '@/lib/sypho-med/demo/types';

export interface DemoContextValue {
  clinicId: ClinicPresetId;
  preset: ReturnType<typeof getClinicPreset>;
  activeView: DemoViewId;
  pipelineCards: PipelineCard[];
  selectedDoctorId: string | null;
  selectedServiceId: string | null;
  selectedSlotId: string | null;
  bookingStep: number;
  bookingConfirmed: boolean;
  selectedThreadId: string | null;
  localActivities: DemoActivity[];
  localMessages: Record<string, DemoInboxMessage[]>;
  setClinicId: (id: ClinicPresetId) => void;
  setActiveView: (view: DemoViewId) => void;
  movePipelineCard: (cardId: string, toColumnId: PipelineColumnId) => void;
  setSelectedDoctorId: (id: string | null) => void;
  setSelectedServiceId: (id: string | null) => void;
  setSelectedSlotId: (id: string | null) => void;
  setBookingStep: (step: number) => void;
  confirmBooking: () => void;
  resetBooking: () => void;
  setSelectedThreadId: (id: string | null) => void;
  sendInboxReply: (threadId: string, body: string) => void;
  applyRileySuggestion: (index: number) => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

function clonePipelineFromPreset(clinicId: ClinicPresetId): PipelineCard[] {
  return getClinicPreset(clinicId).pipelineCards.map((card) => ({ ...card }));
}

function cloneMessagesFromPreset(
  clinicId: ClinicPresetId,
): Record<string, DemoInboxMessage[]> {
  const preset = getClinicPreset(clinicId);
  const out: Record<string, DemoInboxMessage[]> = {};
  for (const [threadId, messages] of Object.entries(preset.inboxMessages)) {
    out[threadId] = messages.map((m) => ({ ...m }));
  }
  return out;
}

export interface DemoProviderProps {
  children: ReactNode;
}

/**
 * Provides all mock dashboard state — no external data sources.
 */
export function DemoProvider({ children }: DemoProviderProps) {
  const [clinicId, setClinicIdState] = useState<ClinicPresetId>('london');
  const [activeView, setActiveView] = useState<DemoViewId>('overview');
  const [pipelineCards, setPipelineCards] = useState<PipelineCard[]>(() =>
    clonePipelineFromPreset('london'),
  );
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(
    () => getClinicPreset('london').doctors[0]?.id ?? null,
  );
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    () => getClinicPreset('london').services[0]?.id ?? null,
  );
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(
    () => getClinicPreset('london').inboxThreads[0]?.id ?? null,
  );
  const [localActivities, setLocalActivities] = useState<DemoActivity[]>([]);
  const [localMessages, setLocalMessages] = useState<Record<string, DemoInboxMessage[]>>(
    () => cloneMessagesFromPreset('london'),
  );

  const preset = useMemo(() => getClinicPreset(clinicId), [clinicId]);

  const resetBookingState = useCallback((id: ClinicPresetId) => {
    const p = getClinicPreset(id);
    setSelectedDoctorId(p.doctors[0]?.id ?? null);
    setSelectedServiceId(p.services[0]?.id ?? null);
    setSelectedSlotId(null);
    setBookingStep(1);
    setBookingConfirmed(false);
  }, []);

  const setClinicId = useCallback(
    (id: ClinicPresetId) => {
      if (id === clinicId) return;
      const next = getClinicPreset(id);
      setClinicIdState(id);
      setPipelineCards(clonePipelineFromPreset(id));
      setLocalActivities([]);
      setLocalMessages(cloneMessagesFromPreset(id));
      setSelectedThreadId(next.inboxThreads[0]?.id ?? null);
      resetBookingState(id);
    },
    [clinicId, resetBookingState],
  );

  const movePipelineCard = useCallback(
    (cardId: string, toColumnId: PipelineColumnId) => {
      setPipelineCards((prev) =>
        prev.map((card) =>
          card.id === cardId ? { ...card, columnId: toColumnId } : card,
        ),
      );
      const card = pipelineCards.find((c) => c.id === cardId);
      if (card) {
        const activity: DemoActivity = {
          id: `act-${Date.now()}`,
          message: `${card.patientName} moved to ${toColumnId}`,
          time: 'Just now',
          category: 'pipeline',
        };
        setLocalActivities((prev) => [activity, ...prev].slice(0, 8));
      }
    },
    [pipelineCards],
  );

  const confirmBooking = useCallback(() => {
    setBookingConfirmed(true);
    setBookingStep(4);
    const doctor = preset.doctors.find((d) => d.id === selectedDoctorId);
    const service = preset.services.find((s) => s.id === selectedServiceId);
    const slot = preset.timeSlots.find((t) => t.id === selectedSlotId);
    if (doctor && service && slot) {
      const activity: DemoActivity = {
        id: `book-${Date.now()}`,
        message: `Booked ${service.name} with ${doctor.name} at ${slot.label}`,
        time: 'Just now',
        category: 'booking',
      };
      setLocalActivities((prev) => [activity, ...prev].slice(0, 8));
    }
  }, [preset, selectedDoctorId, selectedServiceId, selectedSlotId]);

  const resetBooking = useCallback(() => {
    resetBookingState(clinicId);
  }, [clinicId, resetBookingState]);

  const sendInboxReply = useCallback((threadId: string, body: string) => {
    const trimmed = body.trim();
    if (!trimmed) return;
    const msg: DemoInboxMessage = {
      id: `msg-${Date.now()}`,
      sender: 'clinic',
      body: trimmed,
      time: 'Now',
    };
    setLocalMessages((prev) => ({
      ...prev,
      [threadId]: [...(prev[threadId] ?? []), msg],
    }));
    const activity: DemoActivity = {
      id: `inbox-${Date.now()}`,
      message: 'Reply sent via unified inbox',
      time: 'Just now',
      category: 'inbox',
    };
    setLocalActivities((prev) => [activity, ...prev].slice(0, 8));
  }, []);

  const applyRileySuggestion = useCallback(
    (index: number) => {
      const suggestion = preset.rileySuggestions[index];
      if (!suggestion) return;
      const activity: DemoActivity = {
        id: `riley-${Date.now()}`,
        message: `Riley: ${suggestion}`,
        time: 'Just now',
        category: 'ai',
      };
      setLocalActivities((prev) => [activity, ...prev].slice(0, 8));
    },
    [preset.rileySuggestions],
  );

  const value = useMemo<DemoContextValue>(
    () => ({
      clinicId,
      preset,
      activeView,
      pipelineCards,
      selectedDoctorId,
      selectedServiceId,
      selectedSlotId,
      bookingStep,
      bookingConfirmed,
      selectedThreadId,
      localActivities,
      localMessages,
      setClinicId,
      setActiveView,
      movePipelineCard,
      setSelectedDoctorId,
      setSelectedServiceId,
      setSelectedSlotId,
      setBookingStep,
      confirmBooking,
      resetBooking,
      setSelectedThreadId,
      sendInboxReply,
      applyRileySuggestion,
    }),
    [
      clinicId,
      preset,
      activeView,
      pipelineCards,
      selectedDoctorId,
      selectedServiceId,
      selectedSlotId,
      bookingStep,
      bookingConfirmed,
      selectedThreadId,
      localActivities,
      localMessages,
      setClinicId,
      movePipelineCard,
      confirmBooking,
      resetBooking,
      sendInboxReply,
      applyRileySuggestion,
    ],
  );

  return (
    <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
  );
}

/**
 * Access mock dashboard state. Must be used within `DemoProvider`.
 */
export function useDemo(): DemoContextValue {
  const ctx = useContext(DemoContext);
  if (!ctx) {
    throw new Error('useDemo must be used within DemoProvider');
  }
  return ctx;
}

/** Clinic preset ids for external use. */
export { CLINIC_PRESET_ORDER };
