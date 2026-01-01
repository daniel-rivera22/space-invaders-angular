import { Injectable } from '@angular/core';
import { Ship } from '../models/game-models';

@Injectable({
  providedIn: 'root',
})

export class GameService {
  public width: number = 0;
  public height: number = 0;
}
