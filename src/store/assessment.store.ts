import { create } from 'zustand'

interface AssessmentStore {
  isLoading: boolean
  assessmentId: string | null
  error: string | null
  setLoading: (v: boolean) => void
  setAssessmentId: (id: string | null) => void
  setError: (e: string | null) => void
}

export const useAssessmentStore = create<AssessmentStore>(set => ({
  isLoading: false,
  assessmentId: null,
  error: null,
  setLoading: (v) => set({ isLoading: v }),
  setAssessmentId: (id) => set({ assessmentId: id }),
  setError: (e) => set({ error: e }),
}))
