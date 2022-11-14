import { BotModel } from "../Models/bot";
import { Trade } from "../Models/trade";
import { Decision, DecisionType } from "../Models/decision";
import { Notification } from './Notification';
import { Bollinger, DEMA, MACD } from "./Strategies";
import { Candle } from "./Candle";
import { getPeriods, sendErrorToWeb } from "./Utils";
import { ServerDBRequest } from "../Requests/serverDB";
import { getPeriodCandleList, getCandlelist } from "../Requests/BinanceAPI"
const fs = require('fs');

const serverDBRequests = new ServerDBRequest();

class Strategy {
    /** Class strategy, abstract strategy
     * Methods for Strategy
     * - decide -> depending on the type of decision, buy, sell, hold, etc ()
     * Necessary abstract methods for Strategy:
     * - Flow
     */

    private bot: BotModel;
    private symbolBoughtQuantity: number = 0;
    private lastEntryPrice: string = '';

    // Trading
    private notification: Notification | undefined;

    private selectedStrategy: DEMA | MACD | Bollinger;

    /* Strategies to be defined */
    private dema: DEMA;
    private macd: MACD;
    private bollinger: Bollinger;

    constructor(_bot: BotModel) {
        this.bot = _bot
        this.notification = new Notification(this.bot.userId, this.bot.botId, this.bot.chartId);

        // Define Strategies
        this.dema = new DEMA(this.bot, this)
        this.macd = new MACD(this.bot, this)
        this.bollinger = new Bollinger(this.bot, this)

        // selected strategy
        this.selectedStrategy = this.dema
        this.selectStrategy(this.bot.strategy)
    }

    async decide(decision: Decision) {
        console.log('decide', decision)
        // Operations
        // if buy, call buy - if sell, call sell
        // then, if respond its fine, sendNotification
        // if decision is hold or await, just sendNotification
        try {
            if(!this.bot.client || decision.decision === DecisionType.Hold) this.notification!.sendNotification(decision)
            else if(decision.decision === DecisionType.Buy) {
                const investmentQuantity = await this.calculateInvestment()
                await this.bot.client.buy(this.bot.symbol, investmentQuantity).then((res: any) => {
                    if(!res) return
                    else {
                        const trade: Trade = {
                            type: 'BUY',
                            symbol: this.bot.symbol,
                            entry_price: res.fills[0].price,
                            percentage: '-',
                            symbol_quantity: res.executedQty,
                            usdt_quantity: res.cummulativeQuoteQty,
                            time: res.transactTime,
                            bot_strategy: this.bot.strategy,
                            bot_options: this.bot.botOptions,
                            chart_id: this.bot.chartId,
                            bot_id: this.bot.botId,
                            user_id: this.bot.userId
                        }
                        // get values to send to Trade DB
                        this.lastEntryPrice = res.fills[0].price;
                        this.symbolBoughtQuantity = res.executedQty
                        this.notification!.sendNotification(decision, trade)
                    }
                })
            } else if(decision.decision === DecisionType.Sell) {
                if(this.symbolBoughtQuantity === 0) {
                    // not sell, because there is no previous bought
                    this.notification!.sendNotification(decision)
                } else {
                    await this.bot.client.sell(this.bot.symbol, this.symbolBoughtQuantity).then((res: any) => {
                        const trade: Trade = {
                            type: 'SELL',
                            symbol: this.bot.symbol,
                            entry_price: res.fills[0].price,
                            percentage: this.getPercentageFromLastCross(res.fills[0].price),
                            symbol_quantity: res.executedQty,
                            usdt_quantity: res.cummulativeQuoteQty,
                            time: res.transactTime,
                            bot_strategy: this.bot.strategy,
                            bot_options: this.bot.botOptions,
                            chart_id: this.bot.chartId,
                            bot_id: this.bot.botId,
                            user_id: this.bot.userId
                        }
                        // get values to send to Trade DB
                        this.symbolBoughtQuantity = 0
                        this.notification!.sendNotification(decision, trade)
                    })
                }
            } 
        } catch (error) {
            console.log('Order could not be completed')
            sendErrorToWeb('Order could not be completed', this.bot.userId, this.bot.botId);
        }
        
    
    }

    private getPercentageFromLastCross(actualPrice: string): string {
        const lastPrice: number = parseFloat(this.lastEntryPrice);
        return (((parseFloat(actualPrice) - lastPrice) / lastPrice) * 100).toFixed(3) + '%'
    }

    private selectStrategy(strategyName: string) {
        switch (strategyName) {
            case '2EMA':
                this.selectedStrategy = this.dema
                break;
            case 'MACD':
                this.selectedStrategy = this.macd
                break;
            case 'Bollinger':
                this.selectedStrategy = this.bollinger
                break;
            default:
                break;
        }
    }

    async trading() {
        console.log('trading')
        // get candles by calling BinanceAPI
        const candles = await getCandlelist(this.bot.symbol, this.bot.interval, '500');
        this.selectedStrategy.flow(candles);
    }

    async calculateInvestment() {
        var usdt = 0

        if(!this.bot.client) return 0

        // if investment is fixedInvesment, just return the quantity
        if(this.bot.investment.investmentType === 'fixedInvestment') {
            usdt = parseInt(this.bot.investment.quantity)
        }
        // if investment is %, ask for USDT and get that %
        else if(this.bot.investment.investmentType === 'percentageInvestment') {
            await this.bot.client.getUsdtBalance().then((res: any) => {
                usdt = res * parseFloat(this.bot.investment.quantity)/100
            })
        }
        return Math.floor(usdt);
    }

    async stopClientOperation() {
        await this.decide({
            decision: DecisionType.Sell,
            percentage: '',
            price: '',
            date: Date.now(),
            state: 'None'
        })
        this.selectedStrategy.changeState('None', '')
    }

    async startClientOperation() {
        await this.decide({
            decision: DecisionType.Buy,
            percentage: '0%',
            price: '',
            date: Date.now(),
            state: 'InLong'
        })
        this.selectedStrategy.changeState('InLong', this.lastEntryPrice)
    }

}

export { Strategy }