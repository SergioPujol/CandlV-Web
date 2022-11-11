const got = require('got');

const sendCreateBot = async (data) => {
    return await serverDBReq('createBot', data)
}

const sendDeleteBot = async (data) => {
    return await serverDBReq('deleteBot', data)
}

const sendUpdateOperation = async (data) => {
    return await serverDBReq('updateOperation', data)
}

const sendStopOperation = async (data) => {
    return await serverDBReq('stopOperation', data)
}

const sendStartOperation = async (data) => {
    return await serverDBReq('startOperation', data)
}

const serverDBReq = async (req, data) => {
	const res = await got.post(`http://localhost:3330/${req}/`, { json: data });
	if(res.statusCode == 200 && JSON.parse(res.body).status) return true 
	return false
}

module.exports = {
    sendCreateBot,
	sendDeleteBot,
	sendUpdateOperation,
	sendStopOperation,
	sendStartOperation
}