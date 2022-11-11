const Trade = require('../model/trade');
const Web = require('../connections/web');
const Bot = require('./bot')

const createTrade = async (data) => {
    // Request from ServerProcess: create trade on the db and send trade to web
    console.log('createTrade');
    const { type, symbol, entry_price, symbol_quantity, usdt_quantity, percentage, time, bot_strategy, bot_options, chart_id, bot_id, user_id } = data;

    const bot_name = await Bot.getBotNameByBotId(bot_id);
    var trade;
    try {
        const response = await Trade.create({ type, symbol, entry_price, symbol_quantity, usdt_quantity, percentage, time, bot_strategy, bot_options, chart_id, bot_id, bot_name: bot_name ? bot_name : '', user_id })
        trade = response
		console.log('Trade created successfully: ', response)
    } catch (error) {
        if (error.code === 11000) {
			// duplicate key
			return { status: 'error', error: 'Trade could not be created' }
		}
		throw error
    }

    const webRes = await Web.sendAddTradeOnWeb(trade)

    if(webRes) return { status: 'ok' }
    return { status: 'error', error: 'Operation could not be updated on Web' }
}

const getAllTrades = async (user_id) => {
    // get all trades
    const trades = await Trade.find({ user_id })

    return trades
}

const getLast20Trades = async (data) => {

    const { userId } = data;
    // get some trades to display on the web
    const first20Trades = (await getAllTrades(userId)).slice(-20);
    return { status: 'ok', data: first20Trades }
}

const deleteTrade = async (data) => {

}

module.exports = {
	createTrade,
    getLast20Trades,
    deleteTrade,
}