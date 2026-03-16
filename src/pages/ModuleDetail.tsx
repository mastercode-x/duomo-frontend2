// Página de Detalle de Módulo del Campus Duomo LMS
// Muestra el contenido de una SECCIÓN del curso (que contiene múltiples actividades/módulos).
// Cada actividad se renderiza según su tipo: supervideo, quiz, resource, forum, coursecertificate.

import { useState, useEffect, useRef } from 'react';
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
  Award,
  AlertCircle,
  Clock,
  ExternalLink,
  Download,
  Eye,
  Video,
  FileQuestion,
  Trophy,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';
import { getMoodleFileUrl } from '@/lib/moodleUtils';
import { moodleApi } from '@/services/moodleApi';
import type { CourseDetail, CourseSection, CourseModule } from '@/types';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getModuleIcon(modname: string) {
  const map: Record<string, React.ElementType> = {
    resource: FileText,
    page: BookOpen,
    forum: MessageSquare,
    quiz: FileQuestion,
    assign: FileText,
    video: Video,
    supervideo: Video,
    hvp: PlayCircle,
    h5pactivity: PlayCircle,
    certificate: Trophy,
    coursecertificate: Trophy,
    url: ExternalLink,
    folder: BookOpen,
    scorm: PlayCircle,
  };
  return map[modname] ?? FileText;
}

function getModuleLabel(modname: string) {
  const labels: Record<string, string> = {
    resource: 'Recurso',
    page: 'Página',
    forum: 'Foro',
    quiz: 'Cuestionario',
    assign: 'Tarea',
    video: 'Video',
    supervideo: 'Video',
    hvp: 'Contenido Interactivo',
    h5pactivity: 'Contenido Interactivo',
    certificate: 'Certificado',
    coursecertificate: 'Certificado',
    label: 'Etiqueta',
    url: 'Enlace',
    book: 'Libro',
    folder: 'Carpeta',
    scorm: 'SCORM',
  };
  return labels[modname] ?? modname;
}

/**
 * Extrae la URL de embed de un video de YouTube o Vimeo.
 * Si no reconoce el formato, devuelve null.
 */
function getVideoEmbedUrl(url: string): string | null {
  if (!url) return null;

  // YouTube: watch?v=ID  |  youtu.be/ID  |  embed/ID
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
  }

  // Vimeo: vimeo.com/ID  |  player.vimeo.com/video/ID
  const vimeoMatch = url.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return null;
}

/**
 * Determina si una URL es un archivo de video (mp4, webm, ogg).
 */
function isDirectVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

// ─────────────────────────────────────────────
// Sub-componentes de renderizado por tipo
// ─────────────────────────────────────────────

/** supervideo / video: YouTube, Vimeo o archivo mp4 */
function VideoPlayer({ module }: { module: CourseModule }) {
  // La URL del módulo puede ser la URL de Moodle (que redirige al video).
  // También puede haber contenido en module.contents[0].fileurl para mp4.
  const rawUrl = module.url ?? '';
  const embedUrl = getVideoEmbedUrl(rawUrl);

  // Intentar obtener URL directa de mp4 desde contents
  const mp4Content = module.contents?.find(
    (c) => c.type === 'file' && c.mimetype?.startsWith('video/')
  );
  const mp4Url = mp4Content?.fileurl ?? (isDirectVideoUrl(rawUrl) ? rawUrl : null);

  if (embedUrl) {
    return (
      <div className="space-y-3">
        <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
          <iframe
            className="absolute inset-0 w-full h-full rounded-lg"
            src={embedUrl}
            title={module.name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        {module.description && (
          <div
            className="prose max-w-none text-sm text-gray-600"
            dangerouslySetInnerHTML={{ __html: module.description }}
          />
        )}
      </div>
    );
  }

  if (mp4Url) {
    return (
      <div className="space-y-3">
        <video
          className="w-full rounded-lg bg-black"
          controls
          src={mp4Url}
          title={module.name}
        >
          Tu navegador no soporta la reproducción de video.
        </video>
        {module.description && (
          <div
            className="prose max-w-none text-sm text-gray-600"
            dangerouslySetInnerHTML={{ __html: module.description }}
          />
        )}
      </div>
    );
  }

  // Fallback mejorado: diseño atractivo de "ver en plataforma"
  return (
    <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-700 aspect-video flex flex-col items-center justify-center gap-4 p-8">
      {/* Botón play grande */}
      <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
        <PlayCircle className="w-10 h-10 text-white" />
      </div>
      
      <div className="text-center text-white">
        <p className="font-semibold text-lg">{module.name}</p>
        <p className="text-sm text-white/70 mt-1">
          Este video se reproduce en la plataforma Duomo
        </p>
      </div>
      
      {rawUrl && (
        <Button 
          size="lg"
          className="bg-[#E8927C] hover:bg-[#D4845A] text-white mt-2"
          asChild
        >
          <a href={rawUrl} target="_blank" rel="noopener noreferrer">
            <PlayCircle className="w-5 h-5 mr-2" />
            Ver video
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        </Button>
      )}
      
      {/* Info de completion si existe */}
      {module.completiondata?.state === 1 && (
        <Badge className="bg-green-500 text-white absolute top-4 right-4">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Completado
        </Badge>
      )}
    </div>
  );
}

/** quiz / forum / coursecertificate: abrir en nueva pestaña */
function ExternalModuleCard({
  module,
  icon: Icon,
  label,
  actionLabel,
  colorClass,
}: {
  module: CourseModule;
  icon: React.ElementType;
  label: string;
  actionLabel: string;
  colorClass: string;
}) {
  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className={cn('w-24 h-24 rounded-full flex items-center justify-center', colorClass)}>
        <Icon className="w-12 h-12" />
      </div>
      <div className="text-center">
        <Badge variant="secondary" className="mb-2">
          {label}
        </Badge>
        <h3 className="text-xl font-semibold text-gray-900">{module.name}</h3>
        {module.description && (
          <div
            className="prose max-w-none text-sm text-gray-600 mt-3"
            dangerouslySetInnerHTML={{ __html: module.description }}
          />
        )}
      </div>
      {module.url && (
        <Button size="lg" asChild>
          <a href={module.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-5 h-5 mr-2" />
            {actionLabel}
          </a>
        </Button>
      )}
    </div>
  );
}

/** resource: PDF, imagen u otro archivo */
function ResourceViewer({ module }: { module: CourseModule }) {
  // CORRECCIÓN: Obtener token de localStorage para transformar URLs
  const token = localStorage.getItem('moodle_token');
  const fileContent = module.contents?.find((c) => c.type === 'file');
  const rawFileUrl = fileContent?.fileurl ?? module.url;
  // CORRECCIÓN: Transformar URL con token para archivos de pluginfile.php
  const fileUrl = rawFileUrl ? getMoodleFileUrl(rawFileUrl, token) : rawFileUrl;
  const mimetype = fileContent?.mimetype ?? '';
  const filename = fileContent?.filename ?? module.name;

  const isPdf = mimetype === 'application/pdf' || /\.pdf(\?.*)?$/i.test(fileUrl ?? '');
  const isImage = mimetype.startsWith('image/') || /\.(png|jpg|jpeg|gif|webp|svg)(\?.*)?$/i.test(fileUrl ?? '');

  if (!fileUrl) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <FileText className="w-16 h-16 text-gray-300" />
        <p className="text-gray-500">No hay archivo disponible para este recurso.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Descripción */}
      {module.description && (
        <div
          className="prose max-w-none text-sm text-gray-600"
          dangerouslySetInnerHTML={{ __html: module.description }}
        />
      )}

      {/* Previsualización */}
      {isPdf && (
        <div className="border rounded-lg overflow-hidden" style={{ height: '70vh' }}>
          <iframe
            src={fileUrl}
            title={filename}
            className="w-full h-full"
          />
        </div>
      )}

      {isImage && (
        <div className="flex justify-center">
          <img
            src={fileUrl}
            alt={filename}
            className="max-w-full rounded-lg border shadow-sm"
          />
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex flex-wrap gap-3 pt-2">
        {(isPdf || isImage) && (
          <Button variant="outline" asChild>
            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
              <Eye className="w-4 h-4 mr-2" />
              Ver en pantalla completa
            </a>
          </Button>
        )}
        <Button asChild>
          <a href={fileUrl} download={filename} target="_blank" rel="noopener noreferrer">
            <Download className="w-4 h-4 mr-2" />
            Descargar {filename}
          </a>
        </Button>
        {!isPdf && !isImage && (
          <Button variant="outline" asChild>
            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir archivo
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

/** Renderizador principal de una actividad según su modname */
function ModuleActivityRenderer({ module }: { module: CourseModule }) {
  const { modname } = module;

  if (modname === 'supervideo' || modname === 'video') {
    return <VideoPlayer module={module} />;
  }

  if (modname === 'quiz') {
    return (
      <ExternalModuleCard
        module={module}
        icon={FileQuestion}
        label="Cuestionario"
        actionLabel="Iniciar cuestionario"
        colorClass="bg-blue-100 text-blue-600"
      />
    );
  }

  if (modname === 'forum') {
    return (
      <ExternalModuleCard
        module={module}
        icon={MessageSquare}
        label="Foro"
        actionLabel="Ir al foro"
        colorClass="bg-purple-100 text-purple-600"
      />
    );
  }

  if (modname === 'coursecertificate' || modname === 'certificate') {
    return (
      <ExternalModuleCard
        module={module}
        icon={Trophy}
        label="Certificado"
        actionLabel="Ver certificado"
        colorClass="bg-amber-100 text-amber-600"
      />
    );
  }

  if (modname === 'resource') {
    return <ResourceViewer module={module} />;
  }

  // Fallback genérico para tipos no contemplados (url, page, assign, etc.)
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <BookOpen className="w-16 h-16 text-gray-300" />
      <div>
        <Badge variant="secondary" className="mb-2">
          {getModuleLabel(modname)}
        </Badge>
        <h3 className="text-lg font-semibold text-gray-900">{module.name}</h3>
        {module.description && (
          <div
            className="prose max-w-none text-sm text-gray-600 mt-3"
            dangerouslySetInnerHTML={{ __html: module.description }}
          />
        )}
      </div>
      {module.url && (
        <Button asChild>
          <a href={module.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            Abrir actividad
          </a>
        </Button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export function ModuleDetail() {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const { isTeacher } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [currentSection, setCurrentSection] = useState<CourseSection | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(-1);
  // Índice de la actividad seleccionada dentro de la sección
  const [selectedActivityIndex, setSelectedActivityIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (courseId && moduleId) {
      loadModuleData(parseInt(courseId), parseInt(moduleId));
    }
  }, [courseId, moduleId]);

  // Cuando cambia la actividad seleccionada, hacer scroll al contenido
  useEffect(() => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [selectedActivityIndex]);

  const loadModuleData = async (cId: number, mId: number) => {
  try {
    setIsLoading(true);
    setError(null);

    const courseData = await moodleApi.getCourseById(cId);

    if (!courseData) {
      setError('No se pudo cargar el curso');
      return;
    }

    // courseData.sections ya vienen transformadas con tokens desde getCourseById
    setCourse(courseData);

    const sections = courseData.sections ?? [];
    const sectionIndex = sections.findIndex((s: CourseSection) => s.id === mId);
    if (sectionIndex !== -1) {
      setCurrentSection(sections[sectionIndex]);
      setCurrentSectionIndex(sectionIndex);
      setSelectedActivityIndex(0);
    } else {
      setError('Módulo no encontrado');
    }
  } catch (err: unknown) {
    console.error('Error al cargar módulo:', err);
    setError('Error al cargar el módulo. Por favor intenta de nuevo.');
  } finally {
    setIsLoading(false);
  }
};

 const navigateToSection = (index: number) => {
  if (course?.sections?.[index]) {
    navigate(`/courses/${course.id}/modules/${course.sections[index].id}`);
  }
};

  const goToPrevious = () => {
    if (currentSectionIndex > 0) navigateToSection(currentSectionIndex - 1);
  };

  const goToNext = () => {
    if (course && currentSectionIndex < (course.sections?.length ?? 0) - 1) {
      navigateToSection(currentSectionIndex + 1);
    }
  };

  // ── Loading ──
  if (isLoading) return <ModuleDetailSkeleton />;

  // ── Error ──
  if (error || !course || !currentSection) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate(`/courses/${courseId}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al curso
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error ?? 'Módulo no encontrado'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const hasPrevious = currentSectionIndex > 0;
  const hasNext = course.sections != null && currentSectionIndex < course.sections.length - 1;
  const totalSections = course.sections?.length ?? 0;

  // Progreso: secciones anteriores / total (aproximación)
  const completedSections = currentSectionIndex;
  const progress = totalSections > 0 ? (completedSections / totalSections) * 100 : 0;

  // Actividades de la sección actual (excluir labels sin contenido)
  const activities = (currentSection.modules ?? []).filter(
    (m) => m.modname !== 'label' && m.uservisible !== false
  );
  const selectedActivity = activities[selectedActivityIndex] ?? null;

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb ── */}
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/courses" className="flex items-center gap-1">
              <Home className="w-4 h-4" />
              Cursos
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to={`/courses/${course.id}`} className="flex items-center gap-1">
              <GraduationCap className="w-4 h-4" />
              {course.fullname}
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <span className="font-medium text-gray-900 truncate max-w-[200px]">
            {currentSection.name}
          </span>
        </BreadcrumbItem>
      </Breadcrumb>

      {/* ── Header con navegación entre secciones ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/courses/${course.id}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al curso
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPrevious} disabled={!hasPrevious}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Anterior
          </Button>
          <span className="text-sm text-gray-500 px-2 whitespace-nowrap">
            {currentSectionIndex + 1} / {totalSections}
          </span>
          <Button variant="outline" size="sm" onClick={goToNext} disabled={!hasNext}>
            Siguiente
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* ── Título de la sección ── */}
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
            className="prose max-w-none mt-3 text-gray-600"
            dangerouslySetInnerHTML={{ __html: currentSection.summary }}
          />
        )}
      </div>

      {/* ── Barra de progreso (solo estudiantes) ── */}
      {!isTeacher && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progreso del curso</span>
              <span className="text-sm font-bold text-gray-900">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-gray-500 mt-2">
              Has completado {completedSections} de {totalSections} módulos
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Layout principal ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Columna principal: contenido de la actividad seleccionada ── */}
        <div className="lg:col-span-2 space-y-4" ref={contentRef}>
          {activities.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Este módulo no tiene contenido disponible.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Selector de actividades (si hay más de una) */}
              {activities.length > 1 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#8B9A7D]" />
                      Actividades de este módulo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-100">
                      {activities.map((activity, idx) => {
                        const Icon = getModuleIcon(activity.modname);
                        const isSelected = idx === selectedActivityIndex;
                        const isCompleted = activity.completiondata?.state === 1;
                        return (
                          <button
                            key={activity.id}
                            onClick={() => setSelectedActivityIndex(idx)}
                            className={cn(
                              'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                              isSelected
                                ? 'bg-amber-50 border-l-4 border-amber-500'
                                : 'border-l-4 border-transparent hover:bg-gray-50'
                            )}
                          >
                            <div
                              className={cn(
                                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                                isCompleted ? 'bg-green-100' : isSelected ? 'bg-amber-100' : 'bg-gray-100'
                              )}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              ) : (
                                <Icon
                                  className={cn(
                                    'w-4 h-4',
                                    isSelected ? 'text-amber-600' : 'text-gray-500'
                                  )}
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={cn(
                                  'text-sm font-medium truncate',
                                  isSelected ? 'text-gray-900' : 'text-gray-700'
                                )}
                              >
                                {idx + 1}. {activity.name}
                              </p>
                              <p className="text-xs text-gray-500">{getModuleLabel(activity.modname)}</p>
                            </div>
                            {isCompleted && (
                              <Badge
                                variant="secondary"
                                className="text-xs bg-green-100 text-green-700 flex-shrink-0"
                              >
                                Completado
                              </Badge>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Contenido de la actividad seleccionada */}
              {selectedActivity && (
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const Icon = getModuleIcon(selectedActivity.modname);
                          return (
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Icon className="w-5 h-5 text-amber-600" />
                            </div>
                          );
                        })()}
                        <div>
                          <CardTitle className="text-lg leading-tight">
                            {selectedActivity.name}
                          </CardTitle>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {getModuleLabel(selectedActivity.modname)}
                          </Badge>
                        </div>
                      </div>
                      {selectedActivity.completiondata?.state === 1 && (
                        <Badge className="bg-green-100 text-green-700 border-0 flex-shrink-0">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Completado
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ModuleActivityRenderer module={selectedActivity} />
                  </CardContent>
                </Card>
              )}

              {/* Navegación entre actividades dentro de la sección */}
              {activities.length > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedActivityIndex((i) => Math.max(0, i - 1))}
                    disabled={selectedActivityIndex === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Actividad anterior
                  </Button>
                  <span className="text-sm text-gray-500">
                    {selectedActivityIndex + 1} / {activities.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedActivityIndex((i) => Math.min(activities.length - 1, i + 1))
                    }
                    disabled={selectedActivityIndex === activities.length - 1}
                  >
                    Siguiente actividad
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

       {/* ── Sidebar ── */}
<div className="space-y-4">
  {/* Lista de actividades del módulo actual */}
  {activities.length > 1 && (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#8B9A7D]" />
          Actividades ({activities.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {activities.map((activity, idx) => {
            const Icon = getModuleIcon(activity.modname);
            const isSelected = idx === selectedActivityIndex;
            const isCompleted = activity.completiondata?.state === 1;
            return (
              <button
                key={activity.id}
                onClick={() => setSelectedActivityIndex(idx)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                  isSelected
                    ? 'bg-amber-50 border-l-4 border-amber-500'
                    : 'border-l-4 border-transparent hover:bg-gray-50'
                )}
              >
                <div className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
                  isCompleted ? 'bg-green-100' : isSelected ? 'bg-amber-100' : 'bg-gray-100'
                )}>
                  {isCompleted
                    ? <CheckCircle2 className="w-4 h-4 text-green-600" />
                    : <Icon className={cn('w-4 h-4', isSelected ? 'text-amber-600' : 'text-gray-500')} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-xs font-medium truncate', isSelected ? 'text-gray-900' : 'text-gray-700')}>
                    {idx + 1}. {activity.name}
                  </p>
                  <p className="text-[11px] text-gray-500">{getModuleLabel(activity.modname)}</p>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  )}

  {/* Lista de todas las secciones */}
  <Card>
    <CardHeader>
      <CardTitle className="text-base">Todos los Módulos</CardTitle>
    </CardHeader>
    <CardContent className="p-0">
      <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
        {course.sections?.map((section, index) => (
          <button
            key={section.id}
            onClick={() => navigateToSection(index)}
            className={cn(
              'w-full flex items-center gap-3 p-3 text-left transition-colors hover:bg-gray-50',
              index === currentSectionIndex
                ? 'bg-amber-50 border-l-4 border-amber-500'
                : 'border-l-4 border-transparent'
            )}
          >
            <div className={cn(
              'w-6 h-6 rounded flex items-center justify-center text-xs font-medium flex-shrink-0',
              index === currentSectionIndex ? 'bg-amber-500 text-white'
                : index < currentSectionIndex ? 'bg-green-100 text-green-600'
                : 'bg-gray-100 text-gray-500'
            )}>
              {index < currentSectionIndex ? <CheckCircle2 className="w-3 h-3" /> : index + 1}
            </div>
            <span className={cn('text-sm truncate', index === currentSectionIndex ? 'font-medium text-gray-900' : 'text-gray-600')}>
              {section.name || `Módulo ${index + 1}`}
            </span>
          </button>
        ))}
      </div>
    </CardContent>
  </Card>
</div>

          {/* Info del curso */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Curso</p>
                  <p className="font-medium text-sm truncate">{course.fullname}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Actividades en este módulo</p>
                  <p className="font-medium text-sm">{activities.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Skeleton de carga
// ─────────────────────────────────────────────

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
        <Skeleton className="h-16 w-full mt-4" />
      </div>
      <Skeleton className="h-16 w-full" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}

export default ModuleDetail;