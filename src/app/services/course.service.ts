import { Injectable } from '@angular/core';
import { Course, CourseCreateDto, Lesson, LessonCreateDto, Quiz, QuizCreateDto } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private readonly STORAGE_KEY = 'courses';
  private courses: Course[] = [];

  constructor() {
    this.loadCourses();
  }

  private loadCourses(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      this.courses = JSON.parse(stored, (key, value) => {
        if (key === 'createdAt' || key === 'updatedAt') {
          return new Date(value);
        }
        return value;
      });
    } else {
      this.initializeMockData();
    }
  }

  private saveCourses(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.courses));
  }

  getAllCourses(): Course[] {
    return [...this.courses];
  }

  getCourseById(id: number): Course | undefined {
    return this.courses.find(course => course.id === id);
  }

  getCoursesByLevel(level: string): Course[] {
    return this.courses.filter(course => course.level === level);
  }

  getCoursesByCategory(category: string): Course[] {
    return this.courses.filter(course => course.category === category);
  }

  searchCourses(query: string): Course[] {
    const lowerQuery = query.toLowerCase();
    return this.courses.filter(course => 
      course.title.toLowerCase().includes(lowerQuery) ||
      course.description.toLowerCase().includes(lowerQuery)
    );
  }

  sortCoursesByDuration(): Course[] {
    return [...this.courses].sort((a, b) => {
      const aDuration = this.parseDuration(a.duration);
      const bDuration = this.parseDuration(b.duration);
      return aDuration - bDuration;
    });
  }

  private parseDuration(duration: string): number {
    const match = duration.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  createCourse(courseDto: CourseCreateDto): Course {
    const newCourse: Course = {
      id: this.generateId(),
      ...courseDto,
      lessons: [],
      quizzes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.courses.push(newCourse);
    this.saveCourses();
    return newCourse;
  }

  updateCourse(id: number, updates: Partial<CourseCreateDto>): Course | null {
    const index = this.courses.findIndex(c => c.id === id);
    if (index === -1) return null;

    this.courses[index] = {
      ...this.courses[index],
      ...updates,
      updatedAt: new Date()
    };
    
    this.saveCourses();
    return this.courses[index];
  }

  deleteCourse(id: number): boolean {
    const index = this.courses.findIndex(c => c.id === id);
    if (index === -1) return false;

    this.courses.splice(index, 1);
    this.saveCourses();
    return true;
  }

  addLesson(courseId: number, lessonDto: LessonCreateDto): Lesson | null {
    const course = this.courses.find(c => c.id === courseId);
    if (!course) return null;

    const newLesson: Lesson = {
      id: this.generateId(),
      ...lessonDto,
      completed: false
    };

    course.lessons.push(newLesson);
    course.lessons.sort((a, b) => a.order - b.order);
    course.updatedAt = new Date();
    
    this.saveCourses();
    return newLesson;
  }

  updateLesson(courseId: number, lessonId: number, updates: Partial<LessonCreateDto>): Lesson | null {
    const course = this.courses.find(c => c.id === courseId);
    if (!course) return null;

    const lessonIndex = course.lessons.findIndex(l => l.id === lessonId);
    if (lessonIndex === -1) return null;

    course.lessons[lessonIndex] = {
      ...course.lessons[lessonIndex],
      ...updates
    };
    
    course.updatedAt = new Date();
    this.saveCourses();
    return course.lessons[lessonIndex];
  }

  deleteLesson(courseId: number, lessonId: number): boolean {
    const course = this.courses.find(c => c.id === courseId);
    if (!course) return false;

    const index = course.lessons.findIndex(l => l.id === lessonId);
    if (index === -1) return false;

    course.lessons.splice(index, 1);
    course.updatedAt = new Date();
    this.saveCourses();
    return true;
  }

  addQuiz(courseId: number, quizDto: QuizCreateDto): Quiz | null {
    const course = this.courses.find(c => c.id === courseId);
    if (!course) return null;

    const newQuiz: Quiz = {
      id: this.generateId(),
      ...quizDto
    };

    course.quizzes.push(newQuiz);
    course.updatedAt = new Date();
    
    this.saveCourses();
    return newQuiz;
  }

  deleteQuiz(courseId: number, quizId: number): boolean {
    const course = this.courses.find(c => c.id === courseId);
    if (!course) return false;

    const index = course.quizzes.findIndex(q => q.id === quizId);
    if (index === -1) return false;

    course.quizzes.splice(index, 1);
    course.updatedAt = new Date();
    this.saveCourses();
    return true;
  }


  private generateId(): number {
    const maxCourseId = this.courses.length > 0 
      ? Math.max(...this.courses.map(c => c.id))
      : 0;
    
    const maxLessonId = this.courses.length > 0
      ? Math.max(0, ...this.courses.flatMap(c => c.lessons.map(l => l.id)))
      : 0;
    
    const maxQuizId = this.courses.length > 0
      ? Math.max(0, ...this.courses.flatMap(c => c.quizzes.map(q => q.id)))
      : 0;
    
    return Math.max(maxCourseId, maxLessonId, maxQuizId) + 1;
  }

  private initializeMockData(): void {
    this.courses = [
      {
        id: 1,
        title: 'Initiation à Angular',
        description: 'Découverte du framework Angular et de ses composants. Apprenez les bases de ce framework puissant pour créer des applications web modernes.',
        level: 'Débutant',
        category: 'Programmation',
        duration: '4h',
        thumbnail: 'https://via.placeholder.com/400x200/FF0000/FFFFFF?text=Angular',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        lessons: [
          {
            id: 101,
            title: 'Introduction à Angular',
            content: 'Dans cette leçon, vous allez découvrir ce qu\'est Angular, son histoire et pourquoi l\'utiliser.',
            duration: '30min',
            completed: false,
            order: 1
          },
          {
            id: 102,
            title: 'Composants et Templates',
            content: 'Apprenez à créer vos premiers composants et à utiliser les templates Angular.',
            duration: '45min',
            completed: false,
            order: 2
          },
          {
            id: 103,
            title: 'Data Binding',
            content: 'Maîtrisez les différents types de binding: interpolation, property binding, event binding.',
            duration: '40min',
            completed: false,
            order: 3
          },
          {
            id: 104,
            title: 'Directives',
            content: 'Découvrez les directives structurelles et attributaires d\'Angular.',
            duration: '35min',
            completed: false,
            order: 4
          },
          {
            id: 105,
            title: 'Services et Dependency Injection',
            content: 'Comprenez le système d\'injection de dépendances et créez vos premiers services.',
            duration: '50min',
            completed: false,
            order: 5
          }
        ],
        quizzes: [
          {
            id: 1001,
            question: 'Qu\'est-ce qu\'un composant Angular ?',
            options: [
              'Une fonction JavaScript',
              'Une classe TypeScript avec un décorateur @Component',
              'Un fichier HTML',
              'Un service'
            ],
            correctAnswer: 1
          },
          {
            id: 1002,
            question: 'Quelle directive permet de boucler sur un tableau ?',
            options: [
              '*ngIf',
              '*ngSwitch',
              '*ngFor',
              '*ngModel'
            ],
            correctAnswer: 2
          }
        ]
      },
      {
        id: 2,
        title: 'TypeScript Avancé',
        description: 'Maîtrisez TypeScript avec les concepts avancés: generics, decorators, types utilitaires et plus encore.',
        level: 'Avancé',
        category: 'Programmation',
        duration: '6h',
        thumbnail: 'https://via.placeholder.com/400x200/3178C6/FFFFFF?text=TypeScript',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20'),
        lessons: [
          {
            id: 201,
            title: 'Generics',
            content: 'Découvrez la puissance des types génériques en TypeScript.',
            duration: '60min',
            completed: false,
            order: 1
          },
          {
            id: 202,
            title: 'Decorators',
            content: 'Apprenez à créer et utiliser des décorateurs personnalisés.',
            duration: '70min',
            completed: false,
            order: 2
          },
          {
            id: 203,
            title: 'Types Utilitaires',
            content: 'Maîtrisez Partial, Pick, Omit, Record et autres types utilitaires.',
            duration: '50min',
            completed: false,
            order: 3
          },
          {
            id: 204,
            title: 'Advanced Patterns',
            content: 'Design patterns et bonnes pratiques avec TypeScript.',
            duration: '80min',
            completed: false,
            order: 4
          }
        ],
        quizzes: [
          {
            id: 2001,
            question: 'Que permet de faire un type générique ?',
            options: [
              'Créer des types réutilisables',
              'Supprimer du code',
              'Accélérer l\'application',
              'Rien de spécial'
            ],
            correctAnswer: 0
          }
        ]
      },
      {
        id: 3,
        title: 'Design UI/UX avec Figma',
        description: 'Créez des interfaces modernes et attractives avec Figma. De la maquette au prototype interactif.',
        level: 'Intermédiaire',
        category: 'Design',
        duration: '5h',
        thumbnail: 'https://via.placeholder.com/400x200/F24E1E/FFFFFF?text=Figma',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
        lessons: [
          {
            id: 301,
            title: 'Interface de Figma',
            content: 'Familiarisez-vous avec l\'interface et les outils de base.',
            duration: '40min',
            completed: false,
            order: 1
          },
          {
            id: 302,
            title: 'Composants et Variants',
            content: 'Créez des composants réutilisables et leurs variantes.',
            duration: '60min',
            completed: false,
            order: 2
          },
          {
            id: 303,
            title: 'Auto Layout',
            content: 'Maîtrisez l\'Auto Layout pour des designs responsives.',
            duration: '55min',
            completed: false,
            order: 3
          },
          {
            id: 304,
            title: 'Prototypage',
            content: 'Créez des prototypes interactifs avec des transitions.',
            duration: '65min',
            completed: false,
            order: 4
          },
          {
            id: 305,
            title: 'Design System',
            content: 'Construisez un design system complet et cohérent.',
            duration: '80min',
            completed: false,
            order: 5
          }
        ],
        quizzes: [
          {
            id: 3001,
            question: 'À quoi sert l\'Auto Layout dans Figma ?',
            options: [
              'À créer des animations',
              'À rendre les designs responsives',
              'À exporter des images',
              'À partager des fichiers'
            ],
            correctAnswer: 1
          }
        ]
      },
      {
        id: 4,
        title: 'Anglais des Affaires',
        description: 'Améliorez votre anglais professionnel: emails, réunions, présentations et négociations.',
        level: 'Intermédiaire',
        category: 'Langues',
        duration: '8h',
        thumbnail: 'https://via.placeholder.com/400x200/0052B4/FFFFFF?text=English',
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-05'),
        lessons: [
          {
            id: 401,
            title: 'Email Professionnel',
            content: 'Rédigez des emails professionnels clairs et efficaces.',
            duration: '60min',
            completed: false,
            order: 1
          },
          {
            id: 402,
            title: 'Réunions en Anglais',
            content: 'Participez activement aux réunions en anglais.',
            duration: '70min',
            completed: false,
            order: 2
          },
          {
            id: 403,
            title: 'Présentations',
            content: 'Structurez et livrez des présentations impactantes.',
            duration: '80min',
            completed: false,
            order: 3
          },
          {
            id: 404,
            title: 'Négociation',
            content: 'Techniques de négociation en anglais des affaires.',
            duration: '90min',
            completed: false,
            order: 4
          }
        ],
        quizzes: [
          {
            id: 4001,
            question: 'Comment commencer un email professionnel formel ?',
            options: [
              'Hey!',
              'Dear Sir/Madam,',
              'Yo,',
              'Salut,'
            ],
            correctAnswer: 1
          }
        ]
      },
      {
        id: 5,
        title: 'Tailwind CSS',
        description: 'Maîtrisez le framework CSS utility-first pour créer des interfaces modernes rapidement.',
        level: 'Débutant',
        category: 'Programmation',
        duration: '3h',
        thumbnail: 'https://via.placeholder.com/400x200/38B2AC/FFFFFF?text=Tailwind',
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-12'),
        lessons: [
          {
            id: 501,
            title: 'Introduction à Tailwind',
            content: 'Découvrez la philosophie utility-first de Tailwind CSS.',
            duration: '30min',
            completed: false,
            order: 1
          },
          {
            id: 502,
            title: 'Classes Utilitaires',
            content: 'Explorez les classes utilitaires pour le layout, spacing, colors.',
            duration: '50min',
            completed: false,
            order: 2
          },
          {
            id: 503,
            title: 'Responsive Design',
            content: 'Créez des designs responsives avec les breakpoints Tailwind.',
            duration: '40min',
            completed: false,
            order: 3
          },
          {
            id: 504,
            title: 'Personnalisation',
            content: 'Customisez Tailwind avec votre propre configuration.',
            duration: '40min',
            completed: false,
            order: 4
          }
        ],
        quizzes: [
          {
            id: 5001,
            question: 'Que signifie "utility-first" ?',
            options: [
              'Utiliser JavaScript en premier',
              'Utiliser des classes CSS atomiques',
              'Utiliser Bootstrap',
              'Utiliser des frameworks backend'
            ],
            correctAnswer: 1
          }
        ]
      },
      {
        id: 6,
        title: 'Marketing Digital',
        description: 'Stratégies complètes de marketing digital: SEO, réseaux sociaux, email marketing et analytics.',
        level: 'Intermédiaire',
        category: 'Marketing',
        duration: '7h',
        thumbnail: 'https://via.placeholder.com/400x200/FF6B6B/FFFFFF?text=Marketing',
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-08'),
        lessons: [
          {
            id: 601,
            title: 'Fondamentaux du Marketing Digital',
            content: 'Les bases du marketing en ligne et les différents canaux.',
            duration: '60min',
            completed: false,
            order: 1
          },
          {
            id: 602,
            title: 'SEO et SEA',
            content: 'Optimisation pour les moteurs de recherche et publicité.',
            duration: '80min',
            completed: false,
            order: 2
          },
          {
            id: 603,
            title: 'Social Media Marketing',
            content: 'Stratégies pour Facebook, Instagram, LinkedIn et Twitter.',
            duration: '70min',
            completed: false,
            order: 3
          },
          {
            id: 604,
            title: 'Email Marketing',
            content: 'Créez des campagnes email performantes.',
            duration: '60min',
            completed: false,
            order: 4
          },
          {
            id: 605,
            title: 'Analytics et Mesure',
            content: 'Mesurez et analysez vos performances marketing.',
            duration: '70min',
            completed: false,
            order: 5
          }
        ],
        quizzes: [
          {
            id: 6001,
            question: 'Que signifie SEO ?',
            options: [
              'Social Engine Optimization',
              'Search Engine Optimization',
              'Simple Email Operation',
              'Secure Email Online'
            ],
            correctAnswer: 1
          }
        ]
      }
    ];
    
    this.saveCourses();
  }
}

