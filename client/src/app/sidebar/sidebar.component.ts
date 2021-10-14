import { Component, OnInit } from '@angular/core';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  show: boolean = true;
  showTicketDropdown: boolean = false;
  showProjectDropdown: boolean = false;

  constructor(public accountService: AccountService) { }

  ngOnInit(): void {
  }
  
  toggleShow() {
    this.show = !this.show;
  }

  toggleTicketDropdown() {
    console.log("HI");
    this.showTicketDropdown = !this.showTicketDropdown;
  }

  toggleProjectDropdown() {
    this.showProjectDropdown = !this.showProjectDropdown;
  }
}
