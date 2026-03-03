// Página de Recuperación de Contraseña del Campus Duomo LMS

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle2, AlertCircle, Loader2, Send } from 'lucide-react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validación básica
    if (!email.trim()) {
      setError('Por favor ingresa tu correo electrónico');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Por favor ingresa un correo electrónico válido');
      return;
    }

    try {
      setIsLoading(true);
      
      // Simular llamada a API
      // En producción, esto llamaría a moodleApi.requestPasswordReset(email)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error al procesar la solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout title="¡Correo Enviado!">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">
              Revisa tu correo
            </h2>
            <p className="text-gray-600">
              Hemos enviado instrucciones para restablecer tu contraseña a:
            </p>
            <p className="font-medium text-gray-900">{email}</p>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg text-left">
            <p className="text-sm text-amber-800">
              <strong>Nota:</strong> Si no recibes el correo en unos minutos, 
              revisa tu carpeta de spam o contacta al administrador del sistema.
            </p>
          </div>

          <Button variant="outline" className="w-full" asChild>
            <Link to="/login">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio de sesión
            </Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="¿Olvidaste tu contraseña?" 
      subtitle="Ingresa tu correo y te enviaremos instrucciones"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700 font-medium">
            Correo Electrónico
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Enviando...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              <span>Enviar Instrucciones</span>
            </div>
          )}
        </Button>

        {/* Back to Login */}
        <div className="text-center">
          <Link 
            to="/login" 
            className="text-sm font-medium text-amber-600 hover:text-amber-700 inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver al inicio de sesión
          </Link>
        </div>
      </form>

      {/* Help */}
      <Card className="mt-8 bg-gray-50 border-gray-100">
        <CardContent className="p-4">
          <h3 className="font-medium text-gray-900 mb-2">¿Necesitas ayuda?</h3>
          <p className="text-sm text-gray-600 mb-3">
            Si no tienes acceso a tu correo electrónico o necesitas asistencia adicional, 
            contacta a nuestro equipo de soporte.
          </p>
          <a 
            href="mailto:soporte@duomo.com" 
            className="text-sm font-medium text-amber-600 hover:text-amber-700"
          >
            Contactar soporte →
          </a>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}

export default ForgotPassword;
