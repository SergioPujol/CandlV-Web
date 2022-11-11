import got from 'got';

class ServerDBRequest {
    private port = 3100;

    sendDBOperationUpdate = async (data: any) => {
        return await this.DBrequest('bot', { 
            method: 'updateOperationFromSP', data 
        })
    }

    sendDBAddTrade = async (data: any) => {
        return await this.DBrequest('trade', { 
            method: 'sendDBAddTrade', data 
        })
    }

    getApiKeys = async (data: any) => {
        return await this.DBrequest('settings', { 
            method: 'getKeys', data
        })
    }

    getStrategyPathFromName = async (data: any) => {
        return await this.DBrequest('strategies', { 
            method: 'getStrategyPathFromName', data 
        })
    }

    DBrequest = async (req: any, data: any) => {
        const res = await got.post(`http://localhost:${this.port}/${req}/`, { json: data });
        if(res.statusCode == 200 && JSON.parse(res.body).status) return JSON.parse(res.body)
        return false
    }
}

export { ServerDBRequest }