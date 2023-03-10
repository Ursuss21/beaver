import { CommonModule, formatDate } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as dayjs from 'dayjs';
import { Observable } from 'rxjs';
import { ButtonComponent } from '../shared/components/button/button.component';
import { Status } from '../shared/enum/status.enum';
import { CalendarService } from '../shared/services/calendar.service';
import { Day } from './models/day.model';
import { MonthPipe } from './pipes/month.pipe';

@Component({
  selector: 'bvr-calendar',
  templateUrl: './calendar.component.html',
  standalone: true,
  imports: [ButtonComponent, CommonModule, MonthPipe],
})
export class CalendarComponent implements OnInit {
  @Input() employeeCalendar: Observable<Day[]> = new Observable<Day[]>();

  @Output() currentDayChange: EventEmitter<string> = new EventEmitter<string>();

  currentMonth!: number;
  currentYear!: number;
  currentDay!: string;
  days: string[] = [];
  gridMonthEndDay!: number;
  gridMonthStartDay!: number;
  monthEndDay!: number;
  monthGrid: Day[][] = [];
  monthStartDay!: number;

  private readonly sundayOffset: number = 1;

  constructor(private calendarService: CalendarService) {}

  ngOnInit(): void {
    this.currentDay = dayjs().date(dayjs().date()).format('MM/DD/YYYY');
    this.currentMonth = dayjs().month();
    this.currentYear = dayjs().month(this.currentMonth).year();
    this.initDaysOfWeek();
    this.generateGrid();
  }

  initDaysOfWeek(): void {
    this.days = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
  }

  generateGrid(): void {
    this.getGridStartDay();
    this.getGridEndDay();
    this.getMonthGrid();
    this.observeCalendarUpdates();
  }

  getGridStartDay(): void {
    const monthStartWeekday = dayjs()
      .month(this.currentMonth)
      .startOf('M')
      .day();
    this.monthStartDay = dayjs().month(this.currentMonth).startOf('M').date();
    this.gridMonthStartDay =
      this.monthStartDay + this.sundayOffset - monthStartWeekday;
    if (this.gridMonthStartDay === 2) {
      this.gridMonthStartDay -= 7;
    }
  }

  getGridEndDay(): void {
    const monthEndWeekday = dayjs().month(this.currentMonth).endOf('M').day();
    this.monthEndDay = dayjs().month(this.currentMonth).endOf('M').date();
    this.gridMonthEndDay =
      this.monthEndDay + 6 + this.sundayOffset - monthEndWeekday;
  }

  getMonthGrid(): void {
    this.monthGrid = [];
    for (let i = this.gridMonthStartDay, k = 0; k < 6; ++k) {
      let week = [] as Day[];
      for (let j = 0; j < 7; ++i, ++j) {
        week.push({
          date: dayjs().month(this.currentMonth).date(i).format('MM/DD/YYYY'),
          disabled: i < this.monthStartDay || i > this.monthEndDay,
          status: Status.None,
        });
      }
      this.monthGrid.push(week);
    }
  }

  observeCalendarUpdates(): void {
    this.employeeCalendar.subscribe(calendar => {
      calendar.forEach(day => {
        for (let i = 0; i < this.monthGrid.length; ++i) {
          const monthDay = this.monthGrid[i].find(
            monthDay =>
              monthDay.date === formatDate(day.date, 'MM/dd/YYYY', 'en')
          );
          if (monthDay) {
            monthDay.status = day.status;
          }
        }
      });
    });
  }

  previousMonth(): void {
    --this.currentMonth;
    this.currentYear = dayjs().month(this.currentMonth).year();
    this.generateGrid();
  }

  nextMonth(): void {
    ++this.currentMonth;
    this.currentYear = dayjs().month(this.currentMonth).year();
    this.generateGrid();
  }

  selectDay(day: Day): void {
    if (!day.disabled) {
      this.currentDay = day.date;
      this.calendarService.updateCurrentDay(this.currentDay);
    }
  }

  isCurrentDay(day: Day): boolean {
    return day.date === this.currentDay;
  }
}
