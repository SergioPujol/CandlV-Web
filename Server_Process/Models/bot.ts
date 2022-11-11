import { Client } from "../Classes/Client";

export interface BotModel {
    client: Client; // not necessary of simulation

    userId: string;
    botId: string;
    chartId: string;
    symbol: string;
    interval: string;
    strategy: string;
    botOptions: any;

    investment: { investmentType: string, quantity: string };
}