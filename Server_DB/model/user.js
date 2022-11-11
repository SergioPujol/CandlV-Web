const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
	{
		email: { type: String, required: true, unique: true },
		key: { type: String, required: true, unique: true },
		//instanceID: { type: String, required: true }
	},
	{ collection: 'users' }
)

const model = mongoose.model('UserSchema', UserSchema)

module.exports = model
