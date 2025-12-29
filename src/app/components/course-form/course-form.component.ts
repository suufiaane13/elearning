import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Course, CourseCreateDto, CourseLevel } from '../../models';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './course-form.component.html',
  styleUrl: './course-form.component.scss'
})
export class CourseFormComponent implements OnInit {
  @Input() course?: Course;
  @Input() mode: 'create' | 'edit' = 'create';
  @Output() save = new EventEmitter<CourseCreateDto>();
  @Output() cancelForm = new EventEmitter<void>();

  formData: CourseCreateDto = {
    title: '',
    description: '',
    level: 'Débutant',
    category: 'Programmation',
    duration: ''
  };

  levels: CourseLevel[] = ['Débutant', 'Intermédiaire', 'Avancé'];
  categories: string[] = [];

  showAddCategory = false;
  newCategoryName = '';

  errors: Record<string, string> = {};

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
    
    if (this.course && this.mode === 'edit') {
      this.formData = {
        title: this.course.title,
        description: this.course.description,
        level: this.course.level,
        category: this.course.category,
        duration: this.course.duration,
        thumbnail: this.course.thumbnail
      };
    }
  }

  loadCategories(): void {
    this.categories = this.categoryService.getAllCategories();
    if (this.categories.length > 0 && !this.formData.category) {
      this.formData.category = this.categories[0];
    }
  }

  toggleAddCategory(): void {
    this.showAddCategory = !this.showAddCategory;
    this.newCategoryName = '';
  }

  addNewCategory(): void {
    if (this.categoryService.addCategory(this.newCategoryName)) {
      this.loadCategories();
      this.formData.category = this.newCategoryName.trim();
      this.showAddCategory = false;
      this.newCategoryName = '';
    } else {
      alert('Cette catégorie existe déjà ou le nom est invalide');
    }
  }

  validate(): boolean {
    this.errors = {};

    if (!this.formData.title.trim()) {
      this.errors['title'] = 'Le titre est obligatoire';
    }

    if (!this.formData.description.trim()) {
      this.errors['description'] = 'La description est obligatoire';
    }

    if (!this.formData.duration.trim()) {
      this.errors['duration'] = 'La durée est obligatoire';
    } else if (!/^\d+h?$/.test(this.formData.duration.trim())) {
      this.errors['duration'] = 'Format invalide (ex: 4h, 30min)';
    }

    return Object.keys(this.errors).length === 0;
  }

  onSubmit(): void {
    if (this.validate()) {
      this.save.emit(this.formData);
    }
  }

  onCancel(): void {
    this.cancelForm.emit();
  }
}
