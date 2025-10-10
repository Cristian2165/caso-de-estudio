import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, StopCircle, Play, Brain, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface MicroExpression {
  emotion: string;
  confidence: number;
  timestamp: Date;
  duration: number;
}

export const CameraAnalysis: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [expressions, setExpressions] = useState<MicroExpression[]>([]);
  const [currentEmotion, setCurrentEmotion] = useState<string>('neutral');

  // Simulated micro-expression detection (OpenCV integration would go here)
  const detectMicroExpressions = () => {
    const emotions = ['joy', 'sadness', 'anger', 'surprise', 'fear', 'disgust', 'neutral'];
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    const confidence = 0.7 + Math.random() * 0.3;
    
    const newExpression: MicroExpression = {
      emotion: randomEmotion,
      confidence,
      timestamp: new Date(),
      duration: 1000 + Math.random() * 3000
    };

    setCurrentEmotion(randomEmotion);
    setExpressions(prev => [...prev.slice(-9), newExpression]);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setStream(mediaStream);
      setIsRecording(true);
      
      // Start micro-expression analysis simulation
      const interval = setInterval(detectMicroExpressions, 2000);
      (window as any).expressionInterval = interval;
      
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsRecording(false);
    setCurrentEmotion('neutral');
    
    if ((window as any).expressionInterval) {
      clearInterval((window as any).expressionInterval);
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if ((window as any).expressionInterval) {
        clearInterval((window as any).expressionInterval);
      }
    };
  }, [stream]);

  const getEmotionColor = (emotion: string) => {
    const colors = {
      joy: 'text-yellow-600 bg-yellow-100',
      sadness: 'text-blue-600 bg-blue-100',
      anger: 'text-red-600 bg-red-100',
      surprise: 'text-purple-600 bg-purple-100',
      fear: 'text-orange-600 bg-orange-100',
      disgust: 'text-green-600 bg-green-100',
      neutral: 'text-gray-600 bg-gray-100'
    };
    return colors[emotion as keyof typeof colors] || colors.neutral;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Camera Feed */}
      <Card className="psych-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-500" />
            Análisis de Micro-expresiones
          </CardTitle>
          <CardDescription>
            Análisis en tiempo real del comportamiento emocional
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="bg-gray-900 rounded-lg overflow-hidden aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
              />
            </div>
            
            {isRecording && (
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-white text-sm font-medium">REC</span>
              </div>
            )}
            
            {isRecording && currentEmotion !== 'neutral' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute bottom-4 left-4"
              >
                <Badge className={`${getEmotionColor(currentEmotion)} font-medium`}>
                  {currentEmotion.charAt(0).toUpperCase() + currentEmotion.slice(1)}
                </Badge>
              </motion.div>
            )}
          </div>
          
          <div className="flex items-center gap-3 mt-4">
            <Button
              onClick={isRecording ? stopCamera : startCamera}
              className={`${
                isRecording 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {isRecording ? (
                <>
                  <StopCircle className="w-4 h-4 mr-2" />
                  Detener Análisis
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Iniciar Análisis
                </>
              )}
            </Button>
            
            {!isRecording && (
              <div className="flex items-center text-sm text-gray-600">
                <AlertCircle className="w-4 h-4 mr-2" />
                Permite el acceso a la cámara para comenzar
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expression Analysis */}
      <Card className="psych-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            Análisis de Comportamiento
          </CardTitle>
          <CardDescription>
            Progreso emocional detectado en tiempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expressions.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Emoción Predominante</p>
                    <p className="text-2xl font-bold capitalize">{currentEmotion}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Sesiones Analizadas</p>
                    <p className="text-2xl font-bold">{expressions.length}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Historial Reciente</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {expressions.slice(-5).reverse().map((expr, index) => (
                      <motion.div
                        key={`${expr.timestamp.getTime()}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div>
                          <Badge className={`${getEmotionColor(expr.emotion)} text-xs`}>
                            {expr.emotion}
                          </Badge>
                          <p className="text-xs text-gray-600 mt-1">
                            {expr.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {Math.round(expr.confidence * 100)}%
                          </p>
                          <p className="text-xs text-gray-600">confianza</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Inicia el análisis para ver el progreso</p>
                <p className="text-sm">Las micro-expresiones se detectarán automáticamente</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};