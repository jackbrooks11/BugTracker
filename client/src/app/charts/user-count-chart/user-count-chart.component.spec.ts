import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCountChartComponent } from './user-count-chart.component';

describe('UserCountChartComponent', () => {
  let component: UserCountChartComponent;
  let fixture: ComponentFixture<UserCountChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserCountChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserCountChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
