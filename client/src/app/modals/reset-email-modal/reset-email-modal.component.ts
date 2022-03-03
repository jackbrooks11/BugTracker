import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { PaginatedUserDto } from 'src/app/_models/paginatedUserDto';

@Component({
  selector: 'app-reset-email-modal',
  templateUrl: './reset-email-modal.component.html',
  styleUrls: ['./reset-email-modal.component.css'],
})
export class ResetEmailModalComponent implements OnInit {
  resetEmailForm: FormGroup;
  validationErrors: string[] = [];
  user: PaginatedUserDto;
  @Input() submitted = new EventEmitter();
  constructor(public bsModalRef: BsModalRef, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }
  
  initializeForm() {
    this.resetEmailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  resetEmail() {
    this.submitted.emit(true);
    this.bsModalRef.hide();
  }
}
