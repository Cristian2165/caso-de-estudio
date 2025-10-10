import React from 'react';
import { motion } from 'framer-motion';
import { useBiometricStore } from '@/store/biometricStore';
import { CameraAnalysis } from './CameraAnalysis';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Line, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import {
  Heart,
  Activity,
  Thermometer,
  Zap,
  Play,
  Pause,
  Settings,
  AlertTriangle,
  TrendingUp,
  Download
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const BiometricView: React.FC = () => {
  const { 
    realTimeData, 
    historicalData, 
    alerts, 
    isMonitoring, 
    startMonitoring, 
    stopMonitoring 
  } = useBiometricStore();

  // Mock additional biometric data
  const biometricMetrics = {
    heartRateVariability: 45,
    skinConductance: 2.3,
    bodyTemperature: 36.8,
    activity: 'moderate',
    oxygenSaturation: 98
  };

  const heartRateData = {
    labels: historicalData.slice(-30).map((_, index) => `${index + 1}min`),
    datasets: [
      {
        label: 'Frecuencia Cardíaca',
        data: historicalData.slice(-30).map(d => d.heartRate),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const stressCorrelationData = {
    datasets: [
      {
        label: 'Correlación Estrés-FC',
        data: historicalData.slice(-20).map(d => ({
          x: d.heartRate,
          y: d.stressLevel === 'low' ? 1 : d.stressLevel === 'medium' ? 2 : 3
        })),
        backgroundColor: 'rgba(139, 92, 246, 0.6)',
        borderColor: 'rgb(139, 92, 246)',
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Monitoreo Biométrico</h1>
          <p className="text-gray-600 mt-1">
            Seguimiento en tiempo real de signos vitales y biométrica
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar Datos
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Configurar
          </Button>
          <Button
            onClick={() => isMonitoring ? stopMonitoring() : startMonitoring('demo-child')}
            className={`${
              isMonitoring 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            } text-white`}
          >
            {isMonitoring ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Detener
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Iniciar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className={`psych-card ${isMonitoring ? 'ring-2 ring-red-500' : ''}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                Frecuencia Cardíaca
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {realTimeData?.heartRate || '--'} 
                <span className="text-sm font-normal text-gray-500 ml-1">BPM</span>
              </div>
              {isMonitoring && (
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  En tiempo real
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="psych-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                Variabilidad FC
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {biometricMetrics.heartRateVariability}
                <span className="text-sm font-normal text-gray-500 ml-1">ms</span>
              </div>
              <Badge variant="secondary" className="text-xs mt-1">
                Normal
              </Badge>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="psych-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                Conductancia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {biometricMetrics.skinConductance}
                <span className="text-sm font-normal text-gray-500 ml-1">μS</span>
              </div>
              <Badge 
                variant={realTimeData?.stressLevel === 'low' ? 'secondary' : 'destructive'} 
                className="text-xs mt-1"
              >
                {realTimeData?.stressLevel || 'low'}
              </Badge>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="psych-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-orange-500" />
                Temperatura
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {biometricMetrics.bodyTemperature}
                <span className="text-sm font-normal text-gray-500 ml-1">°C</span>
              </div>
              <Badge variant="secondary" className="text-xs mt-1">
                Normal
              </Badge>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="psych-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-500" />
                Actividad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold capitalize">
                {realTimeData?.activity || 'rest'}
              </div>
              <Badge variant="outline" className="text-xs mt-1">
                {biometricMetrics.oxygenSaturation}% O2
              </Badge>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Camera Analysis */}
      <CameraAnalysis />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="psych-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Tendencia Cardíaca (30 min)
            </CardTitle>
            <CardDescription>
              Monitoreo continuo de frecuencia cardíaca
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {historicalData.length > 0 ? (
                <Line
                  data={heartRateData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: false,
                        min: 60,
                        max: 120,
                      },
                    },
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Heart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Inicia el monitoreo para ver datos</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="psych-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-500" />
              Correlación Estrés-FC
            </CardTitle>
            <CardDescription>
              Relación entre frecuencia cardíaca y nivel de estrés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {historicalData.length > 0 ? (
                <Scatter 
                  data={stressCorrelationData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: 'Frecuencia Cardíaca (BPM)'
                        }
                      },
                      y: {
                        title: {
                          display: true,
                          text: 'Nivel de Estrés'
                        },
                        ticks: {
                          callback: function(value) {
                            return value === 1 ? 'Bajo' : value === 2 ? 'Medio' : 'Alto';
                          }
                        }
                      }
                    }
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Datos insuficientes para correlación</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card className="psych-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Alertas Biométricas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                    alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                    'border-yellow-500 bg-yellow-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{alert.message}</p>
                      <p className="text-xs text-gray-600">
                        {alert.timestamp.toLocaleString('es-ES')}
                      </p>
                    </div>
                    <Badge 
                      variant={alert.resolved ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {alert.resolved ? 'Resuelto' : alert.severity.toUpperCase()}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No hay alertas biométricas activas</p>
              <p className="text-sm">Los signos vitales están dentro de rangos normales</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};