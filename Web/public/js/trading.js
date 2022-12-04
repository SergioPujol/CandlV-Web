var tradingViewCharts = {}
function minmaxWindows() {
    document.querySelectorAll('.window').forEach(window => {
        let id = window.id
        document.getElementById(`window-${id}-chart-menu`).querySelector('button').onclick = ()=>{
            if(document.getElementById(`window-${id}-data`).classList.contains('hide-data')) document.getElementById(`window-${id}-data`).classList.remove('hide-data')
            else document.getElementById(`window-${id}-data`).classList.add('hide-data')        
        }
    
        document.getElementById(`window-${id}-chart-options-close`).onclick = async ()=>{
            const response = await deleteChartFromDB(id)
            if(response) {
                window.remove()
                document.getElementById(`window-${id}-minimized`).remove()
            }
        }
    
        document.getElementById(`window-${id}-chart-options-minimize`).onclick = ()=>{
            window.classList.add('minimize-chart')
            document.getElementById(`window-${id}-minimized`).classList.remove('maximized-chart')
        }
    
        document.getElementById(`window-${id}-chart-options-maximize`).onclick = ()=>{
            window.classList.remove('minimize-chart')
            document.getElementById(`window-${id}-minimized`).classList.add('maximized-chart')
        }
    });
}
minmaxWindows()
// MODAL

function updateModalWithStrategy(chartId, strategy) {
    const strategyContainer = document.querySelector(`#add-bot-modal-${chartId} .container-strategy-options`);
    strategyContainer.innerHTML = '';
    const strategyOptions = strategies[strategy];

    Object.keys(strategyOptions).forEach(option => {
        let div = document.createElement('div')
        div.classList.add('d-flex', 'flex-row', 'align-items-center', 'mb-2')
        div.id = option
        div.innerHTML = `
            <span class="col-md-6" value="option">${option.replaceAll('_', ' ')}</span>
            <input class="col-md-6 form-control" type="text" placeholder="Bot name" value="${strategyOptions[option]}"/>`;
        strategyContainer.appendChild(div)
    })
}

document.getElementById('add-chart').querySelector('button').addEventListener('click', async ()=> await createWindow())
async function createWindow() {

    // create chart id
    const chartId = createId()

    // info from select
    const addChartContainer = document.getElementById('add-chart')
    const values = {
        symbol: addChartContainer.querySelector('#add-chart-symbol').value,
        interval: addChartContainer.querySelector('#add-chart-interval').value
    }

    const status = await createChartDB({
        chartId, chartOptions: { symbol: values.symbol, interval: values.interval }, minimized: false
    })
    if(!status) return

    await loadChartIntoHtml(chartId, values)

}

async function loadChartIntoHtml(chartId, values) {
    const { window, minimizedChart, modal } = await createHtmlWindow(chartId, values);
    document.querySelector('.charts-information').appendChild(window);
    document.querySelector('.charts-information > .minimized-charts').appendChild(minimizedChart);
    document.querySelector('.charts-information > .modals').appendChild(modal);

    addBotButtonAndModal(chartId)

    minmaxWindows()
    addTradingViewChart(chartId, values)
}

function addTradingViewChart(chartId, valuesChart) {
    const widgetConfig = {
        "autosize": true,
        "symbol": `BINANCE:${valuesChart.symbol}`,
        "interval": valuesChart.interval,
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "es",
        "toolbar_bg": "#f1f3f6",
        "enable_publishing": false,
        "allow_symbol_change": true,
        "container_id": `tradingview_${chartId}`,
        "studies": []
    }
    tradingViewCharts[chartId] = widgetConfig
    new TradingView.widget(widgetConfig);
}

function addIndicatorsToChart(strategy, options, chartId) {
    const widgetConfig = tradingViewCharts[chartId];
    switch(strategy) {
        case '2EMA':
            widgetConfig.studies = widgetConfig.studies.concat([{
                    id: "MAExp@tv-basicstudies",
                    inputs: {
                        length: parseInt(options.ema_short_period)
                    }
                },{
                    id: "MAExp@tv-basicstudies",
                    inputs: {
                        length: parseInt(options.ema_long_period)
                    }
                }
            ])
                
        break;
        case 'MACD':
            widgetConfig.studies = widgetConfig.studies.concat([{
                id: "MACD@tv-basicstudies",
                inputs: { in_0: parseInt(options.ema_short_period), in_1: parseInt(options.ema_long_period), in_3: 'close', in_2: parseInt(options.signal_period) }
            }])
        break;
        case 'Bollinger':
            widgetConfig.studies = widgetConfig.studies.concat([{
                id: "BB@tv-basicstudies",
                inputs: { in_0: parseInt(options.period), in_1: parseInt(options.times), in_3: 'close' }
            }])
        break;
    }
    new TradingView.widget(widgetConfig);
}

async function createHtmlWindow(chartId, options) {
    const window = document.createElement('div')
    window.id = `${chartId}`
    window.classList.add('window')
    window.innerHTML = `
        <div id="window-${chartId}-chart" class="chart flex-grow-1">
        <div id="window-${chartId}-chart-buttons" class="chart-buttons">
            <div class="chart-options" id="window-${chartId}-chart-options">
                <button type="button" class="btn btn-2" data-bs-toggle="modal" data-bs-target="#modal-${chartId}">
                    <i class="bi bi-x"></i>
                </button>
                <button type="button" class="btn btn-2" id="window-${chartId}-chart-options-minimize">
                    <i class="bi bi-dash"></i>
                </button>
            </div>
            <div class="chart-title">Chart ${chartId}</div>
            <div class="chart-menu" id="window-${chartId}-chart-menu">
                <button type="button" class="btn btn-2">
                    <i class="bi bi-list"></i>
                </button>
            </div>
        </div>
        
        <!-- TradingView Widget BEGIN -->
        <div class="tradingview-widget-container">
            <div id="tradingview_${chartId}"></div>
            <div class="tradingview-widget-copyright"><a href="https://es.tradingview.com/symbols/BTCUSDT/?exchange=BINANCE" rel="noopener" target="_blank"><span class="blue-text">BTCUSDT Gráfico</span></a> por TradingView</div>
        </div>
        <!-- TradingView Widget END -->
        
        </div>
        <div id="window-${chartId}-data" class="data d-flex flex-column">

        <div class="d-flex flex-column overflow-hidden">
            <button class="btn btn-2 mb-2 button-collapse show" type="button" data-bs-toggle="collapse" data-bs-target="#window-${chartId}-data-market" aria-expanded="true" aria-controls="window-${chartId}-data-market">
            <div class="charts-info-button-container">
                <span class="charts-info-button-container-span">Market Settings</span>
                <i class="bi bi-caret-down-fill text-collapsed"></i>
                <i class="bi bi-caret-up-fill text-expanded"></i>
            </div>
            </button>

            <div class="collapse multi-collapse market-settings show" id="window-${chartId}-data-market">
            <div class="d-flex flex-column">
                <div class="d-flex flex-row align-items-center mb-2 symbol-select">
                    <span class="col-md-6">Symbol</span>
                </div>
                <div class="d-flex flex-row align-items-center mb-2 interval-select">
                    <span class="col-md-6">Interval</span>
                </div>
            </div>
            </div>
        </div>
        
        <div class="d-flex flex-column overflow-hidden">
            <button class="btn btn-2 mb-2 button-collapse" type="button" data-bs-toggle="collapse" data-bs-target="#window-${chartId}-data-bot" aria-expanded="false" aria-controls="window-${chartId}-data-bot">
            <div class="charts-info-button-container">
                <span class="charts-info-button-container-span">Bot Settings</span>
                <i class="bi bi-caret-down-fill text-collapsed"></i>
                <i class="bi bi-caret-up-fill text-expanded"></i>
            </div>
            </button>

            <div class="collapse multi-collapse overflow-hidden bot-settings" id="window-${chartId}-data-bot">
                <div class="overflow-auto d-flex">
                    <div class="accordion" id="botAccordion-${chartId}">
                    </div>
                </div>
                <button class="btn btn-1 mt-2 add-bot" data-bs-toggle="modal" data-bs-target="#add-bot-modal-${chartId}">Add bot</button>
            </div>
        </div>

        <!--<div class="buy-sell-buttons d-flex flex-row align-items-center mb-2" id="buy-sell-${chartId}-buttons">
            <button class="col-md-6 btn btn-2">BUY</button>
            <button class="col-md-6 btn btn-2">SELL</button>
        </div>-->
        
        </div>

        <div class="modal fade" id="add-bot-modal-${chartId}" tabindex="-1" aria-labelledby="Modal${chartId}Label" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="botModal${chartId}Label">Create bot</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <!-- MODAL BODY FOR THE CREATION OF THE BOT -->
                        <div class="static-bot-values">

                            <!-- container with the name and strategy to select -->
                            <div class="d-flex flex-row align-items-center mb-2">
                                <span class="col-md-6">Name</span>
                                <input class="col-md-6 form-control" type="text" placeholder="Bot name">
                            </div>
                            <div class="d-flex flex-row align-items-center mb-2">
                                <span class="col-md-6">Strategy</span>
                                <select class="col-md-6 form-select strategies-select">
                                <!-- <option value="2EMA" selected>2EMA</option>-->
                                </select>
                            </div>

                        </div>
                        <div class="container-strategy-options d-flex flex-column">
                        <!-- container configurable depending on the strategy -->
                        </div>
                        <div class="container-money-investment d-flex flex-column">
                            <span class="mb-2">Investment</span>
                            <!-- actual usdt -->
                            <div class="investment-options">
                                <div class="fixed-investment-container d-flex flex-row align-items-center mb-2">
                                    <div class="form-check col-md-6">
                                        <input class="form-check-input" type="radio" name="investmentRadioButtons" id="fixedInvestment-${chartId}" checked>
                                        <label class="form-check-label" for="fixedInvestment-${chartId}">
                                            Fixed investment
                                        </label>
                                    </div>
                                    <input class="col-md-6 form-control" type="text" id="fixedInvestment-value-${chartId}" placeholder="USDT Investment">
                                </div>
                                <div class="fixed-investment-container d-flex flex-row align-items-center mb-2">
                                    <div class="form-check col-md-6">
                                        <input class="form-check-input" type="radio" name="investmentRadioButtons" id="percentageInvestment-${chartId}">
                                        <label class="form-check-label" for="percentageInvestment-${chartId}">
                                            Percentage investment
                                        </label>
                                    </div>
                                    <input class="col-md-6 form-control" type="text" id="percentageInvestment-value-${chartId}" placeholder="% Investment">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" id="addBot-button">Add bot</button>
                    </div>
                </div>
            </div>
        </div>`

    const marketSettings = window.querySelector(`#window-${chartId}-data-market`);

    const symbolSelect = await createSelectSymbol()
    const intervalSelect = createSelectInterval()

    marketSettings.querySelector('.symbol-select').appendChild(symbolSelect)
    marketSettings.querySelector('.symbol-select select').value = options.symbol.toLowerCase()
    
    marketSettings.querySelector('.interval-select').appendChild(intervalSelect)
    marketSettings.querySelector('.interval-select select').value = options.interval

    symbolSelect.addEventListener('change', (e) => updateChartOptions(chartId, { symbol: e.target.value, interval: intervalSelect.value }))
    intervalSelect.addEventListener('change', (e) => updateChartOptions(chartId, { symbol: symbolSelect.value, interval: e.target.value }))

    const minimizedChart = document.createElement('div');
    minimizedChart.id = `window-${chartId}-minimized`
    minimizedChart.classList.add('minimized-window', 'maximized-chart');
    minimizedChart.innerHTML = `<span class="minimized-name" style="place-self: center;">Chart ${chartId}</span>
        <button type="button" class="btn btn-2" data-bs-toggle="modal" data-bs-target="#modal-${chartId}" style="margin-right: 4px;">
        <i class="bi bi-x"></i>
        </button>
        <button type="button" class="btn btn-2" id="window-${chartId}-chart-options-maximize">
        <i class="bi bi-arrows-angle-expand"></i>
        </button>`

    const modal = document.createElement('div')
    modal.innerHTML = `<div class="modal fade" id="modal-${chartId}" tabindex="-1" aria-labelledby="Modal${chartId}Label" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
            <h5 class="modal-title" id="Modal${chartId}Label">Are you sure you want to delete Chart ${chartId}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-1" id="window-${chartId}-chart-options-close" data-bs-dismiss="modal">Delete</button>
            </div>
        </div>
        </div>
    </div>`

    return { 
        window: window,
        minimizedChart: minimizedChart,
        modal: modal.firstElementChild
     }

}

// Add Bot button
function addBotButtonAndModal(chartId) {
    // acced to the chart window and then to the Add Bot popup
    const popup = document.getElementById(`add-bot-modal-${chartId}`);

    // TODO automatic way for the moment, will be added 2EMA
    
    const strategySelect = popup.querySelector('.strategies-select')
    appendOptionsToStrategySelect(strategySelect);
    updateModalWithStrategy(chartId, popup.querySelector('.strategies-select').value);

    strategySelect.addEventListener('change', () => updateModalWithStrategy(chartId, popup.querySelector('.strategies-select').value));

    // once the button for creating a bot is clicked, send request to server DB and server Process, to add this bot
    popup.querySelector('#addBot-button').addEventListener('click', async () => await createBot(chartId))
}

async function createBot(chartId) { // what do I need? options from modal and Id of the chart for the 

    // create bot id
    const botId = createId()

    // get all values setted on the modal for the bot options

    // send request to serverProcess
    // (from serverProcess send request to serverDB to store the bot with all the options and status (true))

    // if the response from the request is ok, add it to html
    // if not, toast bad request

    const addBotModalContainer = document.getElementById(`add-bot-modal-${chartId}`);
    const staticValuesContainer = addBotModalContainer.querySelector('.static-bot-values');
    const optionsContainer = addBotModalContainer.querySelectorAll('.container-strategy-options > div');
    const investment = addBotModalContainer.querySelector(`#fixedInvestment-${chartId}`).checked ? {
        investmentType: 'fixedInvestment',
        quantity: addBotModalContainer.querySelector(`#fixedInvestment-value-${chartId}`).value
    } : {
        investmentType: 'percentageInvestment',
        quantity: addBotModalContainer.querySelector(`#percentageInvestment-value-${chartId}`).value
    }
    
    let customOptions = {};
    optionsContainer.forEach(optionContainer => {
        customOptions[optionContainer.id] = optionContainer.querySelector('input').value;
    });

    const values = {
        name: staticValuesContainer.querySelector('input').value,
        strategy: staticValuesContainer.querySelector('select.strategies-select').value,
        custom: customOptions,
        status: true,
        operation: {state: 'Awaiting entry', price: '', percentage: ''},
        investment
    }

    const status = await createBotDB({
        botId, botName: values.name, botStrategy: values.strategy, botOptions: customOptions, botStatus: true, investment
    }, chartId)
    if(!status) return

    loadBotIntoHtml(chartId, botId, values)
}

function loadBotIntoHtml(chartId, botId, values) {
    document.querySelector(`#botAccordion-${chartId}`).appendChild(createHtmlBot(chartId,botId,values))
    createHtmlOperation(chartId, botId, values)
}

function createHtmlBot(chartId, botId, options) { 
    /**
     * options: {
     *  name: "",
     *  strategy: "",
     *  custom: [
     *      { ema_short_period: 3 },
     *      { ema_long_period: 6 }
     *  ]
     * }
     */
    let botHtml = document.createElement('div')
    botHtml.classList.add('accordion-item')
    botHtml.id = `accordion-bot-${botId}`
    botHtml.innerHTML = `
    <h2 class="accordion-header" id="heading${botId}">
      <div class="accordion-button">
        <div class="accordion-button-container">
          <span class="accordion-button-container-span">Bot ${options.name}</span>
          <div class="form-check form-switch ms-2">
            <input class="form-check-input" type="checkbox" id="status-bot-${botId}" ${options.status ? 'checked':''}>
          </div>
          <i class="bi bi-trash-fill" data-bs-toggle="modal" data-bs-target="#modal-bot-${botId}"></i>
          <i class="bi bi-caret-down-fill text-collapsed" data-bs-toggle="collapse" data-bs-target="#collapse-bot-${botId}" aria-expanded="false" aria-controls="collapse-bot-${botId}" type="button"></i>
          <i class="bi bi-caret-up-fill text-expanded" data-bs-toggle="collapse" data-bs-target="#collapse-bot-${botId}" aria-expanded="false" aria-controls="collapse-bot-${botId}" type="button"></i>
        </div>
      </div>
    </h2>
    <div id="collapse-bot-${botId}" class="accordion-collapse collapse p-2" aria-labelledby="heading${botId}" data-bs-parent="#botAccordion-${chartId}">
      <div class="d-flex flex-column">
        <!--<div class="d-flex flex-row align-items-center mb-2">
          <span class="col-md-6">Name</span>
          <input class="col-md-6 form-control" type="text" placeholder="Default input" aria-label="default input example">
        </div>-->
        <div class="d-flex flex-row align-items-center mb-2 strategy-container">
          <span class="col-md-6">Strategy</span>
          <select class="col-md-6 form-select" id="strategy-select-bot-${botId}">
          </select>
        </div>
        <div class="d-flex flex-column strategies-modal mb-2"></div>
        <div class="container-money-investment d-flex flex-column">
            <span class="mb-2">Investment</span>
            <!-- actual usdt -->
            <div class="investment-options">
                <div class="fixed-investment-container d-flex flex-row align-items-center mb-2">
                    <div class="form-check col-md-6">
                        <input class="form-check-input" type="radio" name="investmentRadioButtons" id="fixedInvestment-${chartId}-${botId}" checked>
                        <label class="form-check-label" for="fixedInvestment-${chartId}-${botId}">
                            Fixed investment
                        </label>
                    </div>
                    <input class="col-md-6 form-control" type="text" id="fixedInvestment-value-${chartId}-${botId}" placeholder="USDT Investment">
                </div>
                <div class="fixed-investment-container d-flex flex-row align-items-center mb-2">
                    <div class="form-check col-md-6">
                        <input class="form-check-input" type="radio" name="investmentRadioButtons" id="percentageInvestment-${chartId}-${botId}">
                        <label class="form-check-label" for="percentageInvestment-${chartId}-${botId}">
                            Percentage investment
                        </label>
                    </div>
                    <input class="col-md-6 form-control" type="text" id="percentageInvestment-value-${chartId}-${botId}" placeholder="% Investment">
                </div>
            </div>
        </div>
      </div>
      <div class="d-flex flex-column">
        <button class="btn btn-1 mt-2" id="save-bot-options-${botId}">Save bot options</button>
      </div>
    </div>
    <div class="modal fade" id="modal-bot-${botId}" tabindex="-1" aria-labelledby="Modal-bot-${botId}Label" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
            <h5 class="modal-title" id="Modal-bot-${botId}Label">Are you sure you want to delete Bot ${options.name}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-1" id="delete-bot-${botId}" data-bs-dismiss="modal">Delete</button>
            </div>
        </div>
        </div>
    </div>`
    const strategySelect = botHtml.querySelector(`#strategy-select-bot-${botId}`)
    appendOptionsToStrategySelect(strategySelect)
    strategySelect.value = options.strategy;
    const collapseContainer = botHtml.querySelector(`#collapse-bot-${botId} > div`)

    // DELETE BOT
    botHtml.querySelector(`#delete-bot-${botId}`).addEventListener('click', () => deleteBot(chartId, botId))

    // STATUS BOT
    botHtml.querySelector(`#status-bot-${botId}`).addEventListener('change', (e) => updateBotStatus(chartId, botId, e.target.checked))

    // STRATEGY OPTIONS BOT
    botHtml.querySelector(`#save-bot-options-${botId}`).addEventListener('click', (e) => {
        if(botHtml.querySelector(`#status-bot-${botId}`).checked) showError('Turn the bot off before changing the options')
        else updateBotStrategyOptions(chartId, botId, { ...getInputBotOptions(botHtml.querySelector(`#collapse-bot-${botId} > div`)), investment: getInvestment(botHtml.querySelector(`#collapse-bot-${botId} .investment-options`), chartId, botId) } )
    })
    
    collapseContainer.querySelector(`#${options.investment.investmentType}-${chartId}-${botId}`).checked = true;
    collapseContainer.querySelector(`#${options.investment.investmentType}-value-${chartId}-${botId}`).value = options.investment.quantity;

    Object.keys(options.custom).forEach(objectKey => {
        let div = document.createElement('div');
        div.classList.add('d-flex','flex-row','align-items-center','mb-2', 'bot-options-container');
        div.id = objectKey
        div.innerHTML =`
        <span class="col-md-6">${objectKey}</span>
        <input class="col-md-6 form-control" type="text" value="${options.custom[objectKey]}">
        `;
        collapseContainer.querySelector('.strategies-modal').appendChild(div);
    })

    addIndicatorsToChart(options.strategy, options.custom, chartId)

    return botHtml
}

function getInvestment(container, chartId, botId) {
    return container.querySelector(`#fixedInvestment-${chartId}-${botId}`).checked ? {
        investmentType: 'fixedInvestment',
        quantity: container.querySelector(`#fixedInvestment-value-${chartId}-${botId}`).value
    } : {
        investmentType: 'percentageInvestment',
        quantity: container.querySelector(`#percentageInvestment-value-${chartId}-${botId}`).value
    }
}

function createHtmlOperation(chartId, botId, values) {

    const { name, operation } = values;

    const operationFatherContainer = document.getElementById('actual-operations');
    const operationContainer = document.createElement('div');
    operationContainer.id = `operation-${chartId}-${botId}`;
    operationContainer.classList.add('d-flex', 'flex-row', 'operation-container');
    operationContainer.innerHTML = `
        <div class="bot-name">${name}</div>
        <div class="operation-state">${operation.state.replace(/([A-Z])/g, ' $1').trim()}</div>
        <div class="operation-entry-price">${operation.price == '' ? '' : parseFloat(operation.price).toFixed(2)}</div>
        <div class="operation-percentage">${operation.percentage}</div>
        <button id="stop-operation-${chartId}-${botId}" class="stop-operation btn btn-1" ${operation.state == 'Stopped' ? 'disabled' : ''}>${(operation.state === 'None' || operation.state === 'InShort' || operation.state === 'Awaiting entry' || operation.state === 'Stopped') ? 'Start operation' : 'Stop operation' }</button>
    `

    operationContainer.querySelector('button').onclick = () => {
        if(operation.state === 'None' || operation.state === 'InShort') startBotOperation(botId)
        else stopBotOperation(botId)
    }

    operationFatherContainer.appendChild(operationContainer)

}

function updateHtmlOperation(operationData) {
    const { botId, chartId, operation } = operationData;

    const operationContainer = document.getElementById(`operation-${chartId}-${botId}`);
    operationContainer.querySelector('div.operation-entry-price').textContent = operation.price == '' ? '' : parseFloat(operation.price).toFixed(2);
    operationContainer.querySelector('div.operation-state').textContent = operation.state.replace(/([A-Z])/g, ' $1').trim();
    operationContainer.querySelector('div.operation-percentage').textContent = operation.percentage;

    operationContainer.querySelector('button.stop-operation').disabled = operation.state == 'Stopped' ? true : false;
    operationContainer.querySelector('button.stop-operation').textContent = (operation.state === 'None' || operation.state === 'InShort' || operation.state === 'Awaiting entry' || operation.state === 'Stopped') ? 'Start operation' : 'Stop operation' ;

    operationContainer.querySelector('button').onclick = () => {
        if(operation.state === 'None' || operation.state === 'InShort' || operation.state === 'Awaiting entry') startBotOperation(botId)
        else stopBotOperation(botId)
    }
}

const padL = (nr, len = 2, chr = `0`) => `${nr}`.padStart(2, chr);

function addTradeToHtml(trade) {
    const tradeContainer = document.createElement('div');
    tradeContainer.classList.add('trade-trading');
    var dt = new Date(parseInt(trade.time));
    var dateFormat = `${padL(dt.getDate())}/${padL(dt.getMonth()+1)}/${dt.getFullYear()} ${padL(dt.getHours())}:${padL(dt.getMinutes())}:${padL(dt.getSeconds())}`
    tradeContainer.innerHTML = `
        <div class="main-info">
        
            <div class="trade-icon"><i class="bi bi-${trade.type == "BUY" ? 'graph-up' : 'exclamation-circle'}"></i></div>
            <div class="trade-order col">${trade.type}</div>
            <div class="trade-symbol col">${trade.symbol}</div>
            <div class="trade-entry-price col">${parseFloat(trade.entry_price).toFixed(2)} USDT</div>
            <div class="trade-symbol-quantity col">${parseFloat(trade.symbol_quantity).toFixed(4)}</div>
            <div class="trade-usdt-quantity col">${parseFloat(trade.usdt_quantity).toFixed(2)}</div>
            <div class="trade-percentage col">${trade.percentage}</div>
            <div class="trade-time col">${dateFormat}</div>

            <div data-bs-toggle="collapse" data-bs-target="#trade-${trade._id}" aria-expanded="false" aria-controls="trade-${trade._id}"><i class="bi bi-caret-down-fill"></i></div>
        </div>
        <div class="collapsed-info collapse multi-collapse" id="trade-${trade._id}">
            <div>
                <div class="trade-chart-bot-names trade-chart-info"><strong>Chart Id:</strong> <span>${trade.chart_id}</span></div>
                <div class="trade-chart-bot-names trade-bot-info"><strong>Bot Name:</strong> <span>${trade.bot_name}</span></div>
                <div class="trade-bot-strategy-options"><strong>Strategy options:</strong> <span>${trade.bot_strategy}${getStrategyOptionsParameters(trade.bot_options)}</span></div>
            </div>
        </div>
        `

    const tradesMainContainer = document.getElementById('trades')
    tradesMainContainer.append(tradeContainer);
    if(tradesMainContainer.querySelectorAll('div.trade-trading').length > 20) tradesMainContainer.querySelectorAll('div.trade-trading')[0].remove()
    tradeContainer.scrollIntoView();

}

function getStrategyOptionsParameters(bot_options) {
    var str = '';

    Object.keys(bot_options).forEach(option => {
        str += ` - ${option.replaceAll('_', ' ')}: ${bot_options[option]}`
    })

    return str
}

async function createSelectSymbol() {
    const select = document.createElement('select')
    select.classList.add('col-md-6','form-select')

    const symbols = await getSymbols();
    symbols.forEach(symbol => {
        let opt = document.createElement('option');
        opt.value = symbol.toLowerCase();
        opt.innerHTML = symbol;
        select.appendChild(opt)
    })

    // add select on change event listener

    return select
}

function createSelectInterval() {
    const select = document.createElement('select')
    select.classList.add('col-md-6','form-select')

    const intervals = getIntervals();
    intervals.forEach(interval => {
        let opt = document.createElement('option');
        opt.value = interval.value;
        opt.innerHTML = interval.label;
        select.appendChild(opt)
    })

    return select
}

function getInputBotOptions(container) {
    let customOptions = {};
    const optionsContainers = container.querySelectorAll('div.bot-options-container');
    optionsContainers.forEach(optionContainer => {
        customOptions[optionContainer.id] = optionContainer.querySelector('input').value;
    })

    return {strategy: container.querySelector(`select`).value, strategyOptions: customOptions}
}


function changeProcess(chartId, botId) {
    /**Change html of the operation with the chartId and BotId, has to be changed:
     * - price
     * - process
     * - button (??)
     */
}

(async function () {
    /*const status = await checkLoginStatus()
    if(!status) location.href = 'home.html'*/
    await loadChartsFromDB();
    await getAllTrades();
})();