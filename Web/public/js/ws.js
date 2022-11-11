const ws = new WebSocket("ws://localhost:3001");

ws.addEventListener("open", () => {
    console.log("Connected from Website");
    const _id = localStorage.getItem('wstoken')
    console.log('_id', _id)

    if(window.location.href.includes('trading.html')) ws.send(JSON.stringify({_id}))
});

ws.addEventListener("message", ({ data }) => {
    data = JSON.parse(data)

    switch(data.type) {
        case "trade":
            // post trade notification
            const trade = data.data;
            // format { type, symbol, entry_price, symbol_quantity, usdt_quantity, time, bot_strategy, bot_options, chart_id, bot_id, bot_name, trade_id }
            addTradeToHtml(trade)
        break;

        case "operation":
            // update operation
            const operation = data.data;
            updateHtmlOperation(operation)
        break;

        case "instanceID":
            // instanceID
            const instanceID = data.data.instanceID;
            setInstanceID(instanceID)
        break;

        case "error":
            // Show error from Server Process
            showError(data.data.message)
            stopBot(data.data.botId)
        break;
    }
})