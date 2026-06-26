import { create } from "zustand";
import { format } from "date-fns";

interface FilterState {
  currentMonth: string;
  setCurrentMonth: (month: string) => void;
}

export const useFilterStore = create<FilterState>()((set) => ({
  currentMonth: format(new Date(), "yyyy-MM"),
  setCurrentMonth: (month) => set({ currentMonth: month }),
}));
