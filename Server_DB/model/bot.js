const mongoose = require('mongoose')

const BotSchema = new mongoose.Schema(
	{
		bot_id: { type: String, required: true, unique: true },
        bot_name: { type: String, required: true },
        bot_strategy: { type: String, required: true },
		bot_strategy_options: { type: Object, required: true },
        /** bot_strategy_options example
         * {
         *  ema_short_period: 3, // default value
         *  ema_long_period: 6 // default value
         * }
         */
		status: { type: Boolean, required: true },
		chart_id: { type: String, required: true },
        chart_id_relation: { type: mongoose.Schema.ObjectId, ref: 'ChartSchema', required: true },
        operation: { type: { state: String, price: String}, required: true },
        investment: { type: { investmentType: String, quantity: String }, required: true}
    },
	{ collection: 'bots' }
)

const model = mongoose.model('BotSchema', BotSchema)

module.exports = model
