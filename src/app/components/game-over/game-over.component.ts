import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-game-over',
  standalone: true,
  imports: [],
  templateUrl: './game-over.component.html',
  styleUrl: './game-over.component.css',
})
export class GameOver {
  @Input({ required: true }) score!: number;
  @Input({ required: true }) ufos!: number;
  @Input({ required: true }) disposedTime!: number;

  @Output() exit = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();

  public readonly authService = inject(AuthService);
}
