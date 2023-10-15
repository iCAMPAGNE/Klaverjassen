export interface Card {
    id: number;
    nr: number;
    imageUrl: string;
    suitNr: number;
    moving: boolean;
    x?: number;
    y?: number;
    used: boolean;
    value: number;
}

export const SUIT = [
    { name: 'clubs', symbol: '♧'},
    { name: 'diamonds', symbol: '♦'},
    { name: 'spades', symbol: '♤'},
    { name: 'hearts', symbol: '♥'}
]

export class Offset {
    x: number = 0;
    y: number = 0;
}