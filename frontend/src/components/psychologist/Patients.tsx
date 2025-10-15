
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePatientStore, NewPatientData } from '@/store/patientStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Users, Heart, Brain, Activity, Plus, Search, User, Loader2 } from 'lucide-react';
import { Patient } from '@/types';
import { PatientDetail } from './PatientDetail';

export const PatientsView: React.FC = () => {
  const { patients, fetchPatients, addPatient, loading } = usePatientStore();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [newPatientData, setNewPatientData] = useState<Partial<NewPatientData>>({});
  const [error, setError] = useState<string | null>(null);

  // Cargar los pacientes reales del backend cuando el componente se monta
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleRegisterPatient = async () => {
    setError(null); // Limpiar errores previos
    // Validación simple
    if (!newPatientData.name || !newPatientData.email || !newPatientData.password || !newPatientData.age || !newPatientData.parentEmail) {
      setError('Por favor, complete todos los campos requeridos.');
      return;
    }

    const success = await addPatient(newPatientData as NewPatientData);

    if (success) {
      setShowNewPatientForm(false);
      setNewPatientData({});
    } else {
      setError('Hubo un error al registrar el paciente. Verifique el email e intente de nuevo.');
    }
  };

  if (selectedPatient) {
    return (
      <PatientDetail 
        patient={selectedPatient} 
        onBack={() => setSelectedPatient(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Pacientes</h1>
          <p className="text-gray-600 mt-1">
            {patients.length} pacientes asignados
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Search className="w-4 h-4 mr-2" />
            Buscar
          </Button>
          <Button onClick={() => setShowNewPatientForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Paciente
          </Button>
        </div>
      </div>

      {showNewPatientForm && (
        <Card className="psych-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-green-600" />
              Registrar y Asignar Nuevo Paciente
            </CardTitle>
            <CardDescription>
              Complete la información para crear y asignar un nuevo paciente a su perfil.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  value={newPatientData.name || ''}
                  onChange={(e) => setNewPatientData({...newPatientData, name: e.target.value})}
                  placeholder="Ej: Lucas Martínez"
                />
              </div>
              <div>
                <Label htmlFor="age">Edad</Label>
                <Input
                  id="age"
                  type="number"
                  value={newPatientData.age || ''}
                  onChange={(e) => setNewPatientData({...newPatientData, age: parseInt(e.target.value)})}
                  placeholder="7"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="email">Email del Paciente (para login)</Label>
                    <Input
                    id="email"
                    type="email"
                    value={newPatientData.email || ''}
                    onChange={(e) => setNewPatientData({...newPatientData, email: e.target.value})}
                    placeholder="lucas.martinez@email.com"
                    />
                </div>
                <div>
                    <Label htmlFor="password">Contraseña Temporal</Label>
                    <Input
                    id="password"
                    type="password"
                    value={newPatientData.password || ''}
                    onChange={(e) => setNewPatientData({...newPatientData, password: e.target.value})}
                    placeholder="••••••••"
                    />
                </div>
            </div>
            <div>
              <Label htmlFor="diagnosis">Diagnóstico</Label>
              <Select onValueChange={(value) => setNewPatientData({...newPatientData, diagnosis: [value]})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar diagnóstico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEA Nivel 1">TEA Nivel 1</SelectItem>
                  <SelectItem value="TEA Nivel 2">TEA Nivel 2</SelectItem>
                  <SelectItem value="TEA Nivel 3">TEA Nivel 3</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="parentEmail">Email del padre/madre</Label>
              <Input
                id="parentEmail"
                type="email"
                value={newPatientData.parentEmail || ''}
                onChange={(e) => setNewPatientData({...newPatientData, parentEmail: e.target.value})}
                placeholder="padre@email.com"
              />
            </div>
            
            {error && <p className="text-sm font-medium text-red-500">{error}</p>}

            <div className="flex space-x-2">
              <Button onClick={handleRegisterPatient} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2"/>}
                {loading ? 'Registrando...' : 'Registrar y Asignar'}
              </Button>
              <Button variant="outline" onClick={() => setShowNewPatientForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        {loading && patients.length === 0 ? (
            <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className='ml-4 text-gray-600'>Cargando pacientes...</p>
            </div>
        ) : patients.length === 0 ? (
            <div className="text-center p-8">
                <p className="text-gray-600">No tienes pacientes asignados.</p>
                <p className="text-sm text-gray-500 mt-2">Usa el botón "Nuevo Paciente" para registrar y asignar uno.</p>
            </div>
        ) : (
          patients.map((patient) => (
            <AccordionItem value={`item-${patient.id}`} key={patient.id}>
              <AccordionTrigger>
                <div className="flex justify-between items-center w-full pr-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-semibold">{patient.name}</p>
                      <p className="text-sm text-gray-500">{patient.age} años • {patient.diagnosis.join(', ')}</p>
                    </div>
                  </div>
                  {/* La data de 'status', 'progress', etc. no viene del backend aún, se puede añadir luego */}
                  {/* <Badge
                    variant={
                      patient.status === 'active' ? 'default' :
                      patient.status === 'session' ? 'secondary' : 'outline'
                    }
                  >
                    {patient.status}
                  </Badge> */}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2 pb-4 px-4">
                  <div className="flex items-center justify-between text-sm">
                     <p>Email del Padre/Madre: {patient.parentEmail}</p>
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <Activity className="w-4 h-4 mr-1" />
                      Ver Detalles
                    </Button>
                    <Button size="sm" variant="outline">
                      <Users className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))
        )}
      </Accordion>
    </div>
  );
};