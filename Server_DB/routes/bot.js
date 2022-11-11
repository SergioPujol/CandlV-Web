const Bot = require('../model/bot');
const Chart = require('./chart');
const ServerProcess = require('../connections/serverProcess');
const Web = require('../connections/web');
const _ = require('lodash');

/**
 * TODO:
 * - create bot method -> start task on server process
 * - delete bot method -> delete bot task on server process
 * - change bot status -> if status false -> delete bot task on server process
 * - get bots from chart to load on trading html
 */

 const createBot = async (data) => {
    console.log('createBot')
    const { botId, botName, botStrategy, botOptions, botStatus, chartId, investment } = data;
    
    const chart_id_relation = await Chart.getIdByChartId(chartId)
    if(!chart_id_relation) return { status: 'error', error: 'Chart not found' }

    try {
		const response = await Bot.create({
			bot_id: botId,
			bot_name: botName,
			bot_strategy: botStrategy,
			bot_strategy_options: botOptions,
			status: botStatus,
			chart_id: chartId,
			chart_id_relation,
			operation: { state: '', price: '', percentage: '' },
			investment
		})
		console.log('Bot created successfully: ', response)
	} catch (error) {
		if (error.code === 11000) {
			// duplicate key
			return { status: 'error', error: 'Bot already exists' }
		}
		throw error
	}

	// create bot in server process
	// if status true from serverProcess, return status 'ok'
	const chartParams = await Chart.getChartParamsByChartId(chartId) // { symbol, interval }
	const chartUserId = await Chart.getUserIdByChartId(chartId)
	const serverProcessRes = await ServerProcess.sendCreateBot({user_id: chartUserId, bot_id: botId, chart_id: chartId, bot_params: { status: botStatus, ...chartParams, strategy: botStrategy }, bot_options: botOptions, investment})

	if(serverProcessRes) return { status: 'ok' }
	return { status: 'error', error: 'Bot could not be created' }

}

const deleteBot = async (data) => {
    console.log('deleteBot')

    const { botId, chartId } = data;
    const chart_id = chartId, bot_id = botId;
	
    const chart_id_relation = await Chart.getIdByChartId(chartId)
    if(!chart_id_relation) return { status: 'error', error: 'Chart not found' }

    try {
		const response = await Bot.deleteOne({ bot_id, chart_id })
        console.log('Bot deleted: ', response)
        if(response.deletedCount == 0) {
            return { status: 'error', error: 'Bot trying to delete does not exist' }
        }
	} catch (error) {
		if (error.code === 11000) {
			// duplicate key
			return { status: 'error', error: 'Bot could not be deleted' }
		}
		throw error
	}

	const chartUserId = await Chart.getUserIdByChartId(chartId) //user_id: chartUserId, 
	const serverProcessRes = await ServerProcess.sendDeleteBot({user_id: chartUserId, bot_id: botId})

	if(serverProcessRes) return { status: 'ok' }
	return { status: 'error', error: 'Bot could not be deleted' }
}

const getChartsBots = async (data) => {
    console.log('getChartsBots')

    const { chartId } = data
    const chart_id = chartId;

    const bots = await Bot.find({ chart_id })

    const data_charts = bots.map((bot) => {
        return {
            chartId,
			botId: bot.bot_id,
			name: bot.bot_name,
			strategy: bot.bot_strategy,
            botOptions: bot.bot_strategy_options,
            status: bot.status,
			operation: bot.operation,
			investment: bot.investment
        }
    })

    return { status: 'ok', data: data_charts }
}

const updateStatusBot = async (data) => {
    console.log('updateStatusBot')

	const { botId, chartId, status } = data;
    const chart_id = chartId, bot_id = botId;

	const chart_id_relation = await Chart.getIdByChartId(chartId)
    if(!chart_id_relation) return { status: 'error', error: 'Chart not found' }

    try {
		const response = await Bot.updateOne({ bot_id, chart_id }, { status, ...(!status && { operation: { state: 'Stopped', price: '', percentage: ''}}) })
        console.log('Bot updated: ', response)
        if(response.nModified == 0) {
            return { status: 'error', error: 'Bot trying to update does not exist' }
        }
	} catch (error) {
		if (error.code === 11000) {
			// duplicate key
			return { status: 'error', error: 'Bot could not be updated' }
		}
		throw error
	}
	const chartUserId = await Chart.getUserIdByChartId(chartId) //user_id: chartUserId, 

	if(status) {
		const chartParams = await Chart.getChartParamsByChartId(chartId) // { symbol, interval }
		const bot = await Bot.findOne({ chart_id, bot_id });
		let serverProcessRes = await ServerProcess.sendCreateBot({user_id: chartUserId, bot_id: botId, chart_id: chartId, bot_params: { status: status, ...chartParams, strategy: bot.bot_strategy }, bot_options: bot.bot_strategy_options, investment: bot.investment})

		if(serverProcessRes) return { status: 'ok' }
		return { status: 'error', error: 'Bot could not be created' }
	} else {
		let serverProcessRes = await ServerProcess.sendDeleteBot({user_id: chartUserId, bot_id: botId})

		if(serverProcessRes) return { status: 'ok' }
		return { status: 'error', error: 'Bot could not be deleted' }
	}
}

const updateOptionsBot = async (data) => {
    console.log('updateOptionsBot')

	/**Process
	 * 1. get bot by charts id and bot id
	 * 2. check if strategies from request and current on DB are the same
	 * 3. if are the same, dont do anything, status: ok
	 * 4. if not the same, SEND REQUEST TO SERVER PROCESS TO CHANGE BOT, 
	 * 5. IF request from server Process is OK, change on db
	*/

	const { botId, chartId, strategy, strategyOptions, investment } = data;
	const chart_id = chartId, bot_id = botId;

	const bot = await Bot.findOne({ chart_id, bot_id, bot_strategy: strategy });

	if(bot) {
		if(_.isEqual(bot.bot_strategy_options, strategyOptions) && _.isEqual(bot.invesment, investment)) return { status: 'ok' }
		else {
			// Update values and send request to server process
			console.log('bot', bot)
			try {
				const response = await Bot.updateOne({ bot_id }, { bot_strategy_options: strategyOptions, investment })
				console.log('Bot updated: ', response)
				if(response.nModified == 0) {
					return { status: 'error', error: 'Bot trying to update does not exist' }
				}
			} catch (error) {
				if (error.code === 11000) {
					// duplicate key
					return { status: 'error', error: 'Bot could not be updated' }
				}
				throw error
			}
		}
	}
	else return { status: 'error', error: 'Bot does not exist' }

    return { status: 'ok' }
}

const updateStrategyAndOptionsBot = async (data) => {
    console.log('updateOptionsBot')

	/* 
		changed strategy and options
	 */

    try {
		const response = await Chart.updateOne({ chart_id: data.chartId }, { chart_options: data.chartOptions })
        console.log('Chart updated: ', response)
        if(response.nModified == 0) {
            return { status: 'error', error: 'Chart trying to update does not exist' }
        }
	} catch (error) {
		if (error.code === 11000) {
			// duplicate key
			return { status: 'error', error: 'Chart could not be updated' }
		}
		throw error
	}

    return { status: 'ok' }
}

const stopOperationFromWeb = async (data) => {

	const { botId, userId } = data;
	// send request to Server Process
	let serverProcessRes = await ServerProcess.sendStopOperation({user_id: userId,bot_id: botId})

	if(serverProcessRes) return { status: 'ok' }
	return { status: 'error', error: 'Bot operation could not be stopped' }

}

const startOperationFromWeb = async (data) => {

	const { botId, userId } = data;
	// send request to Server Process
	let serverProcessRes = await ServerProcess.sendStartOperation({user_id: userId,bot_id: botId})

	if(serverProcessRes) return { status: 'ok' }
	return { status: 'error', error: 'Bot operation could not be started' }

}

const updateBotOperationFromServerProcess = async (data) => {
	const resUpdate = await updateBotOperation(data);

	// send request to Web
	if(resUpdate.status === 'ok') {
		const webRes = await Web.sendUpdateOperationOnWeb(data)

		if(webRes) return { status: 'ok' }
		return { status: 'error', error: 'Operation could not be updated on Web' }
	}

}

const updateBotOperation = async (data) => {

	const { botId, operation } = data;
	const bot_id = botId;

	const bot = await Bot.findOne({ bot_id });

	if(bot) {
		try {
			const response = await Bot.updateOne({ bot_id }, { operation })
			console.log('Bot updated: ', response)
			if(response.nModified == 0) {
				return { status: 'error', error: 'Bot trying to update does not exist' }
			}
		} catch (error) {
			if (error.code === 11000) {
				// duplicate key
				return { status: 'error', error: 'Bot operation could not be updated' }
			}
			throw error
		}
	}
	else return { status: 'error', error: 'Bot does not exist' }

    return { status: 'ok' }
}

const stopAllBots = async () => {
    console.log('stopAllBots')

    try {
		const response = await Bot.updateMany({}, { status: false, operation: { state: 'Stopped', price: '', percentage: ''} });
        console.log('Bots updated: ', response)
        if(response.nModified == 0) {
            return { status: 'error', error: 'Bot trying to update does not exist' }
        }
	} catch (error) {
		if (error.code === 11000) {
			// duplicate key
			return { status: 'error', error: 'Bot could not be updated' }
		}
		throw error
	}

	return { status: 'ok' }
}

const getBotNameByBotId = async (bot_id) => {
    console.log('getBotNameByBotId')
	const bot = await Bot.findOne({ bot_id }).lean();
	if (!bot) {
		return false
	}

	return bot.bot_name
}

module.exports = {
	createBot,
	getChartsBots,
	deleteBot,
	updateStatusBot,
	updateOptionsBot,
	stopOperationFromWeb,
	startOperationFromWeb,
	updateBotOperationFromServerProcess,
	stopAllBots,
	getBotNameByBotId
}