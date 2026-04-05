import { create } from 'zustand'

interface JourneyStore {
  currentSemester: number
  setCurrentSemester: (n: number) => void
}

export const useJourneyStore = create<JourneyStore>(set => ({
  currentSemester: 1,
  setCurrentSemester: (n) => set({ currentSemester: n }),
}))
