import { Injectable } from '@angular/core';
import { Ship, Ufo, Bullet, GAME_CONFIG } from '../models/game-models';

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
  private readonly UFOS: Ufo[] = [];
  private bullet: Bullet | null = null; // No existe Optional<> porque TS lo maneja así

  private readonly gameVariables = {
    score: 0,
    timeRemaining: 60,
    numberOfUfos: 3,
  }

  // Flags de teclado, para evitar el retardo al mantener pulsado
  private leftArrowPressedFlag: boolean = false;
  private righArrowPressedFlag: boolean = false;

  constructor() {}

  getShip(): Ship {
    return this.ship;
  }

  getUfos(): Ufo[] {
    return this.UFOS;
  }

  getBullet(): Bullet | null {
    return this.bullet;
  }

  getGameVariables() {
    return this.gameVariables;
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
    this.initializeUfos();
  }

  private initializeShip(): void {
    // IMPORTANTE: Los ejes del canvas comienzan en la esquina superior izquierda, y crecen a la derecha (x) y abajo (y)
    const centerX = this.width / 2 - GAME_CONFIG.SHIP.WIDTH / 2;
    const centerWithBottomMarginY =
      this.height - GAME_CONFIG.SHIP.HEIGHT - GAME_CONFIG.SHIP.MARGIN_BOTTOM;

    this.ship = {
      x: centerX,
      y: centerWithBottomMarginY,
      width: GAME_CONFIG.SHIP.WIDTH,
      height: GAME_CONFIG.SHIP.HEIGHT,
      speed: GAME_CONFIG.SHIP.SPEED,
    };
  }

  private initializeUfos(): void {
    //TODO: Escalarlo a N ufos
    const startX = (this.width - GAME_CONFIG.UFO.WIDTH) / 2;
    const ufo = {
      x: startX,
      y: GAME_CONFIG.UFO.HEIGHT,
      width: GAME_CONFIG.UFO.WIDTH,
      height: GAME_CONFIG.UFO.HEIGHT,
      speed: GAME_CONFIG.UFO.SPEED,
      id: 1,
      hit: false,
    };
    this.UFOS.push(ufo);
  }

  update() {
    // Early return; evita sobrecargar el código de tabulaciones
    if (!this.ship || this.width === 0) return;

    this.updateShipCoords();
    this.updateUfosCoords();
    this.updateBulletCoords();
  }

  private updateShipCoords(): void {
    if (this.leftArrowPressedFlag) {
      this.ship.x = this.calculateNextPosition(
        this.ship.x,
        -this.ship.speed,
        0,
        this.width - this.ship.width,
      );
    } else if (this.righArrowPressedFlag) {
      this.ship.x = this.calculateNextPosition(
        this.ship.x,
        this.ship.speed,
        0,
        this.width - this.ship.width,
      );
    }
  }

  private calculateNextPosition(
    actualPosition: number,
    speed: number,
    minLimit: number,
    maxLimit: number,
  ): number {
    return this.clamp(actualPosition + speed, minLimit, maxLimit);
  }

  // Clamping general
  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(value, max));
  }

  // TODO: modificar función para implementar mentalidad de colmena
  private updateUfosCoords(): void {
    this.UFOS.forEach((ufo) => {
      if (ufo.x <= 0 || ufo.x + ufo.width >= this.width){
        ufo.speed *= -1;
      }
      ufo.x = this.calculateNextPosition(ufo.x, ufo.speed, 0, this.width - ufo.width);
    });
  }

  shoot(): void {
    // Si da tiempo, TODO: meter sonido
    if(this.bullet) return;

    // Para que salga desde el centro del eje vertical de la nave:
    const bulletX = this.ship.x + (this.ship.width / 2) - (GAME_CONFIG.BULLET.WIDTH / 2)
    const bulletY = this.ship.y - GAME_CONFIG.BULLET.HEIGHT;

    this.bullet = {
      x: bulletX,
      y: bulletY,
      width: GAME_CONFIG.BULLET.WIDTH,
      height: GAME_CONFIG.BULLET.HEIGHT,
      speed: GAME_CONFIG.BULLET.SPEED,
    }
  }

  private updateBulletCoords(): void {
    /*
      Si la bala se sale del canvas completamente, la "matamos" -> desvanecimiento progresivo
      Queda mejor que aplicar el clamping a la bala también, así parece que se pierde en el espacio
    */

    // Si no hay disparo, no hacer nada
    if (!this.bullet) return;

    // Si el disparo se ha salido de la pantalla, eliminarlo
    if (this.bullet.y + this.bullet.height <= 0) this.bullet = null;
    // Si no, actualizar sus coordenadas (poner esta línea al final deja que se pinte por completo el desvanecimiento)
    else this.bullet.y -= this.bullet.speed;
  }
}
