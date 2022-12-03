import { createHmac } from "crypto";
import { getRequestInstance, createRequest, removeEmptyValue, buildQueryString } from './Utils';
import { Order, Side, Type } from "../Models/order";
const cryptojs = require('crypto-js')

const k: string = 'lkgna8723nlkfmas23#11]sad';

class Client {

    //publicKey: string;
    //secretKey: string;

    client: any;
    private publicKey;
    private secretKey;
    private testnet;

    constructor(_publicKey: string, _secretKey: string, _testnet: Boolean = true) {
        this.publicKey = _publicKey ? cryptojs.AES.decrypt(_publicKey, k).toString(cryptojs.enc.Utf8) : '';
        this.secretKey = _secretKey ? cryptojs.AES.decrypt(_secretKey, k).toString(cryptojs.enc.Utf8) : '';
        this.testnet = _testnet
    }

    async testConnection() {
        return this.signRequest(
            'GET',
            '/api/v3/account'
        ).then((res: any) => {
            return true
        }).catch((error: any) => {
            return false
        })
    }

    async getUsdtBalance() {
        return this.signRequest(
            'GET',
            '/api/v3/account'
        ).then((res: any) => {
            if(res.status == 200) {
                return res.data.balances.find((asset: any) => asset.asset === 'USDT').free
            } else throw new Error()
        }).catch((error: any) => {
            return { error: 'Invalid Api Keys' } 
        })
    }

    async getSymbolBalance(symbol: string) {
        return this.signRequest(
            'GET',
            '/api/v3/account'
        ).then((res: any) => {
            if(res.status == 200) {
                return res.data.balances.find((asset: any) => asset.asset === symbol).free
            } else throw new Error()
        }).catch((error: any) => {
            return { error: 'Invalid Api Keys' } 
        })
    }

    async buy(symbol: string, usdtQuantity: number) {
        let order: Order = {
            symbol: symbol,
            side: Side.BUY,
            type: Type.MARKET,
            quoteOrderQty: usdtQuantity
        }
        return this.signRequest(
            'POST',
            '/api/v3/order',
            order
        ).then((res: any) => {
            if(res.status === 200) {
                console.log(res.data)
                return res.data
            } else throw new Error()
        }).catch((error: any) => {
            return false
        })
    }

    async sell(symbol: string, symbolQuantity: number) {
        let order: Order = {
            symbol: symbol,
            side: Side.SELL,
            type: Type.MARKET,
            quantity: symbolQuantity
        }
        return this.signRequest(
            'POST',
            '/api/v3/order',
            order
        ).then((res: any) => {
            if(res.status === 200) {
                console.log(res.data)
                return res.data
            } else throw new Error()
        }).catch((error: any) => {
            return false
        })
    }

    signRequest (method: any, path: any, params: any = {}): any {
        params = removeEmptyValue(params)
        const timestamp = Date.now()
        const queryString = buildQueryString({ ...params, timestamp })
        const signature = createHmac('sha256', this.secretKey)
          .update(queryString)
          .digest('hex');

        return createRequest({
          method,
          baseURL: this.testnet ? 'https://testnet.binance.vision/' : 'https://api.binance.com/api/',
          url: `${path}?${queryString}&signature=${signature}`,
          apiKey: this.publicKey,
          timeout: 2500,
        })
      }
}

export { Client }