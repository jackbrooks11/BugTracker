import { Component, OnInit, ɵɵsetComponentScope } from '@angular/core';
import { Ticket } from 'src/app/_models/ticket';
import { TicketsService } from 'src/app/_services/tickets.service';

@Component({
  selector: 'app-status-line-chart',
  templateUrl: './status-line-chart.component.html',
  styleUrls: ['./status-line-chart.component.css'],
})
export class StatusLineChartComponent implements OnInit {
  tickets: Ticket[];
  public barChartData: any[] = [
    {
      data: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0,
      ],
      label: 'Opened',
    },
    {
      data: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0,
      ],
      label: 'Closed',
    },
  ];
  public barChartLabels: string[] = [];
  public barChartType = 'line';
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
    this.initializeLabels();
    this.ticketService.getTickets().subscribe((tickets) => {
      this.tickets = tickets;
      this.generateData();
    });
  }

  initializeLabels() {
    var currentDate = Date.now();
    console.log('currentDate in UTC: ', currentDate);
    for (let i = 29; i >= 0; i--) {
      var oldDate = new Date(currentDate);
      oldDate.setDate(oldDate.getDate() - i);
      console.log('oldDate in UTC: ', oldDate);
      console.log('oldDate in current time zone: ', oldDate.toDateString());
      this.barChartLabels.push(oldDate.toDateString());
    }
  }

  generateData() {
    for (var ticket of this.tickets) {
      for (var change of ticket.changes) {
        var changeDate = new Date(change.changed);
        changeDate.setMinutes(
          changeDate.getMinutes() - changeDate.getTimezoneOffset()
        );
        var dateIndex = this.barChartLabels.indexOf(changeDate.toDateString());
        if (change.property == 'State' && dateIndex != -1) {
          if (change.newValue == 'Open') {
            this.barChartData[0]['data'][dateIndex] += 1;
          } else if (change.newValue == 'Closed') {
            this.barChartData[1]['data'][dateIndex] += 1;
          }
        }
      }
      var createdDate = new Date(ticket.created);
      createdDate.setMinutes(
        createdDate.getMinutes() - createdDate.getTimezoneOffset()
      );
      var dateIndex = this.barChartLabels.indexOf(createdDate.toString());
      if (dateIndex != -1) {
        this.barChartData[0]['data'][dateIndex] += 1;
      }
    }
  }
}
