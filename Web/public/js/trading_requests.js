async function getSymbols() {
    /*const result = await fetch('https://testnet.binance.vision/api/v3/exchangeInfo', {
        method: 'GET'
    }).then((res) => res.json())
    return result.symbols.map((symbol) => symbol.symbol);*/
    return ['BNBUSDT', 'BTCUSDT', 'ETHUSDT', 'LTCUSDT', 'TRXUSDT', 'XRPUSDT']
}

function getIntervals() {
    return [{label:'1m', value: '1'},{label:'3m', value: '3'},{label:'5m', value: '5'},{label:'15m', value: '15'},{label:'30m', value: '30'},{label:'1h', value: '60'},{label:'2h', value: '120'},{label:'3h', value: '180'},{label:'4h', value: '240'},{label:'1d', value: 'D'},{label:'1s', value: 'W'},]
}

function createId() {
    return (Math.random()+1).toString(36).substring(2);
}

async function createChartDB(options) {
    /** options
     * chart_id
     * chart_options: { symbol, interval }
     * minimized
     */

    const result = await fetch('/api/createChart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...options, userId: localStorage.getItem('wstoken') })
    }).then((res) => res.json())

    if (result.status === 'ok') {
        // everythign went fine
        return true
        
    } else {
        showError(result.error)
        return false
    }
}

async function loadChartsFromDB() {
    /**process
     * 1. Obtener nombre de usuario
     * --- en bbdd server ----
     * 2. obtener id del userc
     * 3. obtener todos los charts con id de usuario obtenida
     * 4. Enviar de vuelta lista con charts
     * --- en web ---
     * 5. recorrer listado devuelto para añadir las charts
     */
     const result = await fetch('/api/getCharts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: localStorage.getItem('wstoken') })
    }).then((res) => res.json())

    if (result.status === 'ok') {
        // everythign went fine
        result.data.forEach(async (chart) => {
            await loadChartIntoHtml(chart.chartId, chart.chartOptions)
            await loadBotsFromDB(chart.chartId)
        })
        
        return true
        
    } else {
        showError(result.error)
        return false
    }

}

async function deleteChartFromDB(chartId) {

    const result = await fetch('/api/deleteChart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ chartId, userId: localStorage.getItem('wstoken') })
    }).then((res) => res.json())

    if (result.status === 'ok') {
        // everythign went fine
        return true
        
    } else {
        showError(result.error)
        return false
    }
    
}

async function createBotDB(options, chartId) {

    const result = await fetch('/api/createBot', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...options, chartId })
    }).then((res) => res.json())

    if (result.status === 'ok') {
        // everythign went fine
        return true
        
    } else {
        showError(result.error)
        return false
    }
}

async function loadBotsFromDB(chartId) {
    
     const result = await fetch('/api/getBots', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ chartId })
    }).then((res) => res.json())

    if (result.status === 'ok') {
        // everythign went fine
        result.data.forEach(bot => {
            //chartId, botId, values
            loadBotIntoHtml(bot.chartId, bot.botId, { name: bot.name, strategy: bot.strategy, custom: bot.botOptions, status: bot.status, operation: bot.operation, investment: bot.investment })
        })
        return true
        
    } else {
        showError(result.error)
        return false
    }

}

async function updateChartOptions(chartId, options) {

    const result = await fetch('/api/updateChart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ chartId, chartOptions: options, userId: localStorage.getItem('wstoken') })
    }).then((res) => res.json())

    if (result.status === 'ok') {
        // everythign went fine
        addTradingViewChart(chartId, options)
        return true
        
    } else {
        showError(result.error)
        return false
    }
}

async function deleteBot(chartId, botId) {

    const response = await deleteBotFromDB(chartId, botId)
    if(response) {
        const window = document.getElementById(chartId)

        window.querySelector(`#botAccordion-${chartId} #accordion-bot-${botId}`).remove()
        document.getElementById(`operation-${chartId}-${botId}`).remove()

    }

}

async function deleteBotFromDB(chartId, botId) {
    
    const result = await fetch('/api/deleteBot', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ chartId, botId })
    }).then((res) => res.json())

    if (result.status === 'ok') {
        // everythign went fine
        return true
        
    } else {
        showError(result.error)
        return false
    }

}

async function updateBotStatus(chartId, botId, status) {

    const result = await fetch('/api/updateStatusBot', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ chartId, botId, status })
    }).then((res) => res.json())

    if (result.status === 'ok') {
        // everythign went fine
        status ? updateHtmlOperation({ chartId, botId, operation: { state: 'Awaiting entry', price: '', percentage: ''} }) : updateHtmlOperation({ chartId, botId, operation: { state: 'Stopped', price: '', percentage: ''} }) 
        return true
        
    } else {
        showError(result.error)
        return false
    }
}

async function updateBotStrategyOptions(chartId, botId, options) {

    const {strategy, strategyOptions, investment} = options

    const result = await fetch('/api/updateStrategyOptionsBot', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ chartId, botId, strategy, strategyOptions, investment })
    }).then((res) => res.json())

    if (result.status === 'ok') {
        // everythign went fine
        showSuccess('Updated bot options')
        return true
        
    } else {
        showError(result.error)
        return false
    }

}

async function getAllTrades() {
    /**process
     * 1. Obtener nombre de usuario
     * --- en bbdd server ----
     * 2. obtener id del userc
     * 3. obtener todos los charts con id de usuario obtenida
     * 4. Enviar de vuelta lista con charts
     * --- en web ---
     * 5. recorrer listado devuelto para añadir las charts
     */
     const result = await fetch('/api/getTrades', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({userId: localStorage.getItem('wstoken')})
    }).then((res) => res.json())
    
    if (result.status === 'ok') {
        // everythign went fine
        result.data.forEach((trade) => {
            addTradeToHtml(trade)
        })
        
        return true
        
    } else {
        showError(result.error)
        return false
    }

}

async function stopBotOperation(botId) {
    
    const result = await fetch('/api/stopOperation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ botId, userId: localStorage.getItem('wstoken') })
    }).then((res) => res.json())

    if (result.status === 'ok') {
        // everythign went fine
        showSuccess('Stopped operation')
        return true
        
    } else {
        showError(result.error)
        return false
    }

}

async function startBotOperation(botId) {
    
    const result = await fetch('/api/startOperation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ botId, userId: localStorage.getItem('wstoken') })
    }).then((res) => res.json())

    if (result.status === 'ok') {
        // everythign went fine
        showSuccess('Started operation')
        return true
        
    } else {
        showError(result.error)
        return false
    }

}