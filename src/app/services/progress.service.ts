import { Injectable } from '@angular/core';
import { StudentProgress, StudentStats } from '../models';
import { CourseService } from './course.service';

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private readonly STORAGE_KEY = 'student_progress';
  private progressMap = new Map<number, StudentProgress>();

  constructor(private courseService: CourseService) {
    this.loadProgress();
  }

  private loadProgress(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const data: [number, StudentProgress][] = JSON.parse(stored);
        data.forEach(([, progress]) => {
          if (typeof progress.startedAt === 'string') {
            progress.startedAt = new Date(progress.startedAt);
          }
          if (typeof progress.lastAccessedAt === 'string') {
            progress.lastAccessedAt = new Date(progress.lastAccessedAt);
          }
        });
        this.progressMap = new Map(data);
      } catch (error) {
        console.error('Erreur lors du chargement de la progression:', error);
        this.progressMap = new Map();
      }
    }
  }

  private saveProgress(): void {
    const data = Array.from(this.progressMap.entries());
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  enrollInCourse(courseId: number): void {
    if (!this.progressMap.has(courseId)) {
      const progress: StudentProgress = {
        courseId,
        completedLessons: [],
        startedAt: new Date(),
        lastAccessedAt: new Date(),
        completionPercentage: 0,
        isEnrolled: true
      };
      this.progressMap.set(courseId, progress);
      this.saveProgress();
    }
  }

  unenrollFromCourse(courseId: number): void {
    this.progressMap.delete(courseId);
    this.saveProgress();
  }

  isEnrolled(courseId: number): boolean {
    return this.progressMap.has(courseId);
  }

  getProgress(courseId: number): StudentProgress | undefined {
    return this.progressMap.get(courseId);
  }

  getAllEnrolledCourses(): StudentProgress[] {
    return Array.from(this.progressMap.values());
  }

  toggleLessonCompletion(courseId: number, lessonId: number): void {
    const progress = this.progressMap.get(courseId);
    if (!progress) {
      this.enrollInCourse(courseId);
      return this.toggleLessonCompletion(courseId, lessonId);
    }

    const index = progress.completedLessons.indexOf(lessonId);
    if (index === -1) {
      progress.completedLessons.push(lessonId);
    } else {
      progress.completedLessons.splice(index, 1);
    }

    progress.lastAccessedAt = new Date();
    this.updateCompletionPercentage(courseId);
    this.saveProgress();
  }

  isLessonCompleted(courseId: number, lessonId: number): boolean {
    const progress = this.progressMap.get(courseId);
    return progress?.completedLessons.includes(lessonId) ?? false;
  }

  private updateCompletionPercentage(courseId: number): void {
    const progress = this.progressMap.get(courseId);
    const course = this.courseService.getCourseById(courseId);
    
    if (progress && course) {
      const totalLessons = course.lessons.length;
      const completedLessons = progress.completedLessons.length;
      progress.completionPercentage = totalLessons > 0 
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;
    }
  }

  getCompletionPercentage(courseId: number): number {
    const progress = this.progressMap.get(courseId);
    return progress?.completionPercentage ?? 0;
  }

  getStudentStats(): StudentStats {
    const allProgress = this.getAllEnrolledCourses();
    const totalEnrolled = allProgress.length;
    const totalCompleted = allProgress.filter(p => p.completionPercentage === 100).length;
    const totalLessonsCompleted = allProgress.reduce((sum, p) => sum + p.completedLessons.length, 0);
    const averageProgress = totalEnrolled > 0
      ? Math.round(allProgress.reduce((sum, p) => sum + p.completionPercentage, 0) / totalEnrolled)
      : 0;

    return {
      totalCoursesEnrolled: totalEnrolled,
      totalCoursesCompleted: totalCompleted,
      totalLessonsCompleted,
      averageProgress
    };
  }

  resetProgress(courseId: number): void {
    const progress = this.progressMap.get(courseId);
    if (progress) {
      progress.completedLessons = [];
      progress.completionPercentage = 0;
      progress.lastAccessedAt = new Date();
      this.saveProgress();
    }
  }

  resetAllProgress(): void {
    this.progressMap.clear();
    this.saveProgress();
  }
}

