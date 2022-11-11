export interface EMA {
    listValues: Array<{ EMA: number, date: number }>;
    quantityValues: number;
}

export interface Candle {
    openTime: number;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
    closeTime: number;
    quoteAssetVolume: string;
    numberTrades: number;
    takerBuyBaseAssetVolume: string;
    takerBuyQuoteAssetVolume: string;
}