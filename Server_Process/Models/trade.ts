export interface Trade {
    type: 'BUY' | 'SELL';
    symbol: string;
    entry_price: string;
    symbol_quantity: string;
    usdt_quantity: string;
    time: string;
    bot_strategy: string;
    bot_options: any;
    chart_id: string;
    bot_id: string;
    user_id: string;

    percentage?: string;
}