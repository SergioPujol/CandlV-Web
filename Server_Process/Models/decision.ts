export enum DecisionType {
    /*ExitLong = 'Exit Long',
    ExitShort = 'Exit Short',
    StartLong = 'Start Long',
    StartShort = 'Start Short',*/
    Buy = 'Buy',
    Sell = 'Sell',
    Hold = 'Hold',
}

export interface Decision {
    //type: 'enter' | 'exit' | 'hold' | 'awaitEntry',
    decision: DecisionType, 
    percentage?: string, 
    price: string,
    date: number,
    state: 'None' | 'InLong'
}