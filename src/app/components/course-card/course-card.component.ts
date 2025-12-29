import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Course } from '../../models';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './course-card.component.html',
  styleUrl: './course-card.component.scss'
})
export class CourseCardComponent {
  @Input() course!: Course;
  @Input() progress?: number;
  @Input() isEnrolled = false;
  @Output() enroll = new EventEmitter<number>();

  getLevelBadgeClass(): string {
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

  getCategoryColor(): string {
    switch (this.course.category) {
      case 'Programmation':
        return 'text-blue-600';
      case 'Design':
        return 'text-purple-600';
      case 'Langues':
        return 'text-green-600';
      case 'Marketing':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  }

  onEnroll(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.enroll.emit(this.course.id);
  }
}
