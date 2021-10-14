import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Pagination } from 'src/app/_models/pagination';
import { Project } from 'src/app/_models/project';
import { Ticket } from 'src/app/_models/ticket';
import { TicketForProjectParams } from 'src/app/_models/ticketForProjectParams';
import { ProjectsService } from 'src/app/_services/projects.service';
import { TicketsService } from 'src/app/_services/tickets.service';

@Component({
  selector: 'app-project-tickets',
  templateUrl: './project-tickets.component.html',
  styleUrls: ['./project-tickets.component.css'],
})
export class ProjectTicketsComponent implements OnInit {
  tickets: Ticket[];
  pagination: Pagination;
  ticketParams: TicketForProjectParams;
  project: Project;
  constructor(
    private ticketService: TicketsService,
    private projectService: ProjectsService,
    private route: ActivatedRoute
  ) {
    this.ticketParams = new TicketForProjectParams();
  }

  ngOnInit(): void {
    this.projectService
      .getProjectById(Number(this.route.snapshot.paramMap.get('id')))
      .subscribe((project) => {
        this.project = project;
        this.loadTickets();
      });
  }

  loadTickets(
    toggle: boolean = false,
    index: number = this.ticketParams.index
  ) {
    this.updateTable(toggle, index);
    this.getTicketsForProject();
  }

  getTicketsForProject() {
    this.ticketService
      .getTicketsForProject(this.project.title, this.ticketParams)
      .subscribe((response) => {
        this.tickets = response.result;
        this.pagination = response.pagination;
      });
  }

  updateTable(toggle: boolean, index: number) {
    if (toggle) {
      this.changeIcon(index);
      //New column has been clicked
      if (this.ticketParams.index != index) {
        //Set old icon to double arrows
        this.ticketParams.icons[this.ticketParams.index] = 0;
        //New index for column clicked
        this.ticketParams.index = index;
        this.ticketParams.ascending = true;
      }
      //Still on same column
      else {
        this.toggleAscending();
      }
    }
    this.ticketParams.searchMatch = this.ticketParams.searchMatch.toLowerCase();
    this.ticketService.setTicketForProjectParams(this.ticketParams);
  }

  pageChanged(event: any) {
    this.ticketParams.pageNumber = event.page;
    this.ticketService.setTicketForProjectParams(this.ticketParams);
    this.loadTickets();
  }

  toggleAscending() {
    this.ticketParams.ascending = !this.ticketParams.ascending;
  }

  changeIcon(index: number) {
    if (this.ticketParams.icons[index] == 2) {
      --this.ticketParams.icons[index];
    } else {
      ++this.ticketParams.icons[index];
    }
  }
}
