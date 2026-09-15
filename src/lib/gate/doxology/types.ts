export type AlarmType =
  | "tahajjud"
  | "fajr"
  | "dhuhr"
  | "asr"
  | "maghrib"
  | "isha"
  | "morning_adhkar"
  | "evening_adhkar"
  | "before_sleep"

export interface AlarmConfig {
  enabled: boolean
  time: string // "HH:MM"
  audioId: string | null
  preAlert30: boolean // 30-minute pre-Salah alert (Salah only)
}

export type UserAlarmSettings = Record<AlarmType, AlarmConfig>

export type CompulsoryKey =
  | "salah"
  | "tahajjud"
  | "morning_adhkar"
  | "evening_adhkar"
  | "before_sleep"

export interface DoxologyUser {
  id: string
  name: string
  email: string
  initials: string
  enrolled: boolean
  alarmSettings: UserAlarmSettings
  /** Auto-recorded from actual daily activity. Read-only. */
  completionToday: Record<CompulsoryKey, boolean>
}

export interface AudioEntry {
  id: string
  name: string
  category: "adhan" | "dhikr" | "reminder"
  source: string // authentic, approved source note
  url: string // data URL or remote
  isDefault: boolean
  updatedAt: string
}

export interface DoxologyDefaults {
  settings: UserAlarmSettings
  notes: string
}

export interface DoxologyData {
  users: DoxologyUser[]
  defaults: DoxologyDefaults
  audio: AudioEntry[]
}

export interface AlarmDef {
  type: AlarmType
  label: string
  salah: boolean
  note: string
}

export const ALARM_DEFS: AlarmDef[] = [
  { type: "tahajjud", label: "Tahajjud", salah: false, note: "Optional night prayer" },
  { type: "fajr", label: "Fajr", salah: true, note: "Fard" },
  { type: "dhuhr", label: "Dhuhr", salah: true, note: "Fard" },
  { type: "asr", label: "Asr", salah: true, note: "Fard" },
  { type: "maghrib", label: "Maghrib", salah: true, note: "Fard" },
  { type: "isha", label: "Isha", salah: true, note: "Fard" },
  { type: "morning_adhkar", label: "Morning Adhkar", salah: false, note: "Compulsory" },
  { type: "evening_adhkar", label: "Evening Adhkar", salah: false, note: "Compulsory" },
  { type: "before_sleep", label: "Before Sleep Adhkar", salah: false, note: "Compulsory" },
]

export const COMPULSORY: { key: CompulsoryKey; label: string }[] = [
  { key: "salah", label: "5 Fard Salah" },
  { key: "tahajjud", label: "Tahajjud" },
  { key: "morning_adhkar", label: "Morning Adhkar" },
  { key: "evening_adhkar", label: "Evening Adhkar" },
  { key: "before_sleep", label: "Before Sleep Adhkar" },
]

export function emptyAlarmConfig(over: Partial<AlarmConfig> = {}): AlarmConfig {
  return { enabled: true, time: "05:00", audioId: null, preAlert30: false, ...over }
}
