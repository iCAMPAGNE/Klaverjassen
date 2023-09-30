
export interface Card {
    id: number;
    nr: number;
    imageUrl: string;
    suit: SUIT;
    moving: boolean;
    x?: number;
    y?: number;
    used: boolean;
    value: number;
}

export interface Pile {
    cards: Card[];
}


export const SUITS = {
    CLUBS: { name: 'clubs', symbol: '♧'},
    DIAMONDS: { name:  'diamonds', symbol: '♦'},
    SPADES: { name: 'spades', symbol: '♤'},
    HEARTS: { name: 'hearts', symbol: '♥'}
};

export enum SUIT {
    CLUBS = 'clubs',
    DIAMONDS = 'diamonds',
    SPADES = 'spades',
    HEARTS = 'hearts'
}
