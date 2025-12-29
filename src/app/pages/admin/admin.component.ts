import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseFormComponent } from '../../components/course-form/course-form.component';
import { CourseService } from '../../services/course.service';
import { Course, CourseCreateDto, LessonCreateDto, QuizCreateDto } from '../../models';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, CourseFormComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  courses: Course[] = [];
  selectedCourse?: Course;
  
  showCourseForm = false;
  courseFormMode: 'create' | 'edit' = 'create';
  
  showLessonForm = false;
  lessonFormData: LessonCreateDto = this.getEmptyLesson();
  editingLessonId?: number;

  showQuizForm = false;
  quizFormData: QuizCreateDto = this.getEmptyQuiz();

  constructor(private courseService: CourseService) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.courses = this.courseService.getAllCourses();
  }

  selectCourse(course: Course): void {
    this.selectedCourse = course;
    this.showCourseForm = false;
    this.showLessonForm = false;
    this.showQuizForm = false;
  }

  openCreateCourse(): void {
    this.courseFormMode = 'create';
    this.showCourseForm = true;
    this.selectedCourse = undefined;
  }

  openEditCourse(course: Course): void {
    this.selectedCourse = course;
    this.courseFormMode = 'edit';
    this.showCourseForm = true;
  }

  onSaveCourse(courseDto: CourseCreateDto): void {
    if (this.courseFormMode === 'create') {
      this.courseService.createCourse(courseDto);
    } else if (this.selectedCourse) {
      this.courseService.updateCourse(this.selectedCourse.id, courseDto);
    }
    
    this.loadCourses();
    this.showCourseForm = false;
    this.selectedCourse = undefined;
  }

  onCancelCourseForm(): void {
    this.showCourseForm = false;
    this.selectedCourse = undefined;
  }

  deleteCourse(course: Course): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le cours "${course.title}" ?`)) {
      this.courseService.deleteCourse(course.id);
      this.loadCourses();
      if (this.selectedCourse?.id === course.id) {
        this.selectedCourse = undefined;
      }
    }
  }

  openAddLesson(): void {
    if (!this.selectedCourse) return;
    
    this.lessonFormData = this.getEmptyLesson();
    this.lessonFormData.order = this.selectedCourse.lessons.length + 1;
    this.lessonFormData.duration = '30min';
    this.editingLessonId = undefined;
    this.showLessonForm = true;
  }

  editLesson(lessonId: number): void {
    if (!this.selectedCourse) return;
    
    const lesson = this.selectedCourse.lessons.find(l => l.id === lessonId);
    if (lesson) {
      this.lessonFormData = {
        title: lesson.title,
        content: lesson.content,
        duration: lesson.duration || '30min',
        order: lesson.order
      };
      this.editingLessonId = lessonId;
      this.showLessonForm = true;
    }
  }

  saveLesson(): void {
    if (!this.selectedCourse) return;

    if (!this.lessonFormData.title.trim() || !this.lessonFormData.content.trim()) {
      alert('Le titre et le contenu sont obligatoires');
      return;
    }

    if (this.editingLessonId) {
      this.courseService.updateLesson(this.selectedCourse.id, this.editingLessonId, this.lessonFormData);
    } else {
      this.courseService.addLesson(this.selectedCourse.id, this.lessonFormData);
    }

    this.loadCourses();
    this.selectedCourse = this.courseService.getCourseById(this.selectedCourse.id);
    this.showLessonForm = false;
  }

  deleteLesson(lessonId: number): void {
    if (!this.selectedCourse) return;
    
    if (confirm('Êtes-vous sûr de vouloir supprimer cette leçon ?')) {
      this.courseService.deleteLesson(this.selectedCourse.id, lessonId);
      this.loadCourses();
      this.selectedCourse = this.courseService.getCourseById(this.selectedCourse.id);
    }
  }

  openAddQuiz(): void {
    this.quizFormData = this.getEmptyQuiz();
    this.showQuizForm = true;
  }

  saveQuiz(): void {
    if (!this.selectedCourse) return;
    
    this.courseService.addQuiz(this.selectedCourse.id, this.quizFormData);
    this.loadCourses();
    this.selectedCourse = this.courseService.getCourseById(this.selectedCourse.id);
    this.showQuizForm = false;
  }

  deleteQuiz(quizId: number): void {
    if (!this.selectedCourse) return;
    
    if (confirm('Êtes-vous sûr de vouloir supprimer ce quiz ?')) {
      this.courseService.deleteQuiz(this.selectedCourse.id, quizId);
      this.loadCourses();
      this.selectedCourse = this.courseService.getCourseById(this.selectedCourse.id);
    }
  }

  private getEmptyLesson(): LessonCreateDto {
    return {
      title: '',
      content: '',
      duration: '',
      order: 1
    };
  }

  private getEmptyQuiz(): QuizCreateDto {
    return {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    };
  }

  trackByOption(index: number): number {
    return index;
  }
}
