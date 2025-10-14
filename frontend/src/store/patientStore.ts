import { create } from 'zustand';
import { SupabaseService } from '@/services/supabaseService';
import { Patient } from '@/types';
import { useAuthStore } from './authStore';

interface PatientState {
  patients: Patient[];
  loading: boolean;
  fetchPatients: (psychologistId: string) => Promise<void>;
  addPatient: (patientData: Omit<Patient, 'id' | 'role' | 'assignedPsychologist' | 'createdAt' | 'updatedAt'> & {password: string}) => Promise<void>;
  getPatientById: (id: string) => Patient | undefined;
}

export const usePatientStore = create<PatientState>()((set, get) => ({
  patients: [],
  loading: false,
  fetchPatients: async (psychologistId: string) => {
    set({ loading: true });
    try {
      const patients = await SupabaseService.getPatientsForPsychologist(psychologistId);
      set({ patients, loading: false });
    } catch (error) {
      console.error('Error fetching patients:', error);
      set({ loading: false });
    }
  },
  addPatient: async (patientData) => {
    const psychologistId = useAuthStore.getState().user?.id;
    if (!psychologistId) {
      console.error("No psychologist logged in");
      return;
    }

    set({ loading: true });
    try {
      // 1. Create a new user in Supabase auth
      const authData = await SupabaseService.signUp(patientData.email, patientData.password);
      if (!authData.user) throw new Error('Could not create user');
      
      const userId = authData.user.id;

      // 2. Create a new user profile
      const userProfile = {
        id: userId,
        name: patientData.name,
        email: patientData.email,
        role: 'patient',
      };
      await SupabaseService.createUserProfile(userProfile);

      // 3. Create a new child profile
      const childProfile = {
        user_id: userId,
        age: patientData.age,
        diagnosis: patientData.diagnosis,
        parent_email: patientData.parentEmail,
        assigned_psychologist: psychologistId,
        preferences: patientData.preferences,
        current_emotion: 'neutral',
      };
      await SupabaseService.createPatientProfile(childProfile);

      // 4. Fetch the updated list of patients
      await get().fetchPatients(psychologistId);

    } catch (error) {
      console.error('Error adding patient:', error);
    } finally {
      set({ loading: false });
    }
  },
  getPatientById: (id: string) => {
    return get().patients.find(p => p.id === id);
  },
}));
