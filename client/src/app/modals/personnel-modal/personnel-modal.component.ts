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
    this.projectUsersService
      .getUsersNotInProject(projectTitle)
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
    this.usernames.forEach(username => {
      if (username.includes(this.searchMatch.toLowerCase())) {
        filteredUsernames.push(this.toTitleCase(username));
      }
    })
    this.displayUsernames = filteredUsernames;
  }
  
  updateDeveloper(userName: string) {
    this.hide = true;
    this.searchMatch = userName;
    this.assignUserForm.controls['username'].setValue(userName);
  }

  toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }
}
