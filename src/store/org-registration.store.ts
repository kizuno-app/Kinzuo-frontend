import { create } from 'zustand';

interface OrgRegistrationState {
  // Step 2: Admin Details
  adminName: string;
  adminPhone: string;
  officialEmail: string;
  proofFileUrl: string;
  
  // Step 3: Org Details
  name: string;
  type: string;
  description: string;
  website: string;
  location: string;
  logoFile: File | null;
  
  // Step 4: Domain & Scale
  domains: string[];
  expectedUsers: number | '';
  orgAccountUsername: string;
  orgAccountName: string;
  logoUrl: string;
  
  // Step 5: Review
  reviewed: boolean;
  
  // Form Navigation
  currentStep: number;
  
  // Actions
  setField: (field: keyof OrgRegistrationState, value: any) => void;
  nextStep: () => void;
  prevStep: () => void;
  addDomain: (domain: string) => void;
  removeDomain: (domain: string) => void;
  reset: () => void;
}

const initialState: Omit<OrgRegistrationState, 'setField' | 'nextStep' | 'prevStep' | 'addDomain' | 'removeDomain' | 'reset'> = {
  adminName: '',
  adminPhone: '',
  officialEmail: '',
  proofFileUrl: '',
  name: '',
  type: 'UNIVERSITY',
  description: '',
  website: '',
  location: '',
  logoFile: null,
  domains: [],
  expectedUsers: '',
  orgAccountUsername: '',
  orgAccountName: '',
  logoUrl: '',
  reviewed: false,
  currentStep: 1,
};

export const useOrgRegistrationStore = create<OrgRegistrationState>((set) => ({
  ...initialState,
  
  setField: (field, value) => set((state) => ({ ...state, [field]: value })),
  
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 5) })),
  
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
  
  addDomain: (domain) => set((state) => ({ 
    domains: state.domains.includes(domain) ? state.domains : [...state.domains, domain] 
  })),
  
  removeDomain: (domain) => set((state) => ({ 
    domains: state.domains.filter(d => d !== domain) 
  })),
  
  reset: () => set(initialState),
}));
