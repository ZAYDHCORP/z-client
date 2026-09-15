import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { buildDoxologySeed } from "./seed"
import {
  ALARM_DEFS,
  type AlarmConfig,
  type AlarmType,
  type AudioEntry,
  type DoxologyData,
} from "./types"

const STORAGE_KEY = "doxology_admin_state_v1"

function initialData(): DoxologyData {
  return buildDoxologySeed()
}

interface DoxologyContextValue {
  data: DoxologyData
  mounted: boolean
  resetData: () => void
  updateUserAlarm: (userId: string, type: AlarmType, patch: Partial<AlarmConfig>) => void
  resetUserAlarm: (userId: string, type: AlarmType) => void
  resetUserAlarms: (userId: string) => void
  toggleEnrolled: (userId: string) => void
  updateDefaults: (type: AlarmType, patch: Partial<AlarmConfig>) => void
  setDefaultAudio: (id: string) => void
  addAudio: (a: AudioEntry) => void
  updateAudio: (id: string, patch: Partial<AudioEntry>) => void
  removeAudio: (id: string) => void
}

const Ctx = createContext<DoxologyContextValue | null>(null)

export function useDoxology(): DoxologyContextValue {
  const v = useContext(Ctx)
  if (!v) throw new Error("useDoxology must be used within DoxologyProvider")
  return v
}

let seq = 0
const uid = (p: string) => `${p}_${Date.now().toString(36)}_${(++seq).toString(36)}`

export function DoxologyProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DoxologyData>(initialData)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as DoxologyData
        if (parsed && parsed.users) setData(parsed)
      }
    } catch {
      /* ignore */
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      } catch {
        /* ignore */
      }
    }
  }, [data, mounted])

  const value = useMemo<DoxologyContextValue>(() => {
    const set = (patch: Partial<DoxologyData>) => setData((d) => ({ ...d, ...patch }))
    const mapUser = (userId: string, fn: (u: DoxologyData["users"][number]) => DoxologyData["users"][number]) =>
      set({ users: data.users.map((u) => (u.id === userId ? fn(u) : u)) })

    return {
      data,
      mounted,
      resetData: () => setData(initialData()),
      updateUserAlarm: (userId, type, patch) => {
        // "Use default" (null) resolves to the current library default audio
        const resolvedAudioId =
          patch.audioId === null
            ? data.audio.find((a) => a.isDefault)?.id ?? null
            : patch.audioId
        mapUser(userId, (u) => ({
          ...u,
          alarmSettings: {
            ...u.alarmSettings,
            [type]: { ...u.alarmSettings[type], ...patch, audioId: resolvedAudioId },
          },
        }))
      },
      setDefaultAudio: (id) =>
        set({
          audio: data.audio.map((a) => ({ ...a, isDefault: a.id === id })),
          users: data.users.map((u) => ({
            ...u,
            alarmSettings: Object.fromEntries(
              (Object.keys(u.alarmSettings) as AlarmType[]).map((k) => {
                const cfg = u.alarmSettings[k]
                return [k, cfg.audioId === null ? { ...cfg, audioId: id } : cfg]
              }),
            ) as DoxologyData["users"][number]["alarmSettings"],
          })),
        }),
      resetUserAlarm: (userId, type) =>
        mapUser(userId, (u) => ({
          ...u,
          alarmSettings: { ...u.alarmSettings, [type]: { ...data.defaults.settings[type] } },
        })),
      resetUserAlarms: (userId) =>
        mapUser(userId, (u) => ({
          ...u,
          alarmSettings: JSON.parse(JSON.stringify(data.defaults.settings)),
        })),
      toggleEnrolled: (userId) => mapUser(userId, (u) => ({ ...u, enrolled: !u.enrolled })),
      updateDefaults: (type, patch) =>
        set({
          defaults: {
            ...data.defaults,
            settings: { ...data.defaults.settings, [type]: { ...data.defaults.settings[type], ...patch } },
          },
        }),
      addAudio: (a) => set({ audio: [a, ...data.audio] }),
      updateAudio: (id, patch) => set({ audio: data.audio.map((x) => (x.id === id ? { ...x, ...patch } : x)) }),
      removeAudio: (id) =>
        set({
          audio: data.audio.filter((x) => x.id !== id),
          users: data.audio.some((x) => x.id === id && x.isDefault)
            ? data.users.map((u) => ({
                ...u,
                alarmSettings: Object.fromEntries(
                  (Object.keys(u.alarmSettings) as AlarmType[]).map((k) => {
                    const cfg = u.alarmSettings[k]
                    return [k, cfg.audioId === id ? { ...cfg, audioId: null } : cfg]
                  }),
                ) as DoxologyData["users"][number]["alarmSettings"],
              }))
            : data.users,
        }),
    }
  }, [data, mounted])

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
          <span className="text-sm">Loading Doxology Alarms…</span>
        </div>
      </div>
    )
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
