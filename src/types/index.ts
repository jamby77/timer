export interface LapEntry {
  id: string
  lapTime: number
  split?: { number: number; total: number }
  timestamp: number
}
