import { EMA } from "../Classes/EMA";

export interface PriceDateObj {
    actualPrice: string;
    actualDate: number;
}

export interface DEMAObj {
    fastEMA: EMA;
    slowEMA: EMA;
}

export interface MACDObj {
    MACDLineEMA: Array<{ EMA: number, date: number }>;
    SignalLineEMA: Array<{ EMA: number, date: number }>;
}

export interface BollingerObj {
    upperBound: Array<number>;
    midBound: Array<number>;
    lowerBound: Array<number>;
    closeValues: Array<number>;
}