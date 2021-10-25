import { Component, OnInit } from '@angular/core';
import { Ticket } from 'src/app/_models/ticket';
import { TicketParams } from 'src/app/_models/ticketParams';
import { TicketsService } from 'src/app/_services/tickets.service';

const BARCHART_LABELS: string[] = ['Low', 'Medium', 'High'];

@Component({
  selector: 'app-priority-chart',
  templateUrl: './priority-chart.component.html',
  styleUrls: ['./priority-chart.component.css']
})
export class PriorityChartComponent implements OnInit {
  tickets: Ticket[] = [];
  ticketParams: TicketParams = new TicketParams();
  public barChartData: any[] = [
    { data: [0, 0, 0, 0], label: 'Tickets By Priority' },
  ];
  public barChartLabels: string[] = BARCHART_LABELS;
  public barChartType = 'doughnut';
  public barChartLegend = true;
  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    response: true,
    legend: { position: 'left' }
  };
  constructor(private ticketService: TicketsService) { }

  ngOnInit(): void {
    this.ticketParams.pageSize = 100;
    this.ticketService.getTickets(this.ticketParams).subscribe((tickets) => {
      for (var ticket of tickets.result) {
        if (ticket.priority == 'Open') {
          this.barChartData[0]['data'][0] += 1;
        } else if (ticket.priority == 'Medium') {
          this.barChartData[0]['data'][1] += 1;
        } else {
          this.barChartData[0]['data'][2] += 1;
        }
      }
      this.tickets = tickets;
    });
  }

}
