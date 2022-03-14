import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { take } from 'rxjs/operators';
import { Project } from 'src/app/_models/project';
import { LoggedInUser } from 'src/app/_models/loggedInUser';
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

  loggedInUser: LoggedInUser;

  disableSubmit: boolean = true;

  usersSearchMatch: string = '';
  usernames: string[] = [];
  displayUsernames: string[] = [];
  hideUsers: boolean = true;
  disableUsers: boolean = true;

  projectsSearchMatch: string = '';
  projects: Project[] = [];
  displayProjects: string[] = [];
  hideProjects: boolean = true;

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
      .subscribe((loggedInUser) => (this.loggedInUser = loggedInUser));
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadProjects();
  }

  initializeForm() {
    this.createTicketForm = this.fb.group({
      title: [
        '',
        Validators.compose([
          Validators.pattern(/^(([a-z|A-Z]+(?: [a-z|A-Z]+)*)|)$/),
          Validators.minLength(6),
          Validators.maxLength(25),
          Validators.required,
        ]),
      ],
      description: [
        '',
        Validators.compose([
          Validators.pattern(/^(([\S]+(?: [\S]+)*)|)$/),
          Validators.minLength(10),
          Validators.maxLength(100),
          Validators.required,
        ]),
      ],
      project: [''],
      assignee: [''],
      submitter: [this.loggedInUser.username],
      priority: ['Medium'],
      type: ['Bug'],
    });
  }

  loadProjects() {
    this.hideProjects = false;
    this.projectsSearchMatch = this.projectsSearchMatch.toLowerCase();
    if (this.loggedInUser.roles.includes('Admin')) {
      this.projectService.getProjects().subscribe((response) => {
        this.projects = response;
        this.filterProjects();
        this.hideProjects = true;
      });
    } else {
      this.projectUserService
        .getProjectsForUser(this.loggedInUser.username)
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
    this.projects.forEach((project) => {
      if (
        project.title
          .toLowerCase()
          .includes(this.projectsSearchMatch.toLowerCase())
      ) {
        filteredProjects.push(
          this.toTitleCase(this.toTitleCase(project.title))
        );
      }
    });
    this.displayProjects = filteredProjects;
    this.displayProjects.sort();
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
      this.loggedInUser.roles.includes('Admin') ||
      this.loggedInUser.roles.includes('Project Manager')
    ) {
      this.projectUserService
        .getUsersForProject(projectTitle)
        .subscribe((users) => {
          this.usernames = users;
          this.filterUsernames();
        });
    } else {
      this.usernames = [this.loggedInUser.username];
      this.filterUsernames();
    }
  }

  filterUsernames() {
    this.hideUsers = false;
    this.disableSubmit = true;
    this.createTicketForm.controls['assignee'].setValue('');
    var filteredUsernames = [];
    this.usernames.forEach((username) => {
      if (
        username.toLowerCase().includes(this.usersSearchMatch.toLowerCase())
      ) {
        filteredUsernames.push(this.toTitleCase(username));
      }
    });
    this.displayUsernames = filteredUsernames;
    this.displayUsernames.sort();
  }

  updateDeveloper(userName: string) {
    this.disableSubmit = false;
    this.hideUsers = true;
    this.usersSearchMatch = userName;
    if (userName == 'Unassigned') {
      this.createTicketForm.controls['assignee'].setValue('');
    } else {
      this.createTicketForm.controls['assignee'].setValue(userName);
    }
  }

  createTicket() {
    this.submitted.emit(true);
    this.bsModalRef.hide();
  }

  toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }
}
