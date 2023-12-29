import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPanelComponent } from './admin/admin-panel/admin-panel.component';
import { NotFoundComponent } from './errors/not-found/not-found.component';
import { ServerErrorComponent } from './errors/server-error/server-error.component';
import { TestErrorsComponent } from './errors/test-errors/test-errors.component';
import { HomeComponent } from './home/home.component';
import { UserDetailComponent } from './users/user-detail/user-detail.component';
import { UserEditComponent } from './users/user-edit/user-edit.component';
import { UserProjectsComponent } from './users/user-projects/user-projects.component';
import { UserTicketsComponent } from './users/user-tickets/user-tickets.component';
import { ProjectDetailComponent } from './projects/project-detail/project-detail.component';
import { ProjectEditComponent } from './projects/project-edit/project-edit.component';
import { ProjectListComponent } from './projects/project-list/project-list.component';
import { TicketDetailComponent } from './tickets/ticket-detail/ticket-detail.component';
import { TicketEditComponent } from './tickets/ticket-edit/ticket-edit.component';
import { TicketListComponent } from './tickets/ticket-list/ticket-list.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ConfirmEmailComponent } from './confirm-email/confirm-email.component';
import { authGuard } from './_guards/auth.guard';
import { preventUnsavedChangesGuard } from './_guards/prevent-unsaved-changes.guard';
import { adminGuard } from './_guards/admin.guard';
import { hasTicketGuard } from './_guards/has-ticket.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'resetPassword', component: ResetPasswordComponent },
  { path: 'confirmEmail', component: ConfirmEmailComponent },
  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [authGuard],
    children: [
      { path: 'users/:username', component: UserDetailComponent },
      {
        path: 'user/edit',
        component: UserEditComponent,
        canDeactivate: [preventUnsavedChangesGuard],
      },
      { path: 'user/tickets', component: UserTicketsComponent },
      { path: 'user/projects/:id', component: ProjectDetailComponent },
      { path: 'user/projects', component: UserProjectsComponent },
      {
        path: 'tickets/:id/edit',
        component: TicketEditComponent,
        canActivate: [hasTicketGuard],
        canDeactivate: [preventUnsavedChangesGuard],
      },
      { path: 'tickets/:id', component: TicketDetailComponent },
      { path: 'tickets', component: TicketListComponent },
      {
        path: 'admin',
        component: AdminPanelComponent,
        canActivate: [adminGuard],
      },
      {
        path: 'projects/:id/edit',
        component: ProjectEditComponent,
        canActivate: [adminGuard],
      },
      { path: 'projects/:id', component: ProjectDetailComponent },
      { path: 'projects', component: ProjectListComponent },
    ],
  },
  { path: 'errors', component: TestErrorsComponent },
  { path: 'not-found', component: NotFoundComponent },
  { path: 'server-error', component: ServerErrorComponent },
  { path: '**', component: NotFoundComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
