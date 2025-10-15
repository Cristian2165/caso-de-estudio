import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Heart, Stethoscope, ArrowLeft } from 'lucide-react';
import { UserRole } from '@/types';

interface RegisterFormProps {
  onBackToLogin: (data?: {email: string, password: string}) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onBackToLogin }) => {
  const { register, loading, error, clearError } = useAuthStore();
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    licenseNumber: '',
    specializations: '',
    yearsExperience: '',
    hospital: ''
  });
  const activeRole: UserRole = 'psychologist';
  const [nameError, setNameError] = React.useState('');

  const validatePsychologistName = (name: string): boolean => {
    // Solo permite letras mayúsculas, espacios y algunos caracteres especiales como acentos
    const nameRegex = /^[A-ZÁÉÍÓÚÑ\s.]+$/;
    return nameRegex.test(name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setNameError('');

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    if (!validatePsychologistName(formData.name)) {
      setNameError('El nombre debe estar en MAYÚSCULAS y no contener números');
      return;
    }

    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: activeRole,
      licenseNumber: formData.licenseNumber,
      specializations: formData.specializations.split(',').map(s => s.trim()),
      yearsExperience: parseInt(formData.yearsExperience),
      hospital: formData.hospital
    };

    await register(userData);

    // After registration, redirect to login with pre-filled data
    onBackToLogin({ email: formData.email, password: formData.password });
  };

  const updateFormData = (field: string, value: string) => {
    // Convertir automáticamente a mayúsculas si es el nombre de un psicólogo
    if (field === 'name' && activeRole === 'psychologist') {
      value = value.toUpperCase();
      setNameError('');
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => onBackToLogin()} className="mr-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>

        {/* LUMINOVA Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <div className="relative">
              <Brain className="w-12 h-12 text-blue-600" />
              <Heart className="w-6 h-6 text-red-500 absolute -top-1 -right-1" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                LUMINOVA
              </h1>
              <p className="text-sm text-gray-600">Crear Nueva Cuenta</p>
            </div>
          </motion.div>
        </div>

        <Card className="glass-psych border-white/20 shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-semibold text-gray-800">
              Registro de Usuario
            </CardTitle>
            <CardDescription>
              Crea tu cuenta para acceder a la plataforma
            </CardDescription>
          </CardHeader>

          <CardContent>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="psych-name">Nombre Completo</Label>
                  <Input
                    id="psych-name"
                    type="text"
                    placeholder="DR. ANA MARTÍNEZ"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    className={nameError ? 'border-red-500' : ''}
                    required
                  />
                  {nameError && (
                    <p className="text-sm text-red-600">{nameError}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Solo mayúsculas, sin números
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="psych-email">Email Profesional</Label>
                  <Input
                    id="psych-email"
                    type="email"
                    placeholder="doctor@luminova.com"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="psych-license">Número de Colegiado</Label>
                  <Input
                    id="psych-license"
                    type="text"
                    placeholder="COL-12345"
                    value={formData.licenseNumber}
                    onChange={(e) => updateFormData('licenseNumber', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="psych-specializations">Especializaciones</Label>
                  <Input
                    id="psych-specializations"
                    type="text"
                    placeholder="TEA, Psicología Infantil, Terapia Conductual"
                    value={formData.specializations}
                    onChange={(e) => updateFormData('specializations', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="psych-experience">Años de Experiencia</Label>
                  <Input
                    id="psych-experience"
                    type="number"
                    placeholder="5"
                    value={formData.yearsExperience}
                    onChange={(e) => updateFormData('yearsExperience', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="psych-hospital">Centro de Trabajo</Label>
                  <Input
                    id="psych-hospital"
                    type="text"
                    placeholder="Hospital General"
                    value={formData.hospital}
                    onChange={(e) => updateFormData('hospital', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="psych-password">Contraseña</Label>
                  <Input
                    id="psych-password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="psych-confirm">Confirmar Contraseña</Label>
                  <Input
                    id="psych-confirm"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  className="w-full psych-button-primary"
                  disabled={loading}
                >
                  {loading ? 'Creando cuenta...' : 'Crear Cuenta Profesional'}
                </Button>
              </form>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};