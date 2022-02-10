import { Component, OnInit } from '@angular/core';
import { LoggedInUser } from './_models/loggedInUser';
import { AccountService } from './_services/account.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'BugTracker';
  users: any;
  showSidebar: boolean = true;

  constructor(public accountService: AccountService) {}

  ngOnInit() {
    this.setCurrentUser();
  }

  setCurrentUser() {
    const user: LoggedInUser = JSON.parse(localStorage.getItem('user'));
    if (user) {
      this.accountService.setCurrentUser(user);
    }
  }

  setShowSidebar(show: boolean) {
    this.showSidebar = show;
  }

}
