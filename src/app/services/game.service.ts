import { Injectable } from '@angular/core';
import { Entity, Ship, Ufo, Bullet, GAME_CONFIG, GameParams } from '../models/game-models';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  // ========== PROPIEDADES PÚBLICAS ==========
  public width: number = 0;
  public height: number = 0;
  public gameOver$ = new Subject<void>();

  // ========== PROPIEDADES PRIVADAS - Entidades del juego ==========
  /*
    Usar ! le dice a TS que se "fíe" de que se va a inicializar la variable desde fuera
    Sirve para no inicializar un objeto con datos falsos solo para satisfacer al compilador
  */
  private ship!: Ship;
  private ufos: Ufo[] = [];
  private bullet: Bullet | null = null; // No existe Optional<> porque TS lo maneja así

  // ========== PROPIEDADES PRIVADAS - Estado del juego ==========
  private score = 0;
  private timeRemaining = 60;
  private numberOfUfos = 5;

  // ========== PROPIEDADES PRIVADAS - Controles ==========
  // Flags de teclado, para evitar el retardo al mantener pulsado
  private leftArrowPressedFlag: boolean = false;
  private righArrowPressedFlag: boolean = false;

  // ========== CONSTRUCTOR ==========
  constructor() {}

  // ========== MÉTODOS PÚBLICOS - Setup ==========
  setUp(canvasWidth: number, canvasHeight: number) {
    this.width = canvasWidth;
    this.height = canvasHeight;
    this.launchGame();
  }

  // ========== MÉTODOS PÚBLICOS - Getters ==========
  getShip(): Ship {
    return this.ship;
  }

  getUfos(): Ufo[] {
    return this.ufos;
  }

  getBullet(): Bullet | null {
    return this.bullet;
  }

  getTimeRemaining() {
    return this.timeRemaining;
  }

  getScore() {
    return this.score;
  }

  // ========== MÉTODOS PÚBLICOS - Control ==========
  setMoveLeft(state: boolean) {
    this.leftArrowPressedFlag = state;
  }

  setMoveRight(state: boolean) {
    this.righArrowPressedFlag = state;
  }

  shoot(): void {
    if (this.bullet) return;

    // Para que salga desde el centro del eje vertical de la nave:
    const bulletX = this.ship.x + this.ship.width / 2 - GAME_CONFIG.BULLET.WIDTH / 2;
    const bulletY = this.ship.y - GAME_CONFIG.BULLET.HEIGHT;

    this.bullet = {
      x: bulletX,
      y: bulletY,
      width: GAME_CONFIG.BULLET.WIDTH,
      height: GAME_CONFIG.BULLET.HEIGHT,
      speed: GAME_CONFIG.BULLET.SPEED,
    };
  }

  startTimer() {
    const timerIntervalId = setInterval(() => {
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        clearInterval(timerIntervalId);
        this.endGame();
      }
    }, 1000);
  }

  // ========== MÉTODO PÚBLICO - Loop principal ==========
  update() {
    // Early return; evita sobrecargar el código de tabulaciones
    if (!this.ship || this.width === 0) return;

    this.updateShipCoords();
    this.updateUfosCoords();
    this.updateBulletCoords();
  }

  // ========== MÉTODOS PRIVADOS - Inicialización ==========
  private launchGame() {
    this.initializeShip();
    this.initializeUfos();
    this.startTimer();
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
    let idGenerator = 0;
    //TODO: Escalarlo a N ufos
    const startX = (this.width - GAME_CONFIG.UFO.WIDTH) / 2;
    const ufo = {
      x: startX,
      y: GAME_CONFIG.UFO.HEIGHT,
      width: GAME_CONFIG.UFO.WIDTH,
      height: GAME_CONFIG.UFO.HEIGHT,
      speed: GAME_CONFIG.UFO.SPEED,
      id: idGenerator,
      hit: false,
    };
    this.ufos.push(ufo);
    idGenerator++;
  }

  // ========== MÉTODOS PRIVADOS - Actualización de entidades ==========
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

  // TODO: modificar función para implementar "mentalidad de colmena" y eliminar "efecto muelle"
  private updateUfosCoords(): void {
    this.ufos.forEach((ufo) => {
      if (ufo.x <= 0 || ufo.x + ufo.width >= this.width) {
        ufo.speed *= -1;
      }
      ufo.x = this.calculateNextPosition(ufo.x, ufo.speed, 0, this.width - ufo.width);
    });
  }

  private updateBulletCoords(): void {
    // Si no hay disparo, no hacer nada
    if (!this.bullet) return;

    // Comprobar si la bala se ha salido completamente del viewport -> implementa desvanecimiento en lugar de usar clamping
    const bulletCompletelyOutOfViewport = this.bullet.y + this.bullet.height <= 0;
    if (bulletCompletelyOutOfViewport) {
      this.bullet = null;
      this.updateScore(GAME_CONFIG.SCORE_EVENTS.MISSED_BULLET);
      return;
    }

    // Comprobar si la bala ha impactado en algún OVNI
    /*
      "activeBullet" es necesaria: con forEach, se entra en un nuevo callback y TS desconfía de que bullet pueda volver ser null.
      Guardándola en una constante, TS ya no se queja.

      Find devuelve el primer elemento con predicado no nulo -> devuelve OBJETO | undefined
      Envolviendo la expresión entre (), comprobamos que exista dicho elemento -> devuelve (objeto | undefined) -boolean-
    */
    const activeBullet = this.bullet;
    const defeatedUfo = this.ufos.find(
      (ufo) => ufo.hit === false && this.isColliding(activeBullet, ufo),
    );
    if ((defeatedUfo)) {
      this.execDefeatedUfoRoutine(defeatedUfo);
      return;
    }

    // Si no, actualizar sus coordenadas (poner esta línea al final deja que se pinte por completo el desvanecimiento)
    this.bullet.y -= this.bullet.speed;
  }

  // ========== MÉTODOS PRIVADOS - Lógica de juego ==========
  private execDefeatedUfoRoutine(defeatedUfo: Ufo) {
    this.bullet = null;
    defeatedUfo.hit = true;
    defeatedUfo.speed = 0;
    this.updateScore(GAME_CONFIG.SCORE_EVENTS.DEFEATED_UFO_SCORE);
    setTimeout(() => {
      this.removeUfo(defeatedUfo.id);
    }, GAME_CONFIG.EXPLOSION.DURATION);
  }

  private updateScore(scoreIncrement: number) {
    this.score += scoreIncrement;
  }

  private endGame() {
    this.gameOver$.next();
  }

  // ========== MÉTODOS PRIVADOS - Utilidades ==========
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

  private isColliding(entity: Entity, otherEntity: Entity): boolean {
    const entityRect = {
      left: entity.x,
      right: entity.x + entity.width,
      top: entity.y,
      bottom: entity.y + entity.height,
    };
    const otherEntityRect = {
      left: otherEntity.x,
      right: otherEntity.x + otherEntity.width,
      top: otherEntity.y,
      bottom: otherEntity.y + otherEntity.height,
    };

    // AABB (Axis-Aligned Bounding Box)
    return (
      entityRect.left < otherEntityRect.right &&
      entityRect.right > otherEntityRect.left &&
      entityRect.top < otherEntityRect.bottom &&
      entityRect.bottom > otherEntityRect.top
    );
  }

  private removeUfo(ufoId: number): void {
    this.ufos = this.ufos.filter((ufo) => ufo.id !== ufoId);
  }
}
