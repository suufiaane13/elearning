import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseCardComponent } from '../../components/course-card/course-card.component';
import { CourseService } from '../../services/course.service';
import { ProgressService } from '../../services/progress.service';
import { CategoryService } from '../../services/category.service';
import { Course, CourseLevel } from '../../models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, CourseCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  allCourses: Course[] = [];
  filteredCourses: Course[] = [];
  
  searchQuery = '';
  selectedLevel = '';
  selectedCategory = '';
  sortBy: 'default' | 'duration' = 'default';
  
  levels: CourseLevel[] = ['Débutant', 'Intermédiaire', 'Avancé'];
  categories: string[] = [];

  constructor(
    private courseService: CourseService,
    private progressService: ProgressService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.categories = this.categoryService.getAllCategories();
    this.loadCourses();
  }

  loadCourses(): void {
    this.allCourses = this.courseService.getAllCourses();
    this.applyFilters();
  }

  applyFilters(): void {
    let courses = [...this.allCourses];

    if (this.searchQuery) {
      courses = this.courseService.searchCourses(this.searchQuery);
    }

    if (this.selectedLevel) {
      courses = courses.filter(c => c.level === this.selectedLevel);
    }

    if (this.selectedCategory) {
      courses = courses.filter(c => c.category === this.selectedCategory);
    }

    switch (this.sortBy) {
      case 'duration':
        courses.sort((a, b) => {
          const aDuration = this.parseDuration(a.duration);
          const bDuration = this.parseDuration(b.duration);
          return aDuration - bDuration;
        });
        break;
    }

    this.filteredCourses = courses;
  }

  private parseDuration(duration: string): number {
    const match = duration.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedLevel = '';
    this.selectedCategory = '';
    this.sortBy = 'default';
    this.applyFilters();
  }

  onEnroll(courseId: number): void {
    this.progressService.enrollInCourse(courseId);
    // Recharger pour mettre à jour l'affichage
    this.loadCourses();
  }

  isEnrolled(courseId: number): boolean {
    return this.progressService.isEnrolled(courseId);
  }

  getProgress(courseId: number): number {
    return this.progressService.getCompletionPercentage(courseId);
  }

  get hasActiveFilters(): boolean {
    return !!(this.searchQuery || this.selectedLevel || this.selectedCategory || this.sortBy !== 'default');
  }
}
