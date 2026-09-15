import {
  ALARM_DEFS,
  emptyAlarmConfig,
  type AlarmConfig,
  type AlarmType,
  type CompulsoryKey,
  type DoxologyData,
  type DoxologyUser,
  type UserAlarmSettings,
} from "./types"

const DEFAULT_TIMES: Record<AlarmType, string> = {
  tahajjud: "03:30",
  fajr: "05:00",
  dhuhr: "12:30",
  asr: "15:45",
  maghrib: "18:15",
  isha: "20:00",
  morning_adhkar: "06:30",
  evening_adhkar: "18:45",
  before_sleep: "22:30",
}

function buildDefaults(): UserAlarmSettings {
  const out = {} as UserAlarmSettings
  ALARM_DEFS.forEach((d) => {
    out[d.type] = emptyAlarmConfig({
      time: DEFAULT_TIMES[d.type],
      preAlert30: d.salah,
    })
  })
  // Tahajjud is optional — default off
  out.tahajjud = { ...out.tahajjud, enabled: false }
  return out
}

const SEED_USERS: { name: string; email: string; enrolled: boolean; comp: Record<CompulsoryKey, boolean> }[] = [
  { name: "Aisha Rahman", email: "aisha.r@gate.app", enrolled: true, comp: { salah: true, tahajjud: true, morning_adhkar: true, evening_adhkar: true, before_sleep: true } },
  { name: "Yusuf Khan", email: "yusuf.k@gate.app", enrolled: true, comp: { salah: true, tahajjud: false, morning_adhkar: false, evening_adhkar: true, before_sleep: false } },
  { name: "Maryam Ali", email: "maryam.a@gate.app", enrolled: true, comp: { salah: true, tahajjud: true, morning_adhkar: true, evening_adhkar: false, before_sleep: true } },
  { name: "Omar Farooq", email: "omar.f@gate.app", enrolled: true, comp: { salah: false, tahajjud: false, morning_adhkar: false, evening_adhkar: false, before_sleep: false } },
  { name: "Fatima Noor", email: "fatima.n@gate.app", enrolled: true, comp: { salah: true, tahajjud: true, morning_adhkar: true, evening_adhkar: true, before_sleep: true } },
  { name: "Ibrahim Siddiq", email: "ibrahim.s@gate.app", enrolled: false, comp: { salah: false, tahajjud: false, morning_adhkar: false, evening_adhkar: false, before_sleep: false } },
  { name: "Khadija Begum", email: "khadija.b@gate.app", enrolled: true, comp: { salah: true, tahajjud: false, morning_adhkar: true, evening_adhkar: true, before_sleep: false } },
  { name: "Hassan Farid", email: "hassan.f@gate.app", enrolled: true, comp: { salah: true, tahajjud: true, morning_adhkar: false, evening_adhkar: true, before_sleep: true } },
]

function makeUser(i: number, u: (typeof SEED_USERS)[number]): DoxologyUser {
  const alarmSettings = buildDefaults()
  // personalize a couple of times slightly
  const jitter: Partial<Record<AlarmType, string>> = {
    fajr: ["04:50", "05:10", "05:00", "04:45"][i % 4],
    morning_adhkar: ["06:15", "06:45", "06:30", "07:00"][i % 4],
  }
  ;(Object.keys(jitter) as AlarmType[]).forEach((k) => {
    alarmSettings[k] = { ...alarmSettings[k], time: jitter[k]! }
  })
  if (!u.enrolled) {
    // unenrolled users have alarms off
    ;(Object.keys(alarmSettings) as AlarmType[]).forEach((k) => {
      alarmSettings[k] = { ...alarmSettings[k], enabled: false }
    })
  }
  return {
    id: `dox_${i + 1}`,
    name: u.name,
    email: u.email,
    initials: u.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase(),
    enrolled: u.enrolled,
    alarmSettings,
    completionToday: { ...u.comp },
  }
}

export function buildDoxologySeed(): DoxologyData {
  return {
    users: SEED_USERS.map((u, i) => makeUser(i, u)),
    defaults: {
      settings: buildDefaults(),
      notes: "Default reminder times use local device time. 30-minute pre-Salah alerts apply to the five Fard prayers. All audio must be from authentic, approved sources.",
    },
    audio: [
      { id: "aud_1", name: "Makkah Adhan (Fajr)", category: "adhan", source: "Approved recording — verified chain", url: "", updatedAt: new Date().toISOString(), isDefault: true },
      { id: "aud_2", name: "Evening Dhikr Reminder", category: "dhikr", source: "Approved — derived from authentic supplications", url: "", updatedAt: new Date().toISOString(), isDefault: false },
    ],
  }
}
