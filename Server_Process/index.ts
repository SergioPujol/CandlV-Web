
import { Client } from './Classes/Client'
import { processBot } from './processBot'
import { Server } from './Servers/server'
import { ServerDBRequest } from "./Requests/serverDB";
import { sleep } from './Classes/Utils';

(async () => {
    await sleep(4000) // Wait for ServerDB to load
    const bots = new processBot();
    const server = new Server(bots);
    server.start()
})();

