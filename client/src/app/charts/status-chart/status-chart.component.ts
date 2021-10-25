import { Component, OnInit } from '@angular/core';
import { Ticket } from 'src/app/_models/ticket';
import { TicketParams } from 'src/app/_models/ticketParams';
import { TicketsService } from 'src/app/_services/tickets.service';

const BARCHART_LABELS: string[] = ['Open', 'In Progress', 'Cancelled', 'Done'];

@Component({
  selector: 'app-status-chart',
  templateUrl: './status-chart.component.html',
  styleUrls: ['./status-chart.component.css'],
})
export class StatusChartComponent implements OnInit {
  tickets: Ticket[] = [];
  ticketParams: TicketParams = new TicketParams();
  public barChartData: any[] = [
    { data: [0, 0, 0, 0], label: 'Tickets By Status' },
  ];
  public barChartLabels: string[] = BARCHART_LABELS;
  public barChartType = 'doughnut';
  public barChartLegend = true;
  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true,
    legend: { position: 'left' }
  };

  constructor(private ticketService: TicketsService) {}

  ngOnInit(): void {
    this.ticketParams.pageSize = 100;
    this.ticketService.getTickets(this.ticketParams).subscribe((tickets) => {
      for (var ticket of tickets.result) {
        if (ticket.state == 'Open') {
          this.barChartData[0]['data'][0] += 1;
        } else if (ticket.state == 'In Progress') {
          this.barChartData[0]['data'][1] += 1;
        } else if (ticket.state == 'Cancelled') {
          this.barChartData[0]['data'][2] += 1;
        } else {
          this.barChartData[0]['data'][3] += 1;
        }
      }
      this.tickets = tickets;
    });
  }
}
