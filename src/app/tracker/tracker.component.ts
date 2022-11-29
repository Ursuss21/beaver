import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CalendarComponent } from '../calendar/calendar.component';
import { ButtonComponent } from '../shared/components/button/button.component';

@Component({
  selector: 'bvr-tracker',
  templateUrl: './tracker.component.html',
  standalone: true,
  imports: [ButtonComponent, CalendarComponent, CommonModule],
})
export class TrackerComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
