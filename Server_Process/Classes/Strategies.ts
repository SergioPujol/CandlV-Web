import { Strategy } from "./Strategy";
import { Candle } from "./Candle";
import { EMA } from "./EMA";
import { BotModel } from "../Models/bot";
import { BollingerObj, DEMAObj, MACDObj, PriceDateObj } from "../Models/strategies";
import { Decision, DecisionType } from "../Models/decision";
import { calculateEMA, calculateMultiplicator, calculateSMA, calculateSMAWithEMA, getArrayClosePrice, getBollingerBands, getLastArrayItem } from "./Utils";

abstract class Strategies {
    bot: BotModel;
    strategyClass: Strategy;

    state: 'None' | 'InLong' = 'None';
    signal: DecisionType = DecisionType.Hold;

    pricedateObject: PriceDateObj | undefined;
    lastCallPrice: string = '0';

    constructor(_bot: BotModel, _strategyClass: Strategy) {
        this.bot = _bot;
        this.strategyClass = _strategyClass;
    }

    abstract flow(candles: Candle[]): Promise<void>;

    abstract updateSignal(): void;

    decideAct() {

        if(this.state == 'InLong' && this.signal == DecisionType.Sell) {
            // Exit Long
            this.state = 'None';
            this.strategyClass.decide({
                decision: DecisionType.Sell,
                percentage: this.getPercentageFromLastCross(this.pricedateObject!.actualPrice),
                price: this.pricedateObject!.actualPrice,
                date: this.pricedateObject!.actualDate,
                state: this.state
            })
            this.updateSignal();
        } else if(this.state == 'None' && this.signal == DecisionType.Buy) {
            // Go Long
            this.state = 'InLong';
            let decision: Decision = {
                decision: DecisionType.Buy,
                percentage: '-',
                price: this.pricedateObject!.actualPrice,
                date: this.pricedateObject!.actualDate,
                state: this.state
            }
            this.lastCallPrice = this.pricedateObject!.actualPrice
            this.strategyClass.decide(decision)
        } else if(this.state == 'InLong' && this.signal == DecisionType.Hold) {
             let decision: Decision = {
                decision: DecisionType.Hold,
                percentage: this.getPercentageFromLastCross(this.pricedateObject!.actualPrice),
                price: this.pricedateObject!.actualPrice,
                date: this.pricedateObject!.actualDate,
                state: this.state
            }
            this.strategyClass.decide(decision)
        }
        console.log(this.state, this.signal)
    }

    private getPercentageFromLastCross(actualPrice: string): string {
        const lastPrice: number = parseFloat(this.lastCallPrice);
        return (((parseFloat(actualPrice) - lastPrice) / lastPrice) * 100).toFixed(3) + '%'
    }

    changeState(state: "None" | "InLong") {
        this.state = state;
        if(state === "InLong") this.lastCallPrice = this.pricedateObject!.actualPrice
    }

}

class DEMA extends Strategies {

    private periods: Array<number>;
    private demaObject: DEMAObj | undefined;

    constructor(_bot: BotModel, _strategyClass: Strategy) {
        super(_bot, _strategyClass)
        this.periods = [parseInt(this.bot.botOptions.ema_short_period), parseInt(this.bot.botOptions.ema_long_period)]
    }

    async flow(candles: Candle[]) {

        var EMAs: Array<EMA> = [];

        this.periods.forEach(period => {
            let previousEma = calculateSMA(candles, period)
            let multiplicator = calculateMultiplicator(period);
            let listEMAs: Array<{ EMA: number, date: number }> = [];
            for (let ind = 0; ind < (candles.length - period); ind++) {
                let actualCandel: Candle = candles[ind + period];
                let ema = calculateEMA(previousEma, multiplicator, parseFloat(actualCandel.getClose()))
                listEMAs.push({ EMA: ema, date: actualCandel.getOpenTime() })
                previousEma = ema
            }

            EMAs.push(new EMA(listEMAs, period))
        });

        this.pricedateObject = {
            actualPrice: candles[candles.length-1].getClose(),
            actualDate: candles[candles.length-1].getOpenTime()
        }
        this.demaObject = {
            fastEMA: EMAs[0],
            slowEMA: EMAs[1]
        }
        this.updateSignal()
    }

    updateSignal() {
        const fastEma = this.demaObject!.fastEMA.getLastPoint().EMA // Small period - fast ema
        const slowEma = this.demaObject!.slowEMA.getLastPoint().EMA // Big period - slow ema
        const basePrice = parseFloat(this.pricedateObject!.actualPrice)
        if(this.state == 'None') {
            if(fastEma > slowEma && basePrice > fastEma) this.signal = DecisionType.Buy
            else if(fastEma < slowEma && basePrice < fastEma) this.signal = DecisionType.Sell
            else this.signal = DecisionType.Hold
        } 
        else if(this.state == 'InLong' && basePrice < slowEma) this.signal = DecisionType.Sell // Abort Long
        else this.signal = DecisionType.Hold

        this.decideAct()
    }
}

class MACD extends Strategies {
    
    private periods: Array<number>;
    private macdObject: MACDObj | undefined;

    constructor(_bot: BotModel, _strategyClass: Strategy) {
        super(_bot, _strategyClass)
        this.periods = [parseInt(this.bot.botOptions.ema_short_period), parseInt(this.bot.botOptions.ema_long_period)]
    }

    async flow(candles: Candle[]) {

        var EMAs: Array<EMA> = [];

        /*
        Flow:
        1. Calculate EMas of short_period and long_period
        2. Calculate MACD Line = short_period ema - long_period ema
        3. Calculate Ema of the MACD Line
        */

        // calculate Short Period and Long Period EMAs
        this.periods.forEach(period => {
            let previousEma = calculateSMA(candles, period)
            let multiplicator = calculateMultiplicator(period);
            let listEMAs: Array<{ EMA: number, date: number }> = [];
            for (let ind = 0; ind < (candles.length - period); ind++) {
                let actualCandel: Candle = candles[ind + period];
                let ema = calculateEMA(previousEma, multiplicator, parseFloat(actualCandel.getClose()))
                listEMAs.push({ EMA: ema, date: actualCandel.getOpenTime() })
                previousEma = ema
            }

            EMAs.push(new EMA(listEMAs, period))
        });

        // calculate MACD Line
        const macdLine = this.calculateMACDLine(EMAs[0], EMAs[1]);

        // calculate Signal line with EMA of the MACD Line
        const signalLine = this.calculateSignalLine(macdLine, parseInt(this.bot.botOptions.signal_period));

        this.pricedateObject = {
            actualPrice: candles[candles.length-1].getClose(),
            actualDate: candles[candles.length-1].getOpenTime()
        }
        this.macdObject = {
            MACDLineEMA: macdLine,
            SignalLineEMA: signalLine,
        }
        this.updateSignal()
    }

    updateSignal() {
        const macd = this.macdObject!.MACDLineEMA[this.macdObject!.MACDLineEMA.length - 1].EMA
        const signal = this.macdObject!.SignalLineEMA[this.macdObject!.SignalLineEMA.length - 1].EMA

        const macdHistogram = macd - signal;

        if(this.state == 'None') {
            if(macdHistogram > 0) this.signal = DecisionType.Buy
            else if(macdHistogram < 0) this.signal = DecisionType.Sell
            else this.signal = DecisionType.Hold
        }
        else if(this.state == 'InLong' && macdHistogram < 0) this.signal = DecisionType.Sell // Abort Long
        else this.signal = DecisionType.Hold

        this.decideAct()
    }

    private calculateMACDLine(short_EMA: EMA, long_EMA: EMA): Array<{ EMA: number, date: number }> {
        var MACDLine: Array<{ EMA: number, date: number }> = []

        var shortEMAValues: Array<{ EMA: number, date: number }> = short_EMA.getListValues();
        var longEMAValues: Array<{ EMA: number, date: number }> = long_EMA.getListValues();

        const revertedShortValues = shortEMAValues.reverse();
        const revertedLongValues = longEMAValues.reverse();

        for (let i = 0; i < revertedLongValues.length; i++) {
            MACDLine.push({ EMA: revertedShortValues[i].EMA - revertedLongValues[i].EMA, date: revertedLongValues[i].date })
        }
        return MACDLine.reverse();
    }

    private calculateSignalLine(macdLine: Array<{ EMA: number, date: number }>, signalPeriod: number) {
        let previousEma = calculateSMAWithEMA(macdLine, signalPeriod);
        let multiplicator = calculateMultiplicator(signalPeriod);
        let listEMAs: Array<{ EMA: number, date: number }> = [];
        for (let ind = 0; ind < (macdLine.length); ind++) {
            let actualCandel: { EMA: number, date: number } = macdLine[ind];
            let ema = calculateEMA(previousEma, multiplicator, actualCandel.EMA)
            listEMAs.push({ EMA: ema, date: actualCandel.date })
            previousEma = ema
        }

        return listEMAs
    }
}

class Bollinger extends Strategies {

    private bollingerObject: BollingerObj | undefined;
    private period: number;
    private times: number;

    constructor(_bot: BotModel, _strategyClass: Strategy) {
        super(_bot, _strategyClass)
        this.period = this.bot.botOptions.period
        this.times = this.bot.botOptions.times
    }

    async flow(candles: Candle[]) {

        /* 
        Flow:
        1. Get close price of candles
        2. Calculate bollinger data with close price list
        */

        const closeCandleValues = getArrayClosePrice(candles);
        this.bollingerObject = { ...getBollingerBands(closeCandleValues, this.period, this.times), closeValues: closeCandleValues }

        this.pricedateObject = {
            actualPrice: candles[candles.length-1].getClose(),
            actualDate: candles[candles.length-1].getOpenTime()
        }

        this.updateSignal()
    }

    updateSignal(): void {

        const bollingerLastValue = {
            upperBound: getLastArrayItem(this.bollingerObject!.upperBound),
            midBound: getLastArrayItem(this.bollingerObject!.midBound),
            lowerBound: getLastArrayItem(this.bollingerObject!.lowerBound),
        };
        const lastCloseValue = getLastArrayItem(this.bollingerObject!.closeValues);

        if(this.state == 'None') {
            if(lastCloseValue <= bollingerLastValue.lowerBound) this.signal = DecisionType.Buy
            else if(lastCloseValue >= bollingerLastValue.upperBound) this.signal = DecisionType.Sell
            else this.signal = DecisionType.Hold
        }
        else if(this.state == 'InLong' && lastCloseValue >= bollingerLastValue.upperBound) this.signal = DecisionType.Sell // Abort Long
        else this.signal = DecisionType.Hold

        this.decideAct()
    }
}

export {
    Strategies,
    DEMA,
    MACD,
    Bollinger
}