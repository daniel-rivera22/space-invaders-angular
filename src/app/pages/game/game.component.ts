import { Component } from '@angular/core';
import { OnInit, AfterViewInit, OnDestroy, inject} from '@angular/core';
import {ElementRef, ViewChild} from '@angular/core'
import { GAME_CONFIG } from '../../models/game-models';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-game',
  imports: [],
  templateUrl: './game.html',
  styleUrl: './game.css',
})
export class Game implements OnInit, AfterViewInit, OnDestroy {
  private readonly gameService = inject(GameService);

  /*
  - @ViewChild es la forma "correcta" de obtener la referencia a un objeto del DOM; usa la etiqueta del '#'.
  - ElementRef es un tipo envoltorio de seguridad que encapsula la referencia (como Optional<T> en Java)
  */

  @ViewChild('gameContainer') containerRef!: ElementRef<HTMLElement>;
  @ViewChild('gameCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private ctx!: CanvasRenderingContext2D;
  private loopId = 0; // Necesario para parar el juego

  private assets: Record<string, HTMLImageElement> = {};

  ngOnInit(): void {
    this.loadAssets();
  }

  private loadAssets() {
    this.assets['ship'] = this.createHTMLImage(GAME_CONFIG.SHIP.SRC);
    this.assets['ufo'] = this.createHTMLImage(GAME_CONFIG.UFO.SRC);
  }

  private createHTMLImage(path: string): HTMLImageElement {
    const img = new Image();
    img.src = path;
    return img;
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

  ngOnDestroy(): void {
    if (this.loopId) cancelAnimationFrame(this.loopId);
  }

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

  /*
    Se usa arrow function ( ()=>{} ) porque mantiene el "this" constante; siempre es GameComponent, independientemente de quién llame a la función
    Es más limpio que usar .bind(this)
  */
  private readonly gameLoop = () => {
    this.gameService.update();
    this.draw();
    this.loopId = requestAnimationFrame(this.gameLoop); // this siempre será esta la instancia de GameComponent
  };

  private draw() {
    const canvasWidth = this.canvasRef.nativeElement.width;
    const canvasHeight = this.canvasRef.nativeElement.height;

    this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const ship = this.gameService.getShip();
    const ufos = this.gameService.getUfos();
    const bullet = this.gameService.getBullet();

    drawShip(this.ctx, this.assets['ship']);
    drawUfos(this.ctx, this.assets['ufo']);
    drawBullet(this.ctx);

    // Las funciones se "elevan" (hoising), por lo que se pueden usar a pesar de declararse debajo
    function drawShip(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
      if (!ship || !img) return;

      ctx.fillStyle = '#00FF00'; // Fija el estilo de relleno del canva
      ctx.fillRect(ship.x, ship.y, ship.width, ship.height);
      // this.ctx.drawImage(this.assets['ship'], ship.x, ship.y, ship.width, ship.height);
    }
    
    function drawUfos(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
      if(ufos.length <= 0 || !img) return;

      ufos.forEach((ufo) => {
        ctx.fillStyle = '#0000FF';
        ctx.fillRect(ufo.x, ufo.y, ufo.width, ufo.height);
        // this.ctx.drawImage(this.assets['ufo'], ufo.x, ufo.y, ufo.width, ufo.height);
      });
    }
      
    function drawBullet(ctx: CanvasRenderingContext2D) {
      if(!bullet) return;

      ctx.fillStyle = GAME_CONFIG.BULLET.COLOR;
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
  }
}
