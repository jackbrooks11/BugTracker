import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Pagination } from 'src/app/_models/pagination';
import { Ticket } from 'src/app/_models/ticket';
import { TicketPropertyChange } from 'src/app/_models/ticketPropertyChange';
import { TicketPropertyChangeParams } from 'src/app/_models/ticketPropertyChangeParams';
import { TicketPropertyChangesService } from 'src/app/_services/ticketPropertyChanges.service';

@Component({
  selector: 'app-ticket-history',
  templateUrl: './ticket-history.component.html',
  styleUrls: ['./ticket-history.component.css'],
})
export class TicketHistoryComponent implements OnInit {
  ticket: Ticket;
  ticketPropertyChanges: TicketPropertyChange[] = [];
  ticketPropertyChangeParams: TicketPropertyChangeParams =
    new TicketPropertyChangeParams();
  pagination: Pagination;
  headers: string[] = [
    'Editor',
    'Property',
    'Old Value',
    'New Value',
    'Edited',
  ];
  constructor(
    private ticketPropertyChangeService: TicketPropertyChangesService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.ticketPropertyChangeParams =
      this.ticketPropertyChangeService.getTicketPropertyChangeParams();
  }

  ngOnInit(): void {
    this.loadChanges();
  }

  ngAfterViewChecked() {
    //your code to update the model
    this.cdr.detectChanges();
  }
  updateTable(toggle: boolean, index: number) {
    if (toggle) {
      this.changeIcon(index);
      //New column has been clicked
      if (this.ticketPropertyChangeParams.index != index) {
        //Set old icon to double arrows
        this.ticketPropertyChangeParams.icons[
          this.ticketPropertyChangeParams.index
        ] = 0;
        //New index for column clicked
        this.ticketPropertyChangeParams.index = index;
        this.ticketPropertyChangeParams.ascending = true;
      }
      //Still on same column
      else {
        this.toggleAscending();
      }
    }
    this.ticketPropertyChangeParams.searchMatch =
      this.ticketPropertyChangeParams.searchMatch.toLowerCase();
    this.ticketPropertyChangeService.setTicketPropertyChangeParams(
      this.ticketPropertyChangeParams
    );
  }
  loadChanges(
    toggle: boolean = false,
    index: number = this.ticketPropertyChangeParams.index
  ) {
    this.updateTable(toggle, index);
    this.ticketPropertyChangeService
      .getTicketPropertyChangesPaginated(
        this.ticketPropertyChangeParams,
        Number(this.route.snapshot.paramMap.get('id')),
      )
      .subscribe(
        (changes) => {
          this.pagination = changes.pagination;
          this.ticketPropertyChanges = changes.result;
        },
        (error) => {
          console.log(error);
          this.router.navigateByUrl('/not-found');
        }
      );
  }

  pageChanged(event: any) {
    this.ticketPropertyChangeParams.pageNumber = event.page;
    this.ticketPropertyChangeService.setTicketPropertyChangeParams(
      this.ticketPropertyChangeParams
    );
    this.loadChanges();
  }

  toggleAscending() {
    this.ticketPropertyChangeParams.ascending =
      !this.ticketPropertyChangeParams.ascending;
  }

  changeIcon(index: number) {
    if (this.ticketPropertyChangeParams.icons[index] == 2) {
      --this.ticketPropertyChangeParams.icons[index];
    } else {
      ++this.ticketPropertyChangeParams.icons[index];
    }
  }

  camelize(str: string) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
  }
}
