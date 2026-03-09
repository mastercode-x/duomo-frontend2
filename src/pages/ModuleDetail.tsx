// Página de Detalle de Módulo del Campus Duomo LMS
// Muestra el contenido de un módulo específico con navegación anterior/siguiente

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  CheckCircle2, 
  PlayCircle, 
  FileText, 
  ChevronRight,
  ChevronLeft,
  Home,
  GraduationCap,
  MessageSquare,
  Edit,
  Award,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';
import { moodleApi } from '@/services/moodleApi';
import type { CourseDetail, CourseSection, CourseModule } from '@/types';

export function ModuleDetail() {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const { isTeacher } = useAuth();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [currentSection, setCurrentSection] = useState<CourseSection | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (courseId && moduleId) {
      loadModuleData(parseInt(courseId), parseInt(moduleId));
    }
  }, [courseId, moduleId]);

  const loadModuleData = async (cId: number, mId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const courseData = await moodleApi.getCourseById(cId);
      const courseContent = await moodleApi.getCourseContent(cId);
      
      if (!courseData) {
        setError('No se pudo cargar el curso');
        return;
      }
      
      const fullCourse = {
        ...courseData,
        sections: courseContent,
      };
      
      setCourse(fullCourse);
      
      // Encontrar la sección actual
      const sectionIndex = courseContent.findIndex((s: CourseSection) => s.id === mId);
      if (sectionIndex !== -1) {
        setCurrentSection(courseContent[sectionIndex]);
        setCurrentSectionIndex(sectionIndex);
      } else {
        setError('Módulo no encontrado');
      }
    } catch (err: any) {
      console.error('Error al cargar módulo:', err);
      setError('Error al cargar el módulo. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const getModuleIcon = (modname: string) => {
    const iconMap: Record<string, any> = {
      'resource': FileText,
      'page': BookOpen,
      'forum': MessageSquare,
      'quiz': CheckCircle2,
      'assign': Edit,
      'video': PlayCircle,
      'supervideo': PlayCircle,
      'hvp': PlayCircle,
      'h5pactivity': PlayCircle,
      'certificate': Award,
      'url': FileText,
      'folder': BookOpen,
      'scorm': PlayCircle,
    };
    return iconMap[modname] || FileText;
  };

  const getModuleLabel = (modname: string) => {
    const labels: Record<string, string> = {
      resource: 'Recurso',
      page: 'Página',
      forum: 'Foro',
      quiz: 'Cuestionario',
      assign: 'Tarea',
      video: 'Video',
      hvp: 'Contenido Interactivo',
      certificate: 'Certificado',
      label: 'Etiqueta',
      url: 'Enlace',
      book: 'Libro',
      folder: 'Carpeta',
    };
    return labels[modname] || modname;
  };

  const navigateToModule = (index: number) => {
    if (course && course.sections && course.sections[index]) {
      navigate(`/courses/${course.id}/modules/${course.sections[index].id}`);
    }
  };

  const goToPreviousModule = () => {
    if (currentSectionIndex > 0) {
      navigateToModule(currentSectionIndex - 1);
    }
  };

  const goToNextModule = () => {
    if (course && currentSectionIndex < course.sections!.length - 1) {
      navigateToModule(currentSectionIndex + 1);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  if (isLoading) {
    return <ModuleDetailSkeleton />;
  }

  if (error || !course || !currentSection) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate(`/courses/${courseId}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al curso
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Módulo no encontrado'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const hasPrevious = currentSectionIndex > 0;
  const hasNext = course.sections && currentSectionIndex < course.sections.length - 1;
  const totalModules = course.sections?.length || 0;
  const completedModules = course.sections?.filter((_, i) => i < currentSectionIndex).length || 0;
  const progress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/courses">
              <Home className="w-4 h-4 mr-1" />
              Cursos
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to={`/courses/${course.id}`}>
              <GraduationCap className="w-4 h-4 mr-1" />
              {course.fullname}
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <span className="font-medium text-gray-900">{currentSection.name}</span>
        </BreadcrumbItem>
      </Breadcrumb>

      {/* Header con navegación */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate(`/courses/${course.id}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al curso
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousModule}
            disabled={!hasPrevious}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Anterior
          </Button>
          <span className="text-sm text-gray-500 px-2">
            {currentSectionIndex + 1} / {totalModules}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextModule}
            disabled={!hasNext}
          >
            Siguiente
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Título del módulo */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="bg-amber-100 text-amber-700">
            Módulo {currentSectionIndex + 1}
          </Badge>
          {currentSection.visible === false && (
            <Badge variant="outline" className="text-gray-500">
              Oculto
            </Badge>
          )}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{currentSection.name}</h1>
        {currentSection.summary && (
          <div 
            className="prose max-w-none mt-4 text-gray-600"
            dangerouslySetInnerHTML={{ __html: currentSection.summary }}
          />
        )}
      </div>

      {/* Progreso del curso */}
      {!isTeacher && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progreso del curso</span>
              <span className="text-sm font-bold text-gray-900">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-gray-500 mt-2">
              Has completado {completedModules} de {totalModules} módulos
            </p>
          </CardContent>
        </Card>
      )}

      {/* Contenido del módulo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de actividades */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#8B9A7D]" />
                Contenido del Módulo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!currentSection.modules || currentSection.modules.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Este módulo no tiene contenido aún</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentSection.modules.map((module, moduleIndex) => {
                    const ModuleIcon = getModuleIcon(module.modname);
                    const isClickable = module.uservisible && module.url;
                    
                    return (
                      <div
                        key={module.id}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-lg border transition-all",
                          module.completiondata?.state === 1 
                            ? "bg-green-50 border-green-200" 
                            : "bg-white border-gray-200 hover:border-gray-300",
                          isClickable ? "cursor-pointer" : "opacity-60"
                        )}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                            module.completiondata?.state === 1 
                              ? "bg-green-100" 
                              : "bg-gray-100"
                          )}>
                            <ModuleIcon className={cn(
                              "w-5 h-5",
                              module.completiondata?.state === 1 
                                ? "text-green-600" 
                                : "text-gray-500"
                            )} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900">
                              {moduleIndex + 1}. {module.name}
                            </h4>
                            <div className="flex items-center gap-3 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {getModuleLabel(module.modname)}
                              </Badge>
                              {module.completiondata?.state === 1 && (
                                <span className="text-xs text-green-600 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Completado
                                </span>
                              )}
                            </div>
                            {module.description && (
                              <p 
                                className="text-sm text-gray-500 mt-2 line-clamp-2"
                                dangerouslySetInnerHTML={{ __html: module.description }}
                              />
                            )}
                          </div>
                        </div>

                        {isClickable ? (
                          <Button size="sm" variant="outline" asChild>
                            <a href={module.url} target="_blank" rel="noopener noreferrer">
                              <PlayCircle className="w-4 h-4 mr-1" />
                              Abrir
                            </a>
                          </Button>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            No disponible
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Navegación y resumen */}
        <div className="space-y-4">
          {/* Navegación rápida */}
          <Card>
            <CardHeader>
              <CardTitle>Navegación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousModule}
                  disabled={!hasPrevious}
                  className="flex-1 mr-2"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextModule}
                  disabled={!hasNext}
                  className="flex-1 ml-2"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Todos los módulos */}
          <Card>
            <CardHeader>
              <CardTitle>Todos los Módulos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {course.sections?.map((section, index) => (
                  <button
                    key={section.id}
                    onClick={() => navigateToModule(index)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 text-left transition-colors hover:bg-gray-50",
                      index === currentSectionIndex 
                        ? "bg-amber-50 border-l-4 border-amber-500" 
                        : "border-l-4 border-transparent"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded flex items-center justify-center text-xs font-medium flex-shrink-0",
                      index === currentSectionIndex
                        ? "bg-amber-500 text-white"
                        : index < currentSectionIndex
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-500"
                    )}>
                      {index < currentSectionIndex ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className={cn(
                      "text-sm truncate",
                      index === currentSectionIndex ? "font-medium text-gray-900" : "text-gray-600"
                    )}>
                      {section.name || `Módulo ${index + 1}`}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Info del curso */}
          <Card>
            <CardHeader>
              <CardTitle>Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Curso</p>
                  <p className="font-medium text-sm">{course.fullname}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Actividades</p>
                  <p className="font-medium">{currentSection.modules?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ModuleDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-64" />
      
      <div className="flex justify-between">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-48" />
      </div>

      <div>
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-20 w-full mt-4" />
      </div>

      <Skeleton className="h-16 w-full" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}

export default ModuleDetail;