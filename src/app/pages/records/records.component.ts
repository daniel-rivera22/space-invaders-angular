import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common'; // Importante para formatear la fecha
import { UserService, GameRecord } from '../../services/user.service';
import { RouterLink } from '@angular/router'; // Para el botón de volver
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-records',
  standalone: true,
  imports: [DatePipe, RouterLink], // Importamos DatePipe para usar {{ fecha | date }}
  templateUrl: './records.html',
  styleUrl: './records.css',
})
export class Records implements OnInit {
  private readonly userService = inject(UserService);
  private readonly cdr = inject(ChangeDetectorRef);

  // Array donde guardaremos los datos
  public generalRecords: GameRecord[] = [];

  ngOnInit(): void {
    this.loadRecords();
  }

  private loadRecords() {
    this.userService.getGeneralRecords().subscribe({
      next: (data) => {
        this.generalRecords = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando récords:', err);
        alert('No se pudieron cargar las puntuaciones.');
      },
    });
  }
}
