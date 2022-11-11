import express from 'express'
import { processBot } from '../processBot'
import bodyParser from 'body-parser'
import cors from 'cors';
import { Bot } from '../Classes/Bot';

class Server {

    // Requests from ServerDB

    app: any = express();
    port: number = 3330;
    processBot: processBot;

    constructor(_processBot: processBot) {
        this.processBot = _processBot;
        
        this.app.use(cors());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(bodyParser.json());
    }

    start() {

        this.app.get('/', (req: any, res: any) => {
            res.send('Express + TypeScript Server');
        });
        
        this.app.listen(this.port, () => {
            console.log(`[server]: Server on Server_Process is running at https://localhost:${this.port}`);
        });

        // Server DB

        this.app.post('/createBot', async (req: any, res: any) => { // Start bot
            const data = req.body; // ex {  }
            console.log('createBot', data)
            if(await this.processBot.addBot(data.user_id, data.chart_id, data.bot_id, data.bot_params, data.bot_options, data.investment)) res.send({status:true})
            else res.send({status:false})
        });

        this.app.post('/deleteBot', async (req: any, res: any) => {
            const data = req.body; // ex {  }
            console.log('deleteBot', data)
            if(await this.processBot.deleteBot(data.user_id, data.bot_id)) res.send({status:true})
            else res.send({status:false})
        });

        this.app.post('/stopOperation', async (req: any, res: any) => {
            const data = req.body; // ex {  }
            console.log('stopOperation', data)
            if(await this.processBot.stopBotOperation(data.user_id, data.bot_id)) res.send({status:true})
            else res.send({status:false})
        });

        this.app.post('/startOperation', async (req: any, res: any) => {
            const data = req.body; // ex {  }
            console.log('startOperation', data)
            if(await this.processBot.startBotOperation(data.user_id, data.bot_id)) res.send({status:true})
            else res.send({status:false})
        });
    }

}

export { Server }