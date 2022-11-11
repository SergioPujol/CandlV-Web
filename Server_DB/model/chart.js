const mongoose = require('mongoose')

const ChartSchema = new mongoose.Schema(
	{
		user_id: { type: String, required: true },
		chart_id: { type: String, required: true, unique: true },
		chart_options: { type: {
            symbol: String,
            interval: String
        }, required: true },
		minimized: { type: Boolean, required: true },
	},
	{ collection: 'charts' }
)

const model = mongoose.model('ChartSchema', ChartSchema)

module.exports = model
