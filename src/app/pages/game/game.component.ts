import { Component, ChangeDetectorRef } from '@angular/core';
import { OnInit, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { ElementRef, ViewChild } from '@angular/core';
import { GAME_CONFIG } from '../../models/gameModels';
import { GameService } from '../../services/game.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-game',
  imports: [],
  templateUrl: './game.html',
  styleUrl: './game.css',
})
export class Game implements OnInit, AfterViewInit, OnDestroy {
  // ========== PROPIEDADES - Servicio inyectado ==========
  private readonly gameService = inject(GameService);
  private readonly cdr = inject(ChangeDetectorRef);

  // ========== PROPIEDADES - Referencias DOM ==========
  /*
  - @ViewChild es la forma "correcta" de obtener la referencia a un objeto del DOM; usa la etiqueta del '#'.
  - ElementRef es un tipo envoltorio de seguridad que encapsula la referencia (como Optional<T> en Java)
  */
  @ViewChild('gameContainer') containerRef!: ElementRef<HTMLElement>;
  @ViewChild('gameCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  // ========== PROPIEDADES - Estado del componente ==========
  private ctx!: CanvasRenderingContext2D;
  private loopId = 0;
  private isGameRunning = true;
  private gameOverSubscription!: Subscription;

  // ========== PROPIEDADES - Assets ==========
  private assets: Record<string, HTMLImageElement> = {};

  // ========== LIFECYCLE HOOKS ==========
  ngOnInit(): void {
    this.loadAssets();
    this.gameOverSubscription = this.gameService.gameOver$.subscribe(() => {
      this.cdr.detectChanges(); // Para que se printee sí o sí el time: 0
      this.stopGameLoop();
      //TODO: Mostrar puntuaciones
    });
  }

  ngAfterViewInit(): void {
    const container = this.containerRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    this.ctx = canvas.getContext('2d')!;

    this.gameService.setUp(canvas.width, canvas.height);

    canvas.focus(); // Para no tener que hacer clic en él

    this.gameLoop();
  }

  ngOnDestroy() {
    this.stopGameLoop(); // Por si acaso
    if (this.gameOverSubscription) {
      this.gameOverSubscription.unsubscribe();
    }
  }

  // ========== GETTERS ==========
  // Propiedad de acceso -> parecen variables, se comportan como funciones
  get time(): number {
    return this.gameService.getTimeRemaining();
  }

  get score(): number {
    return this.gameService.getScore();
  }

  // ========== EVENT HANDLERS ==========
  onKeyDown(ke: KeyboardEvent) {
    switch (ke.code) {
      case 'ArrowLeft':
        this.gameService.setMoveLeft(true);
        break;

      case 'ArrowRight':
        this.gameService.setMoveRight(true);
        break;

      case 'Space':
        this.gameService.shoot();
        break;

      default:
        break;
    }
  }

  onKeyUp(ke: KeyboardEvent) {
    // Nota: para flechas y espacio da igual, pero mejor usar .code (universal) que .key (cambia con el teclado)
    switch (ke.code) {
      case 'ArrowLeft':
        this.gameService.setMoveLeft(false);
        break;

      case 'ArrowRight':
        this.gameService.setMoveRight(false);
        break;

      default:
        break;
    }
  }

  // OnKeyPress está en desuso

  // ========== MÉTODOS PRIVADOS - Game loop y render ==========
  /*
    Se usa arrow function ( ()=>{} ) porque mantiene el "this" constante; siempre es GameComponent, independientemente de quién llame a la función
    Es más limpio que usar .bind(this)
  */
  private readonly gameLoop = () => {
    if (!this.isGameRunning) return;

    this.gameService.update();
    this.draw();
    this.cdr.detectChanges(); // Para que se actualicen los contadores aunque no haya eventos de por medio

    this.loopId = requestAnimationFrame(this.gameLoop);
  };

  private draw() {
    const canvasWidth = this.canvasRef.nativeElement.width;
    const canvasHeight = this.canvasRef.nativeElement.height;

    this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const ship = this.gameService.getShip();
    const ufos = this.gameService.getUfos();
    const bullet = this.gameService.getBullet();

    drawShip(this.ctx, this.assets['ship']);
    drawUfos(this.ctx, this.assets['ufo'], this.assets['explosion']);
    drawBullet(this.ctx, this.assets['bullet']);

    // Las funciones se "elevan" (hoising), por lo que se pueden usar a pesar de declararse debajo
    function drawShip(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
      if (!ship || !img) return;
      ctx.drawImage(img, ship.x, ship.y, ship.width, ship.height);
    }

    function drawUfos(
      ctx: CanvasRenderingContext2D,
      ufoImg: HTMLImageElement,
      explosionImg: HTMLImageElement,
    ) {
      if (ufos.length <= 0) return;

      ufos.forEach((ufo) => {
        if (ufo.hit && explosionImg)
          ctx.drawImage(explosionImg, ufo.x, ufo.y, ufo.width, ufo.height);
        else if (!ufo.hit && ufoImg) ctx.drawImage(ufoImg, ufo.x, ufo.y, ufo.width, ufo.height);
      });
    }

    function drawBullet(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
      if (!bullet || !img) return;
      ctx.drawImage(img, bullet.x, bullet.y, bullet.width, bullet.height);
    }
  }

  // ========== MÉTODOS PRIVADOS - Gestión del loop ==========
  private stopGameLoop() {
    this.isGameRunning = false;
    if (this.loopId) cancelAnimationFrame(this.loopId);
  }

  // ========== MÉTODOS PRIVADOS - Carga de recursos ==========
  private loadAssets() {
    this.assets['ship'] = this.createHTMLImage(GAME_CONFIG.SHIP.SRC);
    this.assets['ufo'] = this.createHTMLImage(GAME_CONFIG.UFO.SRC);
    this.assets['bullet'] = this.createHTMLImage(GAME_CONFIG.BULLET.SRC);
    this.assets['explosion'] = this.createHTMLImage(GAME_CONFIG.EXPLOSION.SRC);
  }

  private createHTMLImage(path: string): HTMLImageElement {
    const img = new Image();
    img.src = path;
    return img;
  }
}
