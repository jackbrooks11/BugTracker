import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { LoggedInUser } from './_models/loggedInUser';
import { AccountService } from './_services/account.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'BugTracker';
  users: any;
  showSidebar: boolean = true;

  constructor(public accountService: AccountService) {}

  ngOnInit() {
    document.body.style.background = 'rgba(0, 0, 0, 0.8)';
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
