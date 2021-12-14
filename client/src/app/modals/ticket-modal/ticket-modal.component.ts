import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { take } from 'rxjs/operators';
import { Project } from 'src/app/_models/project';
import { User } from 'src/app/_models/user';
import { AccountService } from 'src/app/_services/account.service';
import { ProjectUsersService } from 'src/app/_services/projectUsers.service';
import { ProjectsService } from 'src/app/_services/projects.service';

@Component({
  selector: 'app-ticket-modal',
  templateUrl: './ticket-modal.component.html',
  styleUrls: ['./ticket-modal.component.css'],
})
export class TicketModalComponent implements OnInit {
  createTicketForm: FormGroup;
  validationErrors: string[] = [];

  user: User;

  disableSubmit: boolean = true;

  usersSearchMatch: string = '';
  usernameListSize: number = 10;
  usernames: string[] = [];
  displayUsernames: string[] = [];
  hideUsers: boolean = true;
  disableUsers: boolean = true;
  disableLoadMoreUsers: boolean = false;

  projectsSearchMatch: string = '';
  projectListSize: number = 10;
  projects: Project[] = [];
  displayProjects: string[] = [];
  hideProjects: boolean = true;
  disableLoadMoreProjects: boolean = false;

  @Input() submitted = new EventEmitter();

  constructor(
    public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private projectUserService: ProjectUsersService,
    private projectService: ProjectsService,
    private accountService: AccountService
  ) {
    this.accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (this.user = user));
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadProjects();
  }

  initializeForm() {
    this.createTicketForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      project: [''],
      assignee: [''],
      submitter: [this.user.username],
      priority: ['Medium'],
      type: ['Bug'],
    });
  }

  loadProjects() {
    this.hideProjects = false;
    this.projectsSearchMatch = this.projectsSearchMatch.toLowerCase();
    this.disableLoadMoreProjects = false;
    if (this.user.roles.includes('Admin')) {
      this.projectService.getProjects().subscribe((response) => {
        this.projects = response;
        this.filterProjects();
        this.hideProjects = true;
      });
    } else {
      this.projectUserService
        .getProjectsForUser(this.user.username)
        .subscribe((response) => {
          this.projects = response;
          this.filterProjects();
          this.hideProjects = true;
        });
    }
  }

  filterProjects() {
    this.hideProjects = false;
    this.hideUsers = true;
    this.disableUsers = true;
    this.disableSubmit = true;
    this.createTicketForm.controls['project'].setValue('');
    var filteredProjects = [];
    var lenFilteredProjects = 0;
    this.projects.forEach((element) => {
      if (element.title.includes(this.projectsSearchMatch)) {
        filteredProjects.push(element.title);
        lenFilteredProjects += 1;
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

  resetProjectListSize() {
    this.projectListSize = 10;
  }

  /*Function called when project is clicked*/
  updateProject(title: string) {
    this.hideProjects = true;
    this.disableUsers = false;
    this.disableSubmit = false;
    this.projectsSearchMatch = title;
    this.createTicketForm.controls['project'].setValue(title);
    this.loadUsers(title);
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
    this.hideUsers = false;
    this.createTicketForm.controls['assignee'].setValue('');
    var filteredUsernames = [];
    var lenFilteredUsernames = 0;
    this.usernames.forEach((element) => {
      if (element.includes(this.usersSearchMatch)) {
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

  loadMoreUsers() {
    this.usernameListSize += 10;
    this.filterUsernames();
  }

  resetListSize() {
    this.usernameListSize = 10;
  }

  updateDeveloper(userName: string) {
    this.hideUsers = true;
    this.usersSearchMatch = userName;
    this.createTicketForm.controls['assignee'].setValue(userName);
  }

  createTicket() {
    this.submitted.emit(true);
    this.bsModalRef.hide();
  }
}
