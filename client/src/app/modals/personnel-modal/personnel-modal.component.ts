import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Project } from 'src/app/_models/project';
import { User } from 'src/app/_models/user';
import { UserParams } from 'src/app/_models/userParams';
import { MembersService } from 'src/app/_services/members.service';

@Component({
  selector: 'app-personnel-modal',
  templateUrl: './personnel-modal.component.html',
  styleUrls: ['./personnel-modal.component.css'],
})
export class PersonnelModalComponent implements OnInit {
  assignUserForm: FormGroup;
  validationErrors: string[] = [];
  project: Project;
  userParams: UserParams = new UserParams();
  users: User[] = [];
  filteredUsers: User[] = [];
  disableLoadMoreUsers: boolean = false;
  @Input() submitted = new EventEmitter();
  hide: boolean = true;

  constructor(
    public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private memberService: MembersService
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
    this.userParams.searchMatch = this.userParams.searchMatch.toLowerCase();
    this.userParams.pageSize = 10;
    this.memberService
      .getMembersNotInProject(projectTitle, this.userParams)
      .subscribe((response) => {
        this.users = response.result;
        if (response.result.length < this.userParams.pageSize) {
          this.disableLoadMoreUsers = true;
          this.memberService.disableLoadMoreUsers = true;
        }
      });
  }

  loadMoreUsers() {
    this.userParams.pageNumber += 1;
    this.memberService
      .getMembersNotInProject(this.project.title, this.userParams)
      .subscribe((response) => {
        response.result.forEach((element) => this.users.push(element));
        if (response.result.length < this.userParams.pageSize) {
          this.disableLoadMoreUsers = true;
          this.memberService.disableLoadMoreUsers = true;
        }
        this.getFilteredUsers();
      });
  }

  getFilteredUsers() {
    this.hide = false;
    console.log(this.userParams.searchMatch);
    if (this.userParams.searchMatch == '') {
      this.filteredUsers = this.users;
      return;
    }
    this.filteredUsers = [];

    for (let i = 0; i < this.users.length; ++i) {
      if (this.users[i].username.includes(this.userParams.searchMatch)) {
        this.filteredUsers.push(this.users[i]);
      }
    }
  }

  updateDeveloper(userName: string) {
    this.hide = true;
    this.userParams.searchMatch = userName;
    this.assignUserForm.controls['username'].setValue(userName);
  }
}
