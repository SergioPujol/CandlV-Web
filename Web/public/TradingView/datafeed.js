import {
	makeApiRequest,
} from './helpers.js';


const configurationData = {
	supports_marks: false,
	supports_timescale_marks: false,
	supports_time: true,
	supported_resolutions: [
		'1', '3', '5', '15', '30', '60', '120', '240', '360', '480', '720', '1D', '3D', '1W', '1M'
	]
};


async function getAllSymbols() {
	const data = await makeApiRequest('api/v3/exchangeInfo');
	let allSymbols = [];

	for(const symbol of data.symbols) {
		allSymbols.push(
			{
				symbol: symbol.symbol,
				full_name: symbol.symbol,
				description: symbol.baseAsset + '/' + symbol.quoteAsset,
				ticker: symbol.symbol,
				exchange: 'Binance',
				//type: 'crypto',
				filters: symbol.filters,
				quoteAsset: symbol.quoteAsset,
			}
		)
	}
	return allSymbols
}

async function binanceKlines(symbol, interval, startTime, endTime, limit) {
	return await makeApiRequest('api/v3/klines' +
		"?symbol=".concat(symbol) +
		"&interval=".concat(interval) +
		"&limit=".concat(limit) +
		"&startTime=".concat(startTime) +
		"&endTime=".concat(endTime)
	)
}

function pricescale(symbol) {
	for (let filter of symbol.filters) {
		if (filter.filterType == 'PRICE_FILTER') {
			return Math.round(1 / parseFloat(filter.tickSize))
		}
	}
	return 1
}

export default {
	onReady: (callback) => {
		console.log('[onReady]: Method call');
		setTimeout(() => callback(configurationData));
	},

	searchSymbols: async (
		userInput,
		exchange,
		symbolType,
		onResultReadyCallback,
	) => {
		console.log('[searchSymbols]: Method call');
		const symbols = await getAllSymbols();
		const newSymbols = symbols.filter(symbol => {
			const isExchangeValid = exchange === '' || symbol.exchange === exchange;
			const isFullSymbolContainsInput = symbol.full_name
				.toLowerCase()
				.indexOf(userInput.toLowerCase()) !== -1;
			return isExchangeValid && isFullSymbolContainsInput;
		});
		onResultReadyCallback(newSymbols);
	},

	resolveSymbol: async (
		symbolName,
		onSymbolResolvedCallback,
		onResolveErrorCallback,
	) => {
		console.log('[resolveSymbol]: Method call', symbolName);
		const symbols = await getAllSymbols();
		const symbolItem = symbols.find(({
			symbol,
		}) => symbol === symbolName);
		if (!symbolItem) {
			console.log('[resolveSymbol]: Cannot resolve symbol', symbolName);
			onResolveErrorCallback('cannot resolve symbol');
			return;
		}
		const symbolInfo = {
			name: symbolItem.symbol,
			description: symbolItem.description,
			ticker: symbolItem.symbol,
			session: '24x7',
			timezone: 'UTC',
			exchange: symbolItem.exchange,
			//listed_exchange: 'Binance',
			//type: 'crypto',
			minmov: 1,
			pricescale: pricescale(symbolItem),
			has_intraday: true,
			has_daily: true,
			has_weekly_and_monthly: true,
			supported_resolutions: configurationData.supported_resolutions,
			currency_code: symbolItem.quoteAsset
		};

		console.log('[resolveSymbol]: Symbol resolved', symbolName);
		onSymbolResolvedCallback(symbolInfo);
	},

	getBars: async (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
		
		var { from, to, firstDataRequest } = periodParams;
		console.log('[getBars]: Method call', symbolInfo, resolution, from, to);

        const interval = {
            '1': '1m',
            '3': '3m',
            '5': '5m',
            '15': '15m',
            '30': '30m',
            '60': '1h',
            '120': '2h',
            '240': '4h',
            '360': '6h',
            '480': '8h',
            '720': '12h',
            'D': '1d',
            '1D': '1d',
            '3D': '3d',
            'W': '1w',
            '1W': '1w',
            'M': '1M',
            '1M': '1M',
        }[resolution]

        if (!interval) {
            onErrorCallback('Invalid interval')
        }

        let totalKlines = []

        const finishKlines = () => {
            console.log('📊:', totalKlines.length)
        
            if (totalKlines.length == 0) {
                onHistoryCallback([], { noData: true })
            } else {
                onHistoryCallback(totalKlines.map(kline => {
                    return {
                        time: kline[0],
                        close: parseFloat(kline[4]),
                        open: parseFloat(kline[1]),
                        high: parseFloat(kline[2]),
                        low: parseFloat(kline[3]),
                        volume: parseFloat(kline[5])
                    }
                }), {
                        noData: false
                    })
            }
        }

        const getKlines = (from, to) => {
            binanceKlines(symbolInfo.name, interval, from, to, 500).then(klines => {
                totalKlines = totalKlines.concat(klines)

                if (klines.length == 500) {
                    from = klines[klines.length - 1][0] + 1
                    getKlines(from, to)
                } else {
                    finishKlines()
                }
            }).catch(err => {
                console.error(err)
                onErrorCallback('Some problem')
            })
        }

        from *= 1000
        to *= 1000

        getKlines(from, to)
	},

	subscribeBars: (
		symbolInfo,
		resolution,
		onRealtimeCallback,
		subscribeUID,
		onResetCacheNeededCallback,
	) => {
		console.log('[subscribeBars]: Method call with subscribeUID:', subscribeUID);
		/*subscribeOnStream(
			symbolInfo,
			resolution,
			onRealtimeCallback,
			subscribeUID,
			onResetCacheNeededCallback,
			lastBarsCache.get(symbolInfo.full_name),
		);*/
	},

	unsubscribeBars: (subscriberUID) => {
		console.log('[unsubscribeBars]: Method call with subscriberUID:', subscriberUID);
		//unsubscribeFromStream(subscriberUID);
	},
};
