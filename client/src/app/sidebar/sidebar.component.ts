import { Component, EventEmitter, OnInit, Output } from '@angular/core';
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
  @Output() onToggleShow = new EventEmitter<any>();

  constructor(public accountService: AccountService) { }

  ngOnInit(): void {
  }
  
  toggleShow() {
    this.show = !this.show;
    this.onToggleShow.emit(this.show);
  }

  toggleTicketDropdown() {
    this.showTicketDropdown = !this.showTicketDropdown;
  }

  toggleProjectDropdown() {
    this.showProjectDropdown = !this.showProjectDropdown;
  }
}
