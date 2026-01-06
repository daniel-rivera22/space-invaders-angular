export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

export interface Ship extends Entity {}

export interface Ufo extends Entity {
  id: number;
  hit: boolean;
}

export interface Bullet extends Entity {}

export interface GamePreferences {
  readonly GAME_TIME: number;
  readonly UFOS_TO_DEPLOY: number;
  readonly DOUBLE_SPEED: boolean;
}

export const DEFAULT_GAME_PREFERENCES: GamePreferences = {
  GAME_TIME: 60,
  UFOS_TO_DEPLOY: 5,
  DOUBLE_SPEED: false,
};

/*
  Encapsula todas las variables relacionadas con constantes de los elementos del juego
  Además, es más limpio que dejar las constantes sueltas, y descarga el GameService de estas constantes.
*/
export const GAME_CONFIG = {
  SHIP: {
    WIDTH: 30,
    HEIGHT: 50,
    SPEED: 7,
    SRC: '/assets/ship.png',
    MARGIN_BOTTOM: 50,
  },
  UFO: {
    WIDTH: 40,
    HEIGHT: 40,
    SPEED: 10,
    SRC: '/assets/ufo.png',
  },
  EXPLOSION: {
    DURATION: 800,
    SRC: '/assets/explosion.gif',
  },
  BULLET: {
    WIDTH: 6,
    HEIGHT: 30,
    SPEED: 12,
    SRC: '/assets/bullet.png',
  },
  SCORE_EVENTS: {
    MISSED_BULLET: -25,
    DEFEATED_UFO_SCORE: 100,
  },
};
