import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common'; // Importante para formatear la fecha
import { UserService, GameRecord } from '../../services/user.service';
import { RouterLink } from '@angular/router'; // Para el botón de volver
import { ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../services/auth.service';

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
  private readonly authService = inject(AuthService)

  // Array donde guardaremos los datos
  public generalRecords: GameRecord[] = [];
  public userRecords: GameRecord[] = [];
  public isLoggedIn = this.authService.isLoggedIn();

  ngOnInit(): void {
    this.loadGeneralRecords();
    this.loadUserRecords();
  }

  loadRecords(){
    this.loadGeneralRecords();
    if(this.authService.isLoggedIn()){
      this.loadUserRecords();
    }
  }

  private loadGeneralRecords() {
    this.userService.getGeneralRecords().subscribe({
      next: (data) => {
        this.generalRecords = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert('No se pudieron cargar las puntuaciones generales.');
      },
    });
  }

  private loadUserRecords(){
    const username = this.authService.getCurrentUser();
    if(username){
      this.userService.getPersonalRecords(username).subscribe({
        next: (data) => {
          this.userRecords = data;
          this.cdr.detectChanges();
        },
        error: (err) => {
          alert(`Error code: ${err.status}`)
        },
      });
    }
  }
}
