import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs/operators';
import { Project } from 'src/app/_models/project';
import { Ticket } from 'src/app/_models/ticket';
import { User } from 'src/app/_models/user';
import { AccountService } from 'src/app/_services/account.service';
import { ProjectsService } from 'src/app/_services/projects.service';
import { ProjectUsersService } from 'src/app/_services/projectUsers.service';
import { TicketPropertyChangesService } from 'src/app/_services/ticketPropertyChanges.service';
import { TicketsService } from 'src/app/_services/tickets.service';

@Component({
  selector: 'app-ticket-edit',
  templateUrl: './ticket-edit.component.html',
  styleUrls: ['./ticket-edit.component.css'],
})
export class TicketEditComponent implements OnInit {
  editForm: FormGroup;
  user: User;

  disableSubmit: boolean = false;

  usernameListSize: number = 10;
  usernames: string[] = [];
  displayUsernames: string[] = [];
  hideUsers: boolean = true;
  disableUsers: boolean = false;
  disableLoadMoreUsers: boolean = false;

  projectListSize: number = 10;
  projects: Project[] = [];
  displayProjects: string[] = [];
  hideProjects: boolean = true;
  disableLoadMoreProjects: boolean = true;

  ticket: Ticket;

  @HostListener('window:beforeunload', ['$event']) unloadNotifcation(
    $event: any
  ) {
    if (this.editForm.dirty) {
      $event.returnValue = true;
    }
  }

  constructor(
    private ticketService: TicketsService,
    private fb: FormBuilder,
    private accountService: AccountService,
    private projectService: ProjectsService,
    private projectUserService: ProjectUsersService,
    private ticketPropertyChangeService: TicketPropertyChangesService,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (this.user = user));
  }

  ngOnInit(): void {
    this.loadTicket();
  }

  initializeForm() {
    this.editForm = this.fb.group({
      title: [this.ticket.title],
      description: [this.ticket.description],
      project: [this.ticket.project],
      assignee: [this.ticket.assignee],
      priority: [this.ticket.priority],
      state: [this.ticket.state],
      type: [this.ticket.type],
    });
  }

  loadProjects() {
    if (this.user.roles.includes('Admin')) {
      this.projectService.getProjects().subscribe((response) => {
        this.projects = response;
        this.filterProjects();
      });
    } else {
      this.projectUserService
        .getProjectsForUser(this.user.username)
        .subscribe((response) => {
          this.projects = response;
          this.filterProjects();
        });
    }
  }

  projectInput() {
    this.hideProjects = false;
    this.hideUsers = true;
    this.disableUsers = true;
    this.disableSubmit = true;
    this.onChange();
    this.filterProjects();
  }

  filterProjects() {
    this.editForm.controls['project'].setValue('');
    var filteredProjects = [];
    this.projects.forEach((element) => {
      if (element.title.includes(this.ticket.project)) {
        filteredProjects.push(element.title);
      }
    });
    this.displayProjects = filteredProjects.slice(0, this.projectListSize);
    if (this.displayProjects.length < this.projectListSize) {
      this.disableLoadMoreProjects = true;
    } else {
      this.disableLoadMoreProjects = false;
    }
  }

  loadMoreProjects() {
    this.projectListSize += 10;
    this.filterProjects();
  }

  /*Function called when project is clicked*/
  updateProject(title: string) {
    this.hideProjects = true;
    this.disableUsers = false;
    this.disableSubmit = false;
    this.ticket.project = title;
    this.ticket.assignee = '';
    this.editForm.controls['project'].setValue(title);
    this.editForm.controls['assignee'].setValue('');
    this.loadUsers(title);
  }

  resetProjectListSize() {
    this.projectListSize = 10;
  }

  userInput() {
    this.hideUsers = false;
    this.onChange();
    this.filterUsernames();
  }

  loadUsers(projectTitle: string) {
    if (
      this.user.roles.includes('Admin') ||
      this.user.roles.includes('Project Manager')
    ) {
      this.projectUserService
        .getUsersForProject(projectTitle)
        .subscribe((users) => {
          this.usernames = users;
          this.filterUsernames();
        });
    } else {
      this.usernames = [this.user.username];
      this.filterUsernames();
    }
  }

  filterUsernames() {
    this.disableSubmit = true;
    this.editForm.controls['assignee'].setValue('');
    var filteredUsernames = [];
    var lenFilteredUsernames = 0;
    this.usernames.forEach((element) => {
      if (element.includes(this.ticket.assignee)) {
        filteredUsernames.push(element);
        lenFilteredUsernames += 1;
      }
    });
    this.displayUsernames = filteredUsernames.slice(0, this.usernameListSize);
    if (this.displayUsernames.length < this.usernameListSize) {
      this.disableLoadMoreUsers = true;
    } else {
      this.disableLoadMoreUsers = false;
    }
  }

  resetUserListSize() {
    this.usernameListSize = 10;
  }

  loadMoreUsers() {
    this.usernameListSize += 10;
    this.filterUsernames();
  }

  updateDeveloper(userName: string) {
    this.hideUsers = true;
    this.ticket.assignee = userName;
    this.disableSubmit = false;
    this.editForm.markAsDirty();
    if (userName == 'Unassigned') {
      this.editForm.controls['assignee'].setValue('');
      console.log("HI");
    } else {
      this.editForm.controls['assignee'].setValue(userName);
    }
  }

  loadTicket() {
    this.ticketService
      .getTicket(Number(this.route.snapshot.paramMap.get('id')))
      .subscribe((ticket) => {
        this.ticket = ticket;
        this.initializeForm();
        this.loadUsers(ticket.project);
        this.loadProjects();
      });
  }
  updateTicket() {
    this.ticketService.updateTicket(this.ticket).subscribe(() => {
      this.toastr.success('Ticket updated successfully');
      this.editForm.reset(this.ticket);
      this.ticketPropertyChangeService.changeCache.clear();
      this.onUpdate();
    });
  }

  onChange() {
    this.editForm.markAsDirty();
  }

  onUpdate() {
    this.editForm.markAsPristine();
    this.editForm.markAsUntouched();
    this.hideUsers = true;
  }
}
