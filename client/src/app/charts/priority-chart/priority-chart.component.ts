import { Component, OnInit } from '@angular/core';
import { Ticket } from 'src/app/_models/ticket';
import { TicketsService } from 'src/app/_services/tickets.service';

const BARCHART_LABELS: string[] = ['Low', 'Medium', 'High'];

@Component({
  selector: 'app-priority-chart',
  templateUrl: './priority-chart.component.html',
  styleUrls: ['./priority-chart.component.css'],
})
export class PriorityChartComponent implements OnInit {
  tickets: Ticket[] = [];
  public barChartData: any[] = [
    { data: [0, 0, 0, 0], label: 'Tickets By Priority' },
  ];
  public barChartLabels: string[] = BARCHART_LABELS;
  public barChartType = 'doughnut';
  public barChartLegend = true;
  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsivee: true,
    legend: { position: 'bottom' },
  };
  constructor(private ticketService: TicketsService) {}

  ngOnInit(): void {
    this.ticketService.getTickets().subscribe((tickets) => {
      for (var ticket of tickets) {
        if (ticket.priority == BARCHART_LABELS[0]) {
          this.barChartData[0]['data'][0] += 1;
        } else if (ticket.priority == BARCHART_LABELS[1]) {
          this.barChartData[0]['data'][1] += 1;
        } else {
          this.barChartData[0]['data'][2] += 1;
        }
      }
      this.tickets = tickets;
    });
  }
}
