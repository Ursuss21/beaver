import { Injectable } from '@angular/core';
import { Position } from '../models/position.model';

@Injectable({
  providedIn: 'root',
})
export class PositionsService {
  private _positions: Position[] = [
    {
      id: '1',
      name: 'Frontend Developer',
      description: 'Frontend Developer',
      count: 1,
      active: true,
    },
    {
      id: '2',
      name: 'Product Designer',
      description: 'Product Designer',
      count: 1,
      archiveDate: '2022-10-10',
      active: false,
    },
  ];

  constructor() {}

  getPosition(id: string): Position {
    const position = this._positions.find(position => position.id === id);
    return position as Position;
  }

  getPositions(): Position[] {
    return this._positions.filter(position => position.active);
  }

  getArchivedPositions(): Position[] {
    return this._positions.filter(position => !position.active);
  }
}
