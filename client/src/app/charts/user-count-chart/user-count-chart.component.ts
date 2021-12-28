import { Component, OnInit } from '@angular/core';
import { Ticket } from 'src/app/_models/ticket';
import { TicketsService } from 'src/app/_services/tickets.service';

@Component({
  selector: 'app-user-count-chart',
  templateUrl: './user-count-chart.component.html',
  styleUrls: ['./user-count-chart.component.css'],
})
export class UserCountChartComponent implements OnInit {
  tickets: Ticket[];
  public barChartData: any[] = [
    {
      data: [],
      label: 'Open Tickets',
    },
  ];
  public barChartLabels: string[] = [];
  public barChartType = 'bar';
  public barChartLegend = true;
  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true,
    legend: { position: 'left' },
    scales: {
      yAxes: [
        {
          ticks: {
            stepSize: 1,
            beginAtZero: true,
          },
        },
      ],
    },
  };

  constructor(private ticketService: TicketsService) {}

  ngOnInit(): void {
    this.ticketService.getTickets().subscribe((tickets) => {
      this.tickets = tickets;
      if (this.tickets.length > 0) {
        this.initializeLabelsAndData();
      }
    });
  }

  initializeLabelsAndData() {
    var userTicketCounts = [];
    for (var ticket of this.tickets) {
      var assignee = ticket.assignee
        ? this.titleCase(ticket.assignee)
        : 'Unassigned';
      if (!userTicketCounts[assignee]) {
        userTicketCounts[assignee] = 1;
      } else {
        userTicketCounts[assignee] += 1;
      }
    }
    var userTicketCountsArray = Object.entries(userTicketCounts).sort(
      (a, b) => b[1] - a[1]
    );
    for (let i = 0; i < 5; ++i) {
      this.barChartLabels.push(userTicketCountsArray[i][0]);
      this.barChartData[0]['data'].push(userTicketCountsArray[i][1]);
    }
  }

  titleCase(str: string) {
    return str[0].toUpperCase() + str.slice(1).toLowerCase();
  }
}
