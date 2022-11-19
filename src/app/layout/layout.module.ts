import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidenavComponent } from './sidenav/sidenav.component';
import { LayoutComponent } from './layout.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [LayoutComponent, SidenavComponent],
  imports: [BrowserAnimationsModule, CommonModule, RouterModule, SharedModule],
  exports: [LayoutComponent, SidenavComponent],
})
export class LayoutModule {}
