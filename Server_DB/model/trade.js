const mongoose = require('mongoose')

const ChartSchema = new mongoose.Schema(
	{
		type: { type: String, required: true },
		symbol: { type: String, required: true },
		entry_price: { type: String, required: true },
		symbol_quantity: { type: String, required: true },
		usdt_quantity: { type: String, required: true },
		percentage: { type: String, required: true },
		time: { type: String, required: true },
        bot_strategy: { type: String, required: true },
		bot_options: { type: Object, required: true },
        chart_id: { type: String, required: true },
        bot_id: { type: String, required: true },
        bot_name: { type: String, required: true },
		user_id: { type: String, required: true }, 
	},
	{ collection: 'trades' }
)

const model = mongoose.model('TradeSchema', ChartSchema)

module.exports = model