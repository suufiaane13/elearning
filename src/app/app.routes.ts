import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CourseDetailComponent } from './pages/course-detail/course-detail.component';
import { StudentDashboardComponent } from './pages/student-dashboard/student-dashboard.component';
import { AdminComponent } from './pages/admin/admin.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Accueil - E-Learning'
  },
  {
    path: 'course/:id',
    component: CourseDetailComponent,
    title: 'Détail du cours - E-Learning'
  },
  {
    path: 'student',
    component: StudentDashboardComponent,
    title: 'Mon Espace - E-Learning'
  },
  {
    path: 'admin',
    component: AdminComponent,
    title: 'Administration - E-Learning'
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
