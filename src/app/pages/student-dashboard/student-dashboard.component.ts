import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CourseCardComponent } from '../../components/course-card/course-card.component';
import { ProgressBarComponent } from '../../components/progress-bar/progress-bar.component';
import { CourseService } from '../../services/course.service';
import { ProgressService } from '../../services/progress.service';
import { Course, StudentProgress, StudentStats } from '../../models';

interface EnrolledCourseData {
  course: Course;
  progress: StudentProgress;
}

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CourseCardComponent, ProgressBarComponent],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.scss'
})
export class StudentDashboardComponent implements OnInit, AfterViewInit {
  enrolledCourses: EnrolledCourseData[] = [];
  stats: StudentStats = {
    totalCoursesEnrolled: 0,
    totalCoursesCompleted: 0,
    totalLessonsCompleted: 0,
    averageProgress: 0
  };

  constructor(
    private courseService: CourseService,
    private progressService: ProgressService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    // Recharger les données après l'initialisation de la vue
    setTimeout(() => this.loadData(), 100);
  }

  loadData(): void {
    const allProgress = this.progressService.getAllEnrolledCourses();
    
    this.enrolledCourses = allProgress
      .map(progress => {
        const course = this.courseService.getCourseById(progress.courseId);
        return course ? { course, progress } : null;
      })
      .filter((item): item is EnrolledCourseData => item !== null)
      .sort((a, b) => {
        const dateA = a.progress.lastAccessedAt instanceof Date 
          ? a.progress.lastAccessedAt 
          : new Date(a.progress.lastAccessedAt);
        const dateB = b.progress.lastAccessedAt instanceof Date 
          ? b.progress.lastAccessedAt 
          : new Date(b.progress.lastAccessedAt);
        return dateB.getTime() - dateA.getTime();
      });

    this.stats = this.progressService.getStudentStats();
  }

  unenrollCourse(courseId: number): void {
    if (confirm('Êtes-vous sûr de vouloir vous désinscrire de ce cours ? Votre progression sera perdue.')) {
      this.progressService.unenrollFromCourse(courseId);
      this.loadData();
    }
  }

  getLastAccessedText(date: Date | string): string {
    const now = new Date();
    const accessDate = date instanceof Date ? date : new Date(date);
    const diffMs = now.getTime() - accessDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return accessDate.toLocaleDateString('fr-FR');
  }

  get completedCourses(): EnrolledCourseData[] {
    return this.enrolledCourses.filter(item => item.progress.completionPercentage === 100);
  }

  get inProgressCourses(): EnrolledCourseData[] {
    return this.enrolledCourses.filter(item => 
      item.progress.completionPercentage > 0 && item.progress.completionPercentage < 100
    );
  }

  get notStartedCourses(): EnrolledCourseData[] {
    return this.enrolledCourses.filter(item => item.progress.completionPercentage === 0);
  }
}
