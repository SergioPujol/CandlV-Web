// Make requests to CryptoCompare API
export async function makeApiRequest(path) {
	try {
		const response = await fetch(`https://api.binance.com/${path}`);
		return response.json();
	} catch (error) {
		throw new Error(`binance request error: ${error.status}`);
	}
}