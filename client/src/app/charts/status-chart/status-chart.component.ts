import { Component, OnInit } from '@angular/core';
import { Ticket } from 'src/app/_models/ticket';
import { TicketsService } from 'src/app/_services/tickets.service';

const BARCHART_LABELS: string[] = [
  'Open',
  'In Progress',
  'Done',
  'Closed',
  'Cancelled',
];

@Component({
  selector: 'app-status-chart',
  templateUrl: './status-chart.component.html',
  styleUrls: ['./status-chart.component.css'],
})
export class StatusChartComponent implements OnInit {
  tickets: Ticket[] = [];
  public barChartData: any[] = [
    { data: [0, 0, 0, 0, 0], label: 'Tickets By Status' },
  ];
  public barChartLabels: string[] = BARCHART_LABELS;
  public barChartType = 'doughnut';
  public barChartLegend = true;
  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true,
    legend: { position: 'bottom' },
  };

  constructor(private ticketService: TicketsService) {}

  ngOnInit(): void {
    this.ticketService.getTickets().subscribe((tickets) => {
      for (var ticket of tickets) {
        if (ticket.state == BARCHART_LABELS[0]) {
          this.barChartData[0]['data'][0] += 1;
        } else if (ticket.state == BARCHART_LABELS[1]) {
          this.barChartData[0]['data'][1] += 1;
        } else if (ticket.state == BARCHART_LABELS[2]) {
          this.barChartData[0]['data'][2] += 1;
        } else if (ticket.state == BARCHART_LABELS[3]) {
          this.barChartData[0]['data'][3] += 1;
        } else {
          this.barChartData[0]['data'][4] += 1;
        }
      }
      this.tickets = tickets;
    });
  }
}
