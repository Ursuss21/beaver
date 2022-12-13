import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CdkTableModule } from '@angular/cdk/table';
import { FormsModule } from '@angular/forms';
import { Position } from '../models/position.model';
import { PositionsService } from '../services/positions.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { ToastService } from '../../shared/services/toast.service';
import { ToastState } from '../../shared/enum/toast-state';

@Component({
  selector: 'bvr-admin-positions',
  standalone: true,
  imports: [
    ButtonComponent,
    CdkTableModule,
    CommonModule,
    FormsModule,
    ModalComponent,
    RouterModule,
    ToastComponent,
  ],
  templateUrl: './admin-positions.component.html',
})
export class AdminPositionsComponent implements OnInit {
  dataSource: Position[] = [];
  displayedActiveColumns: string[] = [
    'name',
    'description',
    'count',
    'actions',
  ];
  displayedArchivedColumns: string[] = [
    'name',
    'description',
    'count',
    'archiveDate',
  ];
  isArchiveModalOpen: boolean = false;
  modalDescription: string = '';
  query: string = '';
  showActive: boolean = true;

  constructor(
    private positionsService: PositionsService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.dataSource = this.positionsService.getPositions();
  }

  showActiveTable(value: boolean): void {
    if (value) {
      this.dataSource = this.positionsService.getPositions();
    } else {
      this.dataSource = this.positionsService.getArchivedPositions();
    }
  }

  editPosition(event: Event, row: Position): void {
    event.stopPropagation();
    this.router.navigate([row.id, 'edit'], { relativeTo: this.route });
  }

  openArchiveModal(event: Event, row: Position): void {
    event.stopPropagation();
    this.isArchiveModalOpen = true;
    this.modalDescription = `Are you sure you want to archive ${row.name}? This action cannot be undone.`;
  }

  showPositionDetails(row: Position): void {
    this.router.navigate([row.id], { relativeTo: this.route });
  }

  archive(): void {
    this.toastService.showToast(ToastState.Success, 'Position archived');
    setTimeout(() => this.toastService.dismissToast(), 3000);
  }
}
