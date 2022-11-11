import got from 'got';
import { Candle } from '../Classes/Candle';


const intervals: any = { '1': '1m', '3': '3m','5': '5m','15': '15m','30': '30m','60': '1h','120': '2h','180': '3h','240': '4h','D': '1d','W': '1s'};

const getKlines = async (symbol: string, interval: string, limit: string) => {
    const { statusCode, body } = await got.get(`https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=${getIntervalString(interval)}&limit=${limit}`); // symbol=BTCUSDT&interval=5m&limit=50
    if(statusCode == 200) return JSON.parse(body);
    else return false
}

const getKlinesFromTo = async (symbol: string, interval: string, period: { from: string, to: string }) => {
    const { statusCode, body } = await got.get(`https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=${getIntervalString(interval)}&startTime=${period.from}&endTime=${period.to}&limit=1000`); // symbol=BTCUSDT&interval=5m&limit=50
    if(statusCode == 200) return JSON.parse(body);
    else return false
}

const getTimeRemainingToNextCandle = async (symbol: string, interval: string) => {
    const { statusCode, body } = await got.get(`https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=${getIntervalString(interval)}&limit=1`); // symbol=BTCUSDT&interval=5m&limit=50
    if(statusCode == 200) return JSON.parse(body)[0][6] + 1001;
    else return false
}

const getCandlelist = async (symbol: string, interval: string, limit: string) => {
    const klinesData = await getKlines(symbol, interval, limit);
    return klinesData.map((list: []) => new Candle(list))
}

const getIntervalString = (minValue: string): string => {
    return intervals[minValue]
}

const getPeriodCandleList = async (symbol: string, interval: string, period: { from: string, to: string }) => {
    const klinesData = await getKlinesFromTo(symbol, interval, period);
    return klinesData.map((list: []) => new Candle(list))
}
    


export { getKlines, getKlinesFromTo, getCandlelist, getIntervalString, getPeriodCandleList, getTimeRemainingToNextCandle }