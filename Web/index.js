const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const got = require('got');
const WebSocket = require('ws');

const app = express();
const router = express.Router();

const port = 3000;
const wssPort = 3001;

app.use('/', express.static(path.join(__dirname, 'public')));
app.use('/', router);
app.use(bodyParser.json());

router.get('/',function(req,res){
    res.sendFile(path.join(__dirname+'/public/launcher.html'));
    //__dirname : It will resolve to your project folder.
});

app.post('/api/verify', async (req, res) => {
	return await res.json(await serverUserDBReq('user', {
		method: 'verify',
		data: req.body
	}))
})

app.post('/api/registerKeys', async (req, res) => {
	return await res.json(await serverDBReq('settings', {
		method: 'saveKeys',
		data: req.body
	}))
})

app.post('/api/importStrategy', async (req, res) => {
	return await res.json(await serverDBReq('strategies', {
		method: 'createStrategy',
		data: req.body
	}))
})

app.post('/api/deleteStrategy', async (req, res) => {
	return await res.json(await serverDBReq('strategies', {
		method: 'deleteStrategy',
		data: req.body
	}))
})

app.post('/api/getStrategyObjects', async (req, res) => {
	return await res.json(await serverDBReq('strategies', {
		method: 'getStrategyObjects',
		data: req.body
	}))
})

app.post('/api/createChart', async (req, res) => {
	return await res.json(await serverDBReq('chart', {
		method: 'createChart',
		data: req.body
	}))
})

app.post('/api/getCharts', async (req, res) => {
	return await res.json(await serverDBReq('chart', {
		method: 'getCharts',
		data: req.body
	}))
})

app.post('/api/deleteChart', async (req, res) => {
	return await res.json(await serverDBReq('chart', {
		method: 'deleteChart',
		data: req.body
	}))
})

app.post('/api/updateChart', async (req, res) => {
	return await res.json(await serverDBReq('chart', {
		method: 'updateChart',
		data: req.body
	}))
})

app.post('/api/createBot', async (req, res) => {
	return await res.json(await serverDBReq('bot', {
		method: 'createBot',
		data: req.body
	}))
})

app.post('/api/deleteBot', async (req, res) => {
	return await res.json(await serverDBReq('bot', {
		method: 'deleteBot',
		data: req.body
	}))
})

app.post('/api/stopOperation', async (req, res) => {
	return await res.json(await serverDBReq('bot', {
		method: 'stopOperationFromWeb',
		data: req.body
	}))
})

app.post('/api/startOperation', async (req, res) => {
	return await res.json(await serverDBReq('bot', {
		method: 'startOperationFromWeb',
		data: req.body
	}))
})

app.post('/api/updateStatusBot', async (req, res) => {
	return await res.json(await serverDBReq('bot', {
		method: 'updateStatusBot',
		data: req.body
	}))
})

app.post('/api/updateStrategyOptionsBot', async (req, res) => {
	return await res.json(await serverDBReq('bot', {
		method: 'updateStrategyOptionsBot',
		data: req.body
	}))
})

app.post('/api/getBots', async (req, res) => {
	return await res.json(await serverDBReq('bot', {
		method: 'getBots',
		data: req.body
	}))
})

app.post('/api/getTrades', async (req, res) => {
	return await res.json(await serverDBReq('trade', {
		method: 'getTrades',
		data: req.body
	}))
})

app.listen(port, () => console.log(`Web listening on port ${port}!, http://localhost:${port}`));

const serverUserDBReq = async (req, data) => {
	const res = await got.post(`http://localhost:3100/${req}/`, { json: data });
	if(res.statusCode == 200) return JSON.parse(res.body)
	return { status: 'error', error: 'Server not available' }
}

const serverDBReq = async (req, data) => {
	const res = await got.post(`http://localhost:3100/${req}/`, { json: data });
	if(res.statusCode == 200) return JSON.parse(res.body)
	return { status: 'error', error: 'Server not available' }
}

const serverProcessReq = async (req, data) => {
	const res = await got.post(`http://localhost:3330/${req}/`, { json: data });
	if(res.statusCode == 200) return JSON.parse(res.body)
	return { status: 'error', error: 'Server not available' }
}

// Websocket configuration

const wss = new WebSocket.Server({ port: wssPort });
var websockets = { } // user: token

wss.on("connection", ws => {
	console.log("Web client connected");

	ws.on('message', (data) => {
		const { _id } = JSON.parse(data)
		if(_id) {
			registerWS(ws, _id)
		}

		ws.on("close", () => {
			console.log("Web client disconnected");
			deleteRegisteredClient(_id)
		});
	})

});

function sendWebClientMessage(data, userId) {
	console.log('sendWebClientMessage')
	if(websockets[userId]) websockets[userId].send(data);
	else console.log('Not WebClient Connected to that User');
}

// api operations

app.post('/updateOperation', async (req, res) => {
	console.log('updateOperation', req.body)
	if(req.body) sendWebClientMessage(JSON.stringify({ type: 'operation', data: req.body }), req.body.userId)
})

// api trades

app.post('/addTrade', async (req, res) => {
	console.log('addTrade', req.body)
	if(req.body) sendWebClientMessage(JSON.stringify({ type: 'trade', data: req.body }), req.body.user_id)
})

// error

app.post('/serverError', async (req, res) => {
	console.log('error', req.body)
	if(req.body) sendWebClientMessage(JSON.stringify({ type: 'error', data: req.body }), req.body.userId)
})

// after login, init websocket connection
function registerWS(ws, userId) {
	websockets[userId] = ws;
}
function deleteRegisteredClient(userId) {
	delete websockets[userId]
}