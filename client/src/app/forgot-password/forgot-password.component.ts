import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ForgotPasswordDto } from '../_models/forgotPasswordDto';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent implements OnInit {
  @Output() cancelForgotPassword = new EventEmitter();
  forgotPasswordForm: FormGroup;
  validationErrors: string[] = [];
  passwordResetSent: boolean = false;

  constructor(
    private accountService: AccountService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.forgotPasswordForm = this.fb.group({
      email: ['', Validators.compose([Validators.email, Validators.required])],
    });
  }

  sendPasswordReset() {
    const forgotPasswordDto: ForgotPasswordDto = {
      email: this.forgotPasswordForm.value.email,
      clientURI: 'https://jacksbugtracker.herokuapp.com/resetPassword',
    };
    this.accountService.forgotPassword(forgotPasswordDto).subscribe(
      (response) => {
        this.passwordResetSent = true;
      },
      (error) => {
        this.validationErrors = error;
      }
    );
  }

  cancel() {
    this.cancelForgotPassword.emit(false);
  }
}
