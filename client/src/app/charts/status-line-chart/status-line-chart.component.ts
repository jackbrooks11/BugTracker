import { Component, OnInit } from '@angular/core';
import { TicketsService } from 'src/app/_services/tickets.service';

@Component({
  selector: 'app-status-line-chart',
  templateUrl: './status-line-chart.component.html',
  styleUrls: ['./status-line-chart.component.css'],
})
export class StatusLineChartComponent implements OnInit {
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
  };

  constructor(private ticketService: TicketsService) {}

  ngOnInit(): void {
    this.initializeLabels();
    this.ticketService.getTickets().subscribe((tickets) => {
      for (var ticket of tickets) {
        for (var change of ticket.changes) {
          var changeDate = new Date(change.changed);
          var dateIndex = this.barChartLabels.indexOf(
            changeDate.toDateString()
          );
          if (change.property == 'State' && dateIndex != -1) {
            if (change.newValue == 'Open') {
              this.barChartData[0]['data'][dateIndex] += 1;
            } else if (change.newValue == 'Closed') {
              this.barChartData[1]['data'][dateIndex] += 1;
            }
          }
        }
        var createdDate = new Date(ticket.created);
        var dateIndex = this.barChartLabels.indexOf(createdDate.toDateString());
        if (dateIndex != -1) {
          this.barChartData[0]['data'][dateIndex] += 1;
        }
      }
    });
  }

  initializeLabels() {
    var currentDate = Date.now();
    for (let i = 30; i >= 0; i--) {
      var oldDate = new Date(currentDate);
      oldDate.setDate(oldDate.getDate() - i);
      this.barChartLabels.push(oldDate.toDateString());
    }
  }
}
