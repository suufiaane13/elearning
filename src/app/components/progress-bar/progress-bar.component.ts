import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.scss'
})
export class ProgressBarComponent {
  @Input() progress = 0;
  @Input() showLabel = true;
  @Input() height: 'sm' | 'md' | 'lg' = 'md';

  getHeightClass(): string {
    switch (this.height) {
      case 'sm':
        return 'h-2';
      case 'md':
        return 'h-4';
      case 'lg':
        return 'h-6';
      default:
        return 'h-4';
    }
  }

  getColorClass(): string {
    if (this.progress === 100) return 'bg-success-500';
    if (this.progress >= 75) return 'bg-primary-500';
    if (this.progress >= 50) return 'bg-primary-400';
    if (this.progress >= 25) return 'bg-warning-500';
    return 'bg-gray-400';
  }
}
