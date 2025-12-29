import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LessonListComponent } from '../../components/lesson-list/lesson-list.component';
import { ProgressBarComponent } from '../../components/progress-bar/progress-bar.component';
import { CourseService } from '../../services/course.service';
import { ProgressService } from '../../services/progress.service';
import { Course, Quiz } from '../../models';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LessonListComponent, ProgressBarComponent],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.scss'
})
export class CourseDetailComponent implements OnInit {
  course?: Course;
  completedLessonIds: number[] = [];
  progress = 0;
  isEnrolled = false;

  showQuiz = false;
  currentQuizIndex = 0;
  selectedAnswers: number[] = [];
  quizCompleted = false;
  quizScore = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private progressService: ProgressService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const courseId = +params['id'];
      this.loadCourse(courseId);
    });
  }

  loadCourse(courseId: number): void {
    this.course = this.courseService.getCourseById(courseId);
    
    if (!this.course) {
      this.router.navigate(['/']);
      return;
    }

    this.isEnrolled = this.progressService.isEnrolled(courseId);
    
    if (this.isEnrolled) {
      const progressData = this.progressService.getProgress(courseId);
      this.completedLessonIds = progressData?.completedLessons || [];
      this.progress = this.progressService.getCompletionPercentage(courseId);
    }

    this.selectedAnswers = new Array(this.course.quizzes.length).fill(-1);
  }

  onEnroll(): void {
    if (this.course) {
      this.progressService.enrollInCourse(this.course.id);
      this.isEnrolled = true;
      this.loadCourse(this.course.id);
    }
  }

  onToggleLesson(lessonId: number): void {
    if (this.course && this.isEnrolled) {
      this.progressService.toggleLessonCompletion(this.course.id, lessonId);
      this.loadCourse(this.course.id);
    } else if (this.course && !this.isEnrolled) {
      this.onEnroll();
      setTimeout(() => {
        this.onToggleLesson(lessonId);
      }, 100);
    }
  }

  startQuiz(): void {
    this.showQuiz = true;
    this.currentQuizIndex = 0;
    this.quizCompleted = false;
  }

  selectAnswer(answerIndex: number): void {
    this.selectedAnswers[this.currentQuizIndex] = answerIndex;
  }

  nextQuestion(): void {
    if (this.course && this.currentQuizIndex < this.course.quizzes.length - 1) {
      this.currentQuizIndex++;
    }
  }

  previousQuestion(): void {
    if (this.currentQuizIndex > 0) {
      this.currentQuizIndex--;
    }
  }

  submitQuiz(): void {
    if (!this.course) return;

    let correctAnswers = 0;
    this.course.quizzes.forEach((quiz, index) => {
      if (this.selectedAnswers[index] === quiz.correctAnswer) {
        correctAnswers++;
      }
    });

    this.quizScore = Math.round((correctAnswers / this.course.quizzes.length) * 100);
    this.quizCompleted = true;
  }

  closeQuiz(): void {
    this.showQuiz = false;
    this.currentQuizIndex = 0;
    this.quizCompleted = false;
    this.selectedAnswers = this.course ? new Array(this.course.quizzes.length).fill(-1) : [];
  }

  getLevelBadgeClass(): string {
    if (!this.course) return '';
    switch (this.course.level) {
      case 'Débutant':
        return 'badge-beginner';
      case 'Intermédiaire':
        return 'badge-intermediate';
      case 'Avancé':
        return 'badge-advanced';
      default:
        return 'badge-beginner';
    }
  }

  get canSubmitQuiz(): boolean {
    return this.selectedAnswers.every(answer => answer !== -1);
  }

  get currentQuiz(): Quiz | undefined {
    return this.course?.quizzes[this.currentQuizIndex];
  }

  get answeredQuestionsCount(): number {
    return this.selectedAnswers.filter(a => a !== -1).length;
  }
}
