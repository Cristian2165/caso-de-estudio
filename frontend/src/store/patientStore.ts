import { create } from 'zustand';
import { Patient, User } from '@/types';
import api from '@/services/api';

// Definimos la estructura de la respuesta del backend para un niño
interface BackendChild {
  id: string; // ID del perfil de niño
  user_id: string; // ID del usuario
  assigned_psychologist: string | null;
  age: number;
  diagnosis: string[];
  parent_email: string;
  preferences: any;
  current_emotion: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar: string | null;
    created_at: string;
    updated_at: string;
  };
}

// Definimos los datos necesarios para crear un paciente desde el formulario
export interface NewPatientData {
  name: string;
  email: string;
  password: string;
  age: number;
  diagnosis: string[];
  parentEmail: string;
}

interface PatientState {
  patients: Patient[];
  loading: boolean;
  fetchPatients: () => Promise<void>;
  addPatient: (patientData: NewPatientData) => Promise<boolean>; // Devuelve true si éxito
  getPatientById: (id: string) => Patient | undefined;
}

// Helper para transformar la respuesta del backend al tipo del frontend
const transformBackendChildToPatient = (child: BackendChild): Patient => {
  return {
    id: child.user.id, // Usamos el ID de usuario como el ID principal en el frontend
    name: child.user.name,
    email: child.user.email,
    role: 'patient',
    avatar: child.user.avatar || undefined,
    createdAt: new Date(child.user.created_at),
    updatedAt: new Date(child.user.updated_at),
    age: child.age,
    diagnosis: child.diagnosis,
    parentEmail: child.parent_email,
    assignedPsychologist: child.assigned_psychologist || '',
    preferences: child.preferences,
    currentEmotion: child.current_emotion as any, // Se puede mejorar el tipado si es necesario
  };
};

export const usePatientStore = create<PatientState>()((set, get) => ({
  patients: [],
  loading: false,

  fetchPatients: async () => {
    set({ loading: true });
    try {
      // 1. Llama al endpoint del backend que devuelve los pacientes del psicólogo
      const backendChildren = await api.get<BackendChild[]>('/psychologists/children');
      
      // 2. Transforma los datos para que coincidan con el tipo `Patient` del frontend
      const patients = backendChildren.map(transformBackendChildToPatient);

      set({ patients, loading: false });
    } catch (error) {
      console.error('Error fetching patients:', error);
      set({ patients: [], loading: false }); // Resetea a un array vacío en caso de error
    }
  },

  addPatient: async (patientData) => {
    set({ loading: true });
    try {
      // Paso 1: Registrar el nuevo usuario con rol 'child'
      const registerResponse = await api.post<{ user: User }>('/auth/register', {
        name: patientData.name,
        email: patientData.email,
        password: patientData.password,
        role: 'child',
        // Pasamos los datos extra que el backend espera en el cuerpo de UserRegister
        age: patientData.age,
        parent_email: patientData.parentEmail,
        diagnosis: patientData.diagnosis,
      });

      const newUserId = registerResponse.user.id;
      if (!newUserId) {
        throw new Error("Registration failed to return a user ID.");
      }

      // Paso 2: Asignar el niño recién creado al psicólogo actual
      await api.post('/psychologists/me/children', { 
        child_user_id: newUserId 
      });

      // Paso 3: Volver a cargar la lista de pacientes para que incluya el nuevo
      await get().fetchPatients();
      
      set({ loading: false });
      return true; // Indica éxito

    } catch (error) {
      console.error('Error adding patient:', error);
      set({ loading: false });
      return false; // Indica fallo
    }
  },

  getPatientById: (id: string) => {
    return get().patients.find(p => p.id === id);
  },
}));