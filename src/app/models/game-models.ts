export interface Entity {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
}

export interface Ship extends Entity {
    
}

export interface Bullet extends Entity {
    active: boolean;
}

export interface Ufo extends Entity {
    direction: number;
    hit: boolean;
}

/*
  Encapsula todas las variables relacionadas con constantes de los elementos del juego
  Además, es más limpio que dejar las constantes sueltas, y descarga el GameService de estas constantes.
*/
export const GAME_CONFIG = {
  SHIP: {
    WIDTH: 30,
    HEIGHT: 50,
    SRC: 'assets/ship.png',
  },
  UFO: {
    WIDTH: 40,
    HEIGHT: 40,
    SRC: 'assets/ufo.png',
  },
  BULLET: {
    WIDTH: 2,
    HEIGHT: 5,
    COLOR: 'red',
  }
};