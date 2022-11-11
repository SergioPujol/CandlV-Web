const got = require('got');

const sendUpdateOperationOnWeb = async (data) => {
	console.log('updateOperation', data)
    return await webReq('updateOperation', data)
}

const sendAddTradeOnWeb = async (data) => {
	console.log('addTrade', data)
    return await webReq('addTrade', data)
}

const webReq = async (req, data) => {
	const res = await got.post(`http://localhost:3000/${req}/`, { json: data });
	if(res.statusCode == 200 && JSON.parse(res.body).status) return true 
	return false
}

module.exports = {
	sendUpdateOperationOnWeb,
	sendAddTradeOnWeb
}