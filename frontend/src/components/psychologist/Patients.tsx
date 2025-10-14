import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { usePatientStore, MockPatient } from '@/store/patientStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Users, Heart, Brain, Activity, Plus, Search, Calendar, Clock, User } from 'lucide-react';
import { Psychologist, Patient } from '@/types';
import { PatientDetail } from './PatientDetail';

export const PatientsView: React.FC = () => {
  const { user } = useAuthStore();
  const { patients, addPatient } = usePatientStore();
  const psychologist = user as Psychologist;
  const [selectedPatient, setSelectedPatient] = useState<MockPatient | null>(null);
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [newPatientData, setNewPatientData] = useState<Partial<MockPatient & {parentEmail: string, notes: string}>>({});
  const [registeredPatient, setRegisteredPatient] = useState<Patient | null>(null);
  const [showSessionGames, setShowSessionGames] = useState(false);

  const handleRegisterPatient = () => {
    const newMockPatient: MockPatient = {
      id: `patient-${Date.now()}`,
      name: newPatientData.name || '',
      age: newPatientData.age || 0,
      diagnosis: newPatientData.diagnosis || [],
      lastSession: '',
      progress: 0,
      status: 'active',
      emotions: [],
      heartRate: 80
    };

    addPatient(newMockPatient);

    const newPatient: Patient = {
      id: newMockPatient.id,
      name: newMockPatient.name,
      email: newPatientData.parentEmail || '',
      role: 'patient',
      age: newMockPatient.age,
      diagnosis: newMockPatient.diagnosis,
      parentEmail: newPatientData.parentEmail || '',
      assignedPsychologist: psychologist.id,
      currentEmotion: 'neutral',
      avatar: '/avatars/default-child.jpg',
      preferences: {
        favoriteColors: [],
        preferredActivities: [],
        sensitivity: {
          sound: 'medium',
          light: 'medium',
          touch: 'medium'
        },
        avatarCustomization: {
          skinTone: 'medium',
          hairColor: 'brown',
          eyeColor: 'brown',
          clothing: 'casual',
          accessories: []
        }
      },
      biometricData: {
        heartRate: 80,
        stressLevel: 'low',
        skinTemperature: 36.5,
        activity: 'resting',
        timestamp: new Date()
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setRegisteredPatient(newPatient);
    setShowNewPatientForm(false);
    setNewPatientData({});
  };

  const games = [
    { id: '1', name: 'Juego de Colores', description: 'Identifica y combina colores para mejorar la concentración', suitableEmotions: ['joy', 'calm'] },
    { id: '2', name: 'Rompecabezas Emocional', description: 'Arma rompecabezas que representan diferentes emociones', suitableEmotions: ['anxiety', 'sadness'] },
    { id: '3', name: 'Aventura Sonora', description: 'Explora sonidos y ritmos para estimular los sentidos', suitableEmotions: ['joy', 'calm'] },
    { id: '4', name: 'Laberinto Calmante', description: 'Navega laberintos relajantes para reducir la ansiedad', suitableEmotions: ['anxiety', 'sadness'] },
    { id: '5', name: 'Dibujo Libre', description: 'Expresa emociones a través del dibujo creativo', suitableEmotions: ['joy', 'anxiety', 'sadness', 'calm'] },
    { id: '6', name: 'Juego de Memoria', description: 'Mejora la memoria con tarjetas de emociones', suitableEmotions: ['calm'] }
  ];

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

      {registeredPatient && (
        <Card className="psych-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Sesiones de {registeredPatient.name}
            </CardTitle>
            <CardDescription>
              Gestión de sesiones terapéuticas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Sesión 1 - Evaluación Inicial</h3>
                    <p className="text-sm text-gray-600">15 Enero 2024 • 10:00 AM</p>
                  </div>
                  <Badge variant="secondary">Completada</Badge>
                </div>
                <p className="text-sm mt-2">Evaluación inicial del paciente, identificación de fortalezas y áreas de mejora.</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Sesión 2 - Terapia Conductual</h3>
                    <p className="text-sm text-gray-600">22 Enero 2024 • 10:00 AM</p>
                  </div>
                  <Badge variant="outline">Programada</Badge>
                </div>
                <p className="text-sm mt-2">Trabajo en habilidades sociales y regulación emocional.</p>
              </div>
              <Button onClick={() => setShowSessionGames(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showSessionGames && registeredPatient && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Juegos Terapéuticos para {registeredPatient.name}</h1>
              <p className="text-gray-600 mt-1">
                Juegos adaptados según la emoción actual: {registeredPatient.currentEmotion}
              </p>
            </div>
            <Button onClick={() => setShowSessionGames(false)}>
              Volver a Sesiones
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.filter(g => g.suitableEmotions.includes(registeredPatient.currentEmotion)).map(game => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="psych-card hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      {game.name}
                    </CardTitle>
                    <CardDescription>{game.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" onClick={() => alert(`Iniciando ${game.name}...`)}>
                      Jugar Ahora
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {showNewPatientForm && (
        <Card className="psych-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-green-600" />
              Registrar Nuevo Paciente
            </CardTitle>
            <CardDescription>
              Complete la información del nuevo paciente
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
            <div>
              <Label htmlFor="notes">Notas adicionales</Label>
              <Textarea
                id="notes"
                value={newPatientData.notes || ''}
                onChange={(e) => setNewPatientData({...newPatientData, notes: e.target.value})}
                placeholder="Información adicional relevante..."
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleRegisterPatient}>
                Registrar Paciente
              </Button>
              <Button variant="outline" onClick={() => setShowNewPatientForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        {patients.map((patient) => (
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
                <Badge
                  variant={
                    patient.status === 'active' ? 'default' :
                    patient.status === 'session' ? 'secondary' : 'outline'
                  }
                >
                  {patient.status}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2 pb-4 px-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Progreso</span>
                  <span className="text-sm font-medium">{patient.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${patient.progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span>{patient.heartRate} BPM</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Brain className="w-4 h-4 text-purple-500" />
                    <span>{patient.emotions.length} emociones</span>
                  </div>
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
        ))}
      </Accordion>
    </div>
  );
};