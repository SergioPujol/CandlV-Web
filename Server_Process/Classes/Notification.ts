import { Decision } from "../Models/decision";
import { Trade } from "../Models/trade";
import { ServerDBRequest } from "../Requests/serverDB";
import * as _ from 'lodash';

const serverDBRequests = new ServerDBRequest();

class Notification {

    private botId: string;
    private chartId: string;
    private userId: string;
    constructor(_userId: string, _botId: string, _chartId: string) {
        this.botId = _botId;
        this.chartId = _chartId;
        this.userId = _userId;
    }

    private currentOperationStatus: { state: String, price: String, percentage: String } = { state: '', price: '', percentage: '' };

    sendNotification(decision: Decision, trade: Trade | undefined = undefined) {
        
        // send trade to DB
        if(trade) this.sendTrade(trade)

        // send operation change to DB
        /* Or in Long, in Short or in await Entry */
        this.sendOperationChange(decision)

    }

    sendTrade(trade: Trade) {
        console.log('sendTrade', trade)
        serverDBRequests.sendDBAddTrade(trade)
    }

    sendOperationChange(decision: Decision) {
        const operation = { state: decision.state, price: decision.price, percentage: decision.percentage! };

        if(!_.isEqual(this.currentOperationStatus, operation)) {
            serverDBRequests.sendDBOperationUpdate({ userId: this.userId, botId: this.botId, chartId: this.chartId, operation})
        }

        this.currentOperationStatus = operation;
        
    }

}

export { Notification }