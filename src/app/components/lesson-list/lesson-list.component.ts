import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Lesson } from '../../models';

@Component({
  selector: 'app-lesson-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lesson-list.component.html',
  styleUrl: './lesson-list.component.scss'
})
export class LessonListComponent {
  @Input() lessons: Lesson[] = [];
  @Input() completedLessonIds: number[] = [];
  @Output() toggleLesson = new EventEmitter<number>();

  isCompleted(lessonId: number): boolean {
    return this.completedLessonIds.includes(lessonId);
  }

  onToggle(lessonId: number): void {
    this.toggleLesson.emit(lessonId);
  }
}
