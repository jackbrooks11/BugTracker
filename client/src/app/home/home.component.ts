import { Component, OnInit } from '@angular/core';
import { User } from '../_models/user';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  registerMode = false;
  user: User;

  constructor(private accountService: AccountService) { 
    accountService.currentUser$.subscribe(val => {
      this.user = val;
    });
  }

  ngOnInit(): void {
    var datee = new Date();
    datee.setDate(datee.getDate() - 1);
    console.log(datee);

  }

  registerToggle() {
    this.registerMode = !this.registerMode;
  }

  cancelRegisterMode(event: boolean) {
    this.registerMode = event;
  }

}
