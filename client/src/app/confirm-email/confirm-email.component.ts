import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ConfirmEmailDto } from '../_models/confirmEmailDto';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.css'],
})
export class ConfirmEmailComponent implements OnInit {
  confirmationMessage: string = '';
  validationErrors: string[] = [];

  constructor(
    private accountService: AccountService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.confirmEmail();
  }

  confirmEmail() {
    const confirmEmailDto: ConfirmEmailDto = {
      email: this.route.snapshot.queryParams['email'],
      token: this.route.snapshot.queryParams['token'],
    };
    if (confirmEmailDto.email == null || confirmEmailDto.token == null) {
      this.toastr.error("Email or token missing");
    }
    this.accountService.confirmEmail(confirmEmailDto).subscribe(
      (response) => {
        this.router.navigateByUrl('/');
        this.toastr.success("Email confirmed");
      },
      (error) => {
      }
    );
  }
}
