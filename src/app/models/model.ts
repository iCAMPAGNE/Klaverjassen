
export interface Card {
    id: number;
    value: number;
    imageUrl: string;
    type: SUIT;
    moving: boolean;
    x?: number;
    y?: number;
    used: boolean;
    score: number;
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
