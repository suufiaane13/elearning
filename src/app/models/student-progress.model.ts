export interface StudentProgress {
  courseId: number;
  completedLessons: number[];
  startedAt: Date;
  lastAccessedAt: Date;
  completionPercentage: number;
  isEnrolled: boolean;
}

export interface StudentStats {
  totalCoursesEnrolled: number;
  totalCoursesCompleted: number;
  totalLessonsCompleted: number;
  averageProgress: number;
}

