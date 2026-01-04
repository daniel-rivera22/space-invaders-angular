import { Injectable } from '@angular/core';
import { Ship, Ufo as UFOS } from '../models/game-models';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  
  public width: number = 0;
  public height: number = 0;

  /*
    Usar ! le dice a TS que se "fíe" de que se va a inicializar la variable desde fuera
    Sirve para no inicializar un objeto con datos falsos solo para satisfacer al compilador
  */
  private ship!: Ship;
  private readonly ufo: UFOS[] = [];

  private score: number = 0;
  private timeLeft: number;

  // Flags de teclado, para evitar el retardo al mantener pulsado
  private leftArrowPressedFlag: boolean = false;
  private righArrowPressedFlag: boolean = false;

  constructor() {}

  getShip(): Ship {
    return this.ship;
  }

  getScore(): number {
    return this.score;
  }

  getTime(): number {
    return this.timeLeft;
  }

  setMoveLeft(state: boolean) {
    this.leftArrowPressedFlag = state;
  }

  setMoveRight(state: boolean) {
    this.righArrowPressedFlag = state;
  }

  setUp(canvasWidth: number, canvasHeight: number) {
    this.width = canvasWidth;
    this.height = canvasHeight;
    this.launchGame();
  }

  private launchGame() {
    this.initializeShip();
  }

  private initializeShip(): void {
    // IMPORTANTE: Los ejes del canvas comienzan en la esquina superior izquierda, y crecen a la derecha (x) y abajo (y)
    const centerX = this.width / 2 - this.SHIP_WIDTH / 2;
    const centerWithBottomMarginY = this.height - this.SHIP_HEIGHT - this.SHIP_MARGIN_BOTTOM;

    this.ship = {
      width: this.SHIP_WIDTH,
      height: this.SHIP_HEIGHT,
      x: centerX,
      y: centerWithBottomMarginY,
      speed: this.SHIP_SPEED,
    };
  }

  private initializeUfos(): void {
    this.ufos = [];
  }

  update() {
    // Early return; evita sobrecargar el código de tabulaciones
    if (!this.ship || this.width === 0) return;

    this.updateShipCoords();
  }

  private updateShipCoords(): void {
    if (this.leftArrowPressedFlag && this.ship.x > 0) {
      this.ship.x -= this.ship.speed;
    }

    if (this.righArrowPressedFlag && this.ship.x + this.ship.width < this.width) {
      this.ship.x += this.ship.speed;
    }
  }
}
