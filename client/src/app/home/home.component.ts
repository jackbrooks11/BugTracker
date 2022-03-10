import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoggedInUser } from '../_models/loggedInUser';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  registerMode = false;
  forgotPasswordMode = false;
  loggedInUser: LoggedInUser;

  constructor(private accountService: AccountService, private router: Router) {
    accountService.currentUser$.subscribe((val) => {
      this.loggedInUser = val;
    });
  }

  ngOnInit(): void {}

  loginAsDemo() {
    this.accountService.loginAsDemo().subscribe((user) => {
      this.router.navigateByUrl('/');
    });
  }

  registerToggle() {
    this.registerMode = !this.registerMode;
  }

  cancelRegisterMode(event: boolean) {
    this.registerMode = event;
  }

  forgotPasswordToggle() {
    this.forgotPasswordMode = !this.forgotPasswordMode;
  }

  cancelForgotPasswordMode(event: boolean) {
    this.forgotPasswordMode = event;
  }
}
