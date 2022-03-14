import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-project-modal',
  templateUrl: './project-modal.component.html',
  styleUrls: ['./project-modal.component.css'],
})
export class ProjectModalComponent implements OnInit {
  createProjectForm: FormGroup;
  validationErrors: string[] = [];
  @Input() submitted = new EventEmitter();
  hide: boolean = true;

  constructor(private fb: FormBuilder, public bsModalRef: BsModalRef) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.createProjectForm = this.fb.group({
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
    });
  }

  createProject() {
    this.submitted.emit(true);
    this.bsModalRef.hide();
  }
}
