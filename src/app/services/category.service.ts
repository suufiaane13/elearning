import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly STORAGE_KEY = 'course_categories';
  private categories: string[] = [];

  constructor() {
    this.loadCategories();
  }

  private loadCategories(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      this.categories = JSON.parse(stored);
    } else {
      this.categories = ['Programmation', 'Design', 'Langues', 'Marketing'];
      this.saveCategories();
    }
  }

  private saveCategories(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.categories));
  }

  getAllCategories(): string[] {
    return [...this.categories];
  }

  addCategory(category: string): boolean {
    const trimmed = category.trim();
    if (!trimmed || this.categories.includes(trimmed)) {
      return false;
    }
    this.categories.push(trimmed);
    this.categories.sort();
    this.saveCategories();
    return true;
  }

  deleteCategory(category: string): boolean {
    const index = this.categories.indexOf(category);
    if (index === -1) return false;
    
    this.categories.splice(index, 1);
    this.saveCategories();
    return true;
  }
}

