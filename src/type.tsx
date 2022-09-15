export enum OT { MD, D, BOTH, COST }
export enum OHT {DEL, ADD, MOVE, UPDATE}
export enum MOVE {UP, DOWN}

export type Operation = {
    md: string,
    d: string,
    cost: number
}
export type OperationHistory = {
    type: OHT,
    old: Operation,
    i?: number,
    m?: MOVE
}
export type AccountSides = {
    i: number, 
    cost: number
}
export type Account = {
    name: string,
    over: []
    md: AccountSides[],
    d: AccountSides[]
}
