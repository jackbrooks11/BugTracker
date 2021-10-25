import { Component, OnInit } from '@angular/core';
import { Ticket } from 'src/app/_models/ticket';
import { TicketParams } from 'src/app/_models/ticketParams';
import { TicketsService } from 'src/app/_services/tickets.service';

const BARCHART_LABELS: string[] = [
  'Bugs',
  'Feature Requests',
  'Issues',
  'Requirements',
];

@Component({
  selector: 'app-type-chart',
  templateUrl: './type-chart.component.html',
  styleUrls: ['./type-chart.component.css'],
})
export class TypeChartComponent implements OnInit {
  tickets: Ticket[] = [];
  ticketParams: TicketParams = new TicketParams();
  public barChartData: any[] = [
    { data: [0, 0, 0, 0], label: 'Tickets By Type' },
  ];
  public barChartLabels: string[] = BARCHART_LABELS;
  public barChartType = 'doughnut';
  public barChartLegend = true;
  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    response: true,
    legend: { position: 'left' }
  };

  constructor(private ticketService: TicketsService) {}

  ngOnInit(): void {
    this.ticketParams.pageSize = 100;
    this.ticketService.getTickets(this.ticketParams).subscribe((tickets) => {
      for (var ticket of tickets.result) {
        if (ticket.type == 'Bug') {
          this.barChartData[0]['data'][0] += 1;
        } else if (ticket.type == 'Feature Request') {
          this.barChartData[0]['data'][1] += 1;
        } else if (ticket.type == 'Issue') {
          this.barChartData[0]['data'][2] += 1;
        } else {
          this.barChartData[0]['data'][3] += 1;
        }
      }
      this.tickets = tickets;
    });
  }
}
