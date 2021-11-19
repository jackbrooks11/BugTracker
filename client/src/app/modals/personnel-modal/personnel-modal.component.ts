import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Project } from 'src/app/_models/project';
import { ProjectUsersService } from 'src/app/_services/projectUsers.service';

@Component({
  selector: 'app-personnel-modal',
  templateUrl: './personnel-modal.component.html',
  styleUrls: ['./personnel-modal.component.css'],
})
export class PersonnelModalComponent implements OnInit {
  assignUserForm: FormGroup;
  validationErrors: string[] = [];
  project: Project;
  searchMatch: string = '';
  usernames: string[] = [];
  displayUsernames: string[] = [];
  usernameListSize: number = 10;
  disableLoadMoreUsers: boolean = false;
  @Input() submitted = new EventEmitter();
  hide: boolean = true;

  constructor(
    public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private projectUsersService: ProjectUsersService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadUsers(this.project.title);
  }

  initializeForm() {
    this.assignUserForm = this.fb.group({
      username: ['', Validators.required],
    });
  }

  assignUserToProject() {
    this.submitted.emit(true);
    this.bsModalRef.hide();
  }

  loadUsers(projectTitle: string) {
    this.searchMatch = this.searchMatch.toLowerCase();
    this.disableLoadMoreUsers = false;
    this.projectUsersService
      .getMembersNotInProject(projectTitle)
      .subscribe((response) => {
        this.usernames = response;
        this.filterUsernames();
        this.hide = true;
      });
  }

  filterUsernames() {
    this.hide = false;
    this.assignUserForm.controls['username'].setValue('');
    var filteredUsernames = [];
    var lenFilteredUsernames = 0;
    this.usernames.forEach(element => {
      if (element.includes(this.searchMatch)) {
        filteredUsernames.push(element);
        lenFilteredUsernames += 1;
      }
    })
    this.displayUsernames = filteredUsernames.slice(0, this.usernameListSize);
    if (this.displayUsernames.length < this.usernameListSize) {
      this.disableLoadMoreUsers = true;
    }
    else {
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
    this.hide = true;
    this.searchMatch = userName;
    this.assignUserForm.controls['username'].setValue(userName);
  }
}
