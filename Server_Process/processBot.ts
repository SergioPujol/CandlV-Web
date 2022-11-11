import { Bot } from './Classes/Bot';
import { Client } from './Classes/Client';
import { ServerDBRequest } from "./Requests/serverDB";

const serverDBRequests = new ServerDBRequest();

class processBot {

    bots: any = {}; // { bot_id: new Bot(params to create bot) }

    constructor() {
        this.bots;
    }

    async addBot(user_id: string, chart_id: string, bot_id: string, { status, symbol, interval, strategy }: any, botOptions: any, investment: { investmentType: string, quantity: string }) {
        try {
            const keys = await serverDBRequests.getApiKeys(user_id).then((res: any) => {
                if(res) {
                    return res.keys;
                } else {
                    return {
                        pb_bkey: '',
                        pv_bkey: '',
                        testnet: true
                    }
                }
            });
            const client: Client = new Client(keys.pb_bkey, keys.pv_bkey, keys.testnet);
            if(!this.bots[user_id]) this.bots[user_id] = {}
            this.bots[user_id][bot_id] = new Bot(client, user_id, bot_id, chart_id, symbol, interval, strategy, botOptions, investment);
            this.bots[user_id][bot_id].startBot()
            return true
        } catch (error) {
            console.log(`Error creating bot ${bot_id} on chart ${chart_id} for user ${user_id}`)
            return false
        }
    }

    deleteBot(user_id: string, bot_id: string) {
        try {
            this.bots[user_id][bot_id].deleteBot();
            delete this.bots[user_id][bot_id];
            if(Object.keys(this.bots[user_id].length == 0)) delete this.bots[user_id];
            return true
        } catch (error) {
            console.log(`Error deleting bot on Server Process ${bot_id}`)
            return true
        }
    }

    getNumUsersRunningBots() {
        return Object.keys(this.bots).length
    }

    getNumRunningBotsByUser(user_id: string) {
        return Object.keys(this.bots[user_id]).length
    }

    async stopBotOperation(user_id: string, bot_id: string) {
        try {
            await this.bots[user_id][bot_id].stopOperation();
            return true
        } catch (error) {
            return false
        }
    }

    async startBotOperation(user_id: string, bot_id: string) {
        try {
            await this.bots[user_id][bot_id].startOperation();
            return true
        } catch (error) {
            return false
        }
    }
}

export { processBot }