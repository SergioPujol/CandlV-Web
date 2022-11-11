class Candle {

    private openTime: number;
    private open: string;
    private high: string;
    private low: string;
    private close: string;
    private volume: string;
    private closeTime: number;
    private quoteAssetVolume: string;
    private numberTrades: number;
    private takerBuyBaseAssetVolume: string;
    private takerBuyQuoteAssetVolume: string;

    constructor( candleData: Array<any> ) { //openTime, open, high, low, close, volume, closeTime, quoteAssetVolume, numberTrades, TakerBuyBaseAssetVolume, TakerBuyQuoteAssetVolume) {
        this.openTime = candleData[0];
        this.open = candleData[1];
        this.high = candleData[2];
        this.low = candleData[3];
        this.close = candleData[4];
        this.volume = candleData[5];
        this.closeTime = candleData[6];
        this.quoteAssetVolume = candleData[7];
        this.numberTrades = candleData[8];
        this.takerBuyBaseAssetVolume = candleData[9];
        this.takerBuyQuoteAssetVolume = candleData[10];
    }

    getOpenTime() { return this.openTime }

    getOpen() { return this.open }
    
    getHigh() { return this.high }
    
    getLow() { return this.low }
    
    getClose() { return this.close }
    
    getVolume() { return this.volume }
    
    getCloseTime() { return this.closeTime }
    
    getQuoteAssetVolume() { return this.quoteAssetVolume }
    
    getNumberTrades() { return this.numberTrades }
    
    getTakerBuyBaseAssetVolume() { return this.takerBuyBaseAssetVolume }
    
    getTakerBuyQuoteAssetVolume() { return this.takerBuyQuoteAssetVolume }

}

export { Candle }