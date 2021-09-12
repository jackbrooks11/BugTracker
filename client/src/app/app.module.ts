import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { MemberDetailComponent } from './members/member-detail/member-detail.component';
import { SharedModule } from './_modules/shared.module';
import { TestErrorsComponent } from './errors/test-errors/test-errors.component';
import { ErrorInterceptor } from './_interceptors/error.interceptor';
import { NotFoundComponent } from './errors/not-found/not-found.component';
import { ServerErrorComponent } from './errors/server-error/server-error.component';
import { JwtInterceptor } from './_interceptors/jwt.interceptor';
import { TicketListComponent } from './tickets/ticket-list/ticket-list.component';
import { TicketDetailComponent } from './tickets/ticket-detail/ticket-detail.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { MemberEditComponent } from './members/member-edit/member-edit.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { LoadingInterceptor } from './_interceptors/loading.interceptor';
import { TicketEditComponent } from './tickets/ticket-edit/ticket-edit.component';
import { TextInputComponent } from './_forms/text-input/text-input.component';
import { AdminPanelComponent } from './admin/admin-panel/admin-panel.component';
import { HasRoleDirective } from './_directives/has-role.directive';
import { UserManagementComponent } from './admin/user-management/user-management.component';
import { RolesModalComponent } from './modals/roles-modal/roles-modal.component';
import { MemberTicketsComponent } from './members/member-tickets/member-tickets.component';
import { TicketModalComponent } from './modals/ticket-modal/ticket-modal.component';
import { ProjectListComponent } from './projects/project-list/project-list.component';
import { ProjectModalComponent } from './modals/project-modal/project-modal.component';
import { MemberProjectsComponent } from './members/member-projects/member-projects.component';
import { ProjectDetailComponent } from './projects/project-detail/project-detail.component';
import { ProjectPersonnelComponent } from './projects/project-personnel/project-personnel.component';
import { ProjectTicketsComponent } from './projects/project-tickets/project-tickets.component';
import { PersonnelModalComponent } from './modals/personnel-modal/personnel-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    HomeComponent,
    RegisterComponent,
    MemberDetailComponent,
    MemberEditComponent,
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
    UserManagementComponent,
    RolesModalComponent,
    MemberTicketsComponent,
    TicketModalComponent,
    ProjectListComponent,
    ProjectModalComponent,
    MemberProjectsComponent,
    ProjectDetailComponent,
    ProjectPersonnelComponent,
    ProjectTicketsComponent,
    PersonnelModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    SharedModule,
    NgxSpinnerModule
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
