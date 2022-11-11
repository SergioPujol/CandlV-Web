const Settings = require('../model/settings');
const cryptojs = require('crypto-js')
const k = 'lkgna8723nlkfmas23#11]sad';

const saveKeys = async (data) => {
	const { userId } = data
	const { pb_bkey, pv_bkey } = encryptKeys(data);
	const { testnet } = data;
	var response;
    const settings = await Settings.find({ user_id: userId });
	if(settings.length > 0) {
		// update settings
		response = await updateSettings(settings[0]._id, { pb_bkey: pb_bkey, pv_bkey: pv_bkey, testnet, user_id: userId })
	} else {
		// create settings
		response = await createSettings({ pb_bkey, pv_bkey, testnet, user_id: userId  })
	}
	console.log('Settings saved successfully: ', response)
	return response;
    
}

const updateSettings = async (id, settings) => {
	try {
		const response = await Settings.updateOne({ _id: id }, settings);
		console.log('Settings updated: ', response)
		if(response.nModified == 0) {
			return { status: 'error', error: 'Keys could not be saved' }
		}
	} catch (error) {
		console.log(error)
		return { status: 'error', error: 'Error saving Binance Keys' }
	}
	return { status: 'ok' }
} 

const createSettings = async (keys) => {
	try {
		await Settings.create(keys)
	} catch (error) {
		console.log(error)
		return { status: 'error', error: 'Error saving Binance Keys' }
	}
	return { status: 'ok' }
}

const encryptKeys = (data) => {
	const { pb_bkey, pv_bkey } = data;
	return {
		pb_bkey: cryptojs.AES.encrypt(pb_bkey, k).toString(),
		pv_bkey: cryptojs.AES.encrypt(pv_bkey, k).toString(),
	}
}

const getKeys = async (userId) => {
    const settings = await Settings.find({ user_id: userId });
	var keys = {}
	if(settings.length > 0) {
		keys = {
			pb_bkey: settings[0].pb_bkey,
			pv_bkey: settings[0].pv_bkey,
			testnet: settings[0].testnet,
		}
		return { status: 'ok' , keys }
	} else {
		return { status: 'error', error: 'No keys stored' }
	}
}

module.exports = {
    saveKeys,
	getKeys
}