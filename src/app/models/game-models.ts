export interface Entity {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Ship extends Entity {
    velocidad: number;
}

export interface Bullet extends Entity {
    active: boolean;
}

export interface Ufo extends Entity {
    hit: boolean;
}

