import { expect } from 'chai';
import 'mocha';
import 'sinon'
import { Bot } from '../Classes/Bot';
import { Client } from '../Classes/Client';
import { sleep } from '../Classes/Utils';
const dotenv = require('dotenv');
import path from "path";
import Sinon from 'sinon';

dotenv.config({ path: path.resolve(__dirname, "../../tests.env") })

describe('Trading tests', function () {

    this.timeout(0) // disable timemouts on mocha 

    const bot_settings = {
        client: false,
        id: 'testBot',
        chartId: 'testChart',
        symbol: 'btcusdt',
        interval: '1',
        strategy: '2EMA',
        botOptions: { ema_short_period:"3", ema_long_period: "6"},
        investment: {
            "investmentType": "fixedInvestment",
            "quantity": "20"
        },
        isStrategyCustom: false
    }
    var client = new Client(process.env.API_KEY!, process.env.SECRET_KEY!)

    it('should create a valid client', async () => {
        const result = await client.testConnection()
        expect(result).to.be.true;
    })

    it('should create a invalid client', async () => {
        var invalid_client = new Client('', '')
        const result = await invalid_client.testConnection()
        expect(result).to.be.false;
    })

    it('should buy around 30 usdts of BTCUSDT', async () => {
        const result = await client.buy('BTCUSDT', 30)
        const resBool = parseFloat(result.cummulativeQuoteQty) > 29.90 && parseFloat(result.cummulativeQuoteQty) < 30;
        expect(resBool).to.be.true;
    })

    it('should sell 0.0019 BTCUSDT', async () => {
        const result = await client.sell('BTCUSDT', 0.0017)
        const resBool = parseFloat(result.fills[0].qty) === 0.0017;
        expect(resBool).to.be.true;
    })

    it('should get 1000 quantity of BNB from client', async () => {
        const expectedBNB = 1000
        const result = await client.getSymbolBalance('BNB');
        expect(parseInt(result)).to.equal(expectedBNB);
    })

    it('should create a bot', async () => {
        await sleep(3000)
        const bot = new Bot(client, 'user-id', bot_settings.id, bot_settings.chartId,bot_settings.symbol, bot_settings.interval, bot_settings.strategy, bot_settings.botOptions, bot_settings.investment)
        const isBotCreated = bot.isBotActive()
        expect(isBotCreated).to.be.true
    })

    it('should be not started the bot process before the next minut', async () => {
        const bot = new Bot(client, 'user-id', bot_settings.id, bot_settings.chartId,bot_settings.symbol, bot_settings.interval, bot_settings.strategy, bot_settings.botOptions, bot_settings.investment)
        const strategy = bot.strategy;
        const spy = Sinon.spy(strategy, "trading")
        await bot.startBot()
        const miliseconds = await bot.getWaitStart()
        if(miliseconds! > 0) expect(spy.calledOnce).to.be.false;
        bot.deleteBot()
    })

    it('should wait rest of the minut to start the bot', async function () {
        const bot = new Bot(client, 'user-id', bot_settings.id, bot_settings.chartId, bot_settings.symbol, bot_settings.interval, bot_settings.strategy, bot_settings.botOptions, bot_settings.investment)
        const strategy = bot.strategy;
        const spy = Sinon.spy(strategy, "trading");
        const miliseconds = await bot.getWaitStart();
        await bot.startBot()
        console.log('Waiting next minut for the test')
        await sleep(miliseconds!+1000)
        expect(spy.calledOnce).to.be.true;
        bot.deleteBot()
    })

    
})