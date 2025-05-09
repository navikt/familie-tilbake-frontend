import { create } from 'zustand';

interface PersonIdentState {
    personIdent: string | undefined;
    setPersonIdent: (personIdent: string | undefined) => void;
}

export const usePersonIdentStore = create<PersonIdentState>(set => ({
    personIdent: undefined,
    setPersonIdent: personIdent => set({ personIdent }),
}));
