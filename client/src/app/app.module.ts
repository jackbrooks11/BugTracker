import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { UserDetailComponent } from './users/user-detail/user-detail.component';
import { SharedModule } from './_modules/shared.module';
import { TestErrorsComponent } from './errors/test-errors/test-errors.component';
import { ErrorInterceptor } from './_interceptors/error.interceptor';
import { NotFoundComponent } from './errors/not-found/not-found.component';
import { ServerErrorComponent } from './errors/server-error/server-error.component';
import { JwtInterceptor } from './_interceptors/jwt.interceptor';
import { TicketListComponent } from './tickets/ticket-list/ticket-list.component';
import { TicketDetailComponent } from './tickets/ticket-detail/ticket-detail.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { UserEditComponent } from './users/user-edit/user-edit.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { LoadingInterceptor } from './_interceptors/loading.interceptor';
import { TicketEditComponent } from './tickets/ticket-edit/ticket-edit.component';
import { TextInputComponent } from './_forms/text-input/text-input.component';
import { AdminPanelComponent } from './admin/admin-panel/admin-panel.component';
import { HasRoleDirective } from './_directives/has-role.directive';
import { NotHaveRoleDirective } from './_directives/not-have-role.directive';
import { UserManagementComponent } from './admin/user-management/user-management.component';
import { RolesModalComponent } from './modals/roles-modal/roles-modal.component';
import { UserTicketsComponent } from './users/user-tickets/user-tickets.component';
import { TicketModalComponent } from './modals/ticket-modal/ticket-modal.component';
import { ProjectListComponent } from './projects/project-list/project-list.component';
import { ProjectModalComponent } from './modals/project-modal/project-modal.component';
import { UserProjectsComponent } from './users/user-projects/user-projects.component';
import { ProjectDetailComponent } from './projects/project-detail/project-detail.component';
import { ProjectPersonnelComponent } from './projects/project-personnel/project-personnel.component';
import { ProjectTicketsComponent } from './projects/project-tickets/project-tickets.component';
import { PersonnelModalComponent } from './modals/personnel-modal/personnel-modal.component';
import { ProjectEditComponent } from './projects/project-edit/project-edit.component';
import { TicketCommentsComponent } from './tickets/ticket-comments/ticket-comments.component';
import { NgChartsModule } from 'ng2-charts';
import { UserPhotoComponent } from './users/user-photo/user-photo.component';
import { TypeChartComponent } from './charts/type-chart/type-chart.component';
import { StatusChartComponent } from './charts/status-chart/status-chart.component';
import { PriorityChartComponent } from './charts/priority-chart/priority-chart.component';
import { TicketHistoryComponent } from './tickets/ticket-history/ticket-history.component';
import { StatusLineChartComponent } from './charts/status-line-chart/status-line-chart.component';
import { UserCountChartComponent } from './charts/user-count-chart/user-count-chart.component';
import { HasTicketDirective } from './_directives/has-ticket.directive';
import { TicketInfoComponent } from './tickets/ticket-info/ticket-info.component';
import { LoginComponent } from './login/login.component';
import { ChartCollectionComponent } from './chart-collection/chart-collection.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ConfirmEmailComponent } from './confirm-email/confirm-email.component';
import { ResetPasswordModalComponent } from './modals/reset-password-modal/reset-password-modal.component';
import { ResetEmailModalComponent } from './modals/reset-email-modal/reset-email-modal.component';
import { UserModalComponent } from './modals/user-modal/user-modal.component';
@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    HomeComponent,
    RegisterComponent,
    UserDetailComponent,
    UserEditComponent,
    TestErrorsComponent,
    NotFoundComponent,
    ServerErrorComponent,
    TicketListComponent,
    TicketDetailComponent,
    SidebarComponent,
    TicketEditComponent,
    TextInputComponent,
    AdminPanelComponent,
    HasRoleDirective,
    NotHaveRoleDirective,
    HasTicketDirective,
    UserManagementComponent,
    RolesModalComponent,
    UserTicketsComponent,
    TicketModalComponent,
    ProjectListComponent,
    ProjectModalComponent,
    UserProjectsComponent,
    ProjectDetailComponent,
    ProjectPersonnelComponent,
    ProjectTicketsComponent,
    PersonnelModalComponent,
    ProjectEditComponent,
    TicketCommentsComponent,
    UserPhotoComponent,
    TypeChartComponent,
    StatusChartComponent,
    PriorityChartComponent,
    TicketHistoryComponent,
    StatusLineChartComponent,
    UserCountChartComponent,
    TicketInfoComponent,
    LoginComponent,
    ChartCollectionComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    ConfirmEmailComponent,
    ResetPasswordModalComponent,
    ResetEmailModalComponent,
    UserModalComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    SharedModule,
    NgxSpinnerModule,
    NgChartsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
