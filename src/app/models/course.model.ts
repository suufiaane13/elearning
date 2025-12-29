export type CourseLevel = 'Débutant' | 'Intermédiaire' | 'Avancé';

export type CourseCategory = string;

export interface Lesson {
  id: number;
  title: string;
  content: string;
  duration: string;
  completed: boolean;
  order: number;
}

export interface Quiz {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  level: CourseLevel;
  category: CourseCategory;
  duration: string;
  thumbnail?: string;
  lessons: Lesson[];
  quizzes: Quiz[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseCreateDto {
  title: string;
  description: string;
  level: CourseLevel;
  category: CourseCategory;
  duration: string;
  thumbnail?: string;
}

export interface LessonCreateDto {
  title: string;
  content: string;
  duration: string;
  order: number;
}

export interface QuizCreateDto {
  question: string;
  options: string[];
  correctAnswer: number;
}

