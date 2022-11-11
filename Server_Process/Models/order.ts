export interface Order {
    symbol: string,
    side: Side,
    type: Type,
    timeInForce?: timeInForce,
    quantity?: number,
    quoteOrderQty?: number,
    price?: number,
    newClientOrderId?: string,
    strategyId?: number,
    strategyType?: number,
    stopPrice?: number,
    trailingDelta?: number,
    icebergQty?: number,
    newOrderRespType?: newOrderRespType,
    recvWindow?: number
}

export enum Side {
    BUY = 'BUY',
    SELL = 'SELL'
}

export enum Type {
    LIMIT = 'LIMIT',
    MARKET = 'MARKET',
    STOP_LOSS = 'STOP_LOSS',
    STOP_LOSS_LIMIT = 'STOP_LOSS_LIMIT',
    TAKE_PROFIT = 'TAKE_PROFIT',
    TAKE_PROFIT_LIMIT = 'TAKE_PROFIT_LIMIT',
    LIMIT_MAKER = 'LIMIT_MAKER'
}

export enum timeInForce {
    GTC = 'GTC', // Good Til Canceled - An order will be on the book unless the order is canceled.
    IOC = 'IOC', // Immediate Or Cancel - An order will try to fill the order as much as it can before the order expires.
    FOK = 'FOK' // Fill or Kill - An order will expire if the full order cannot be filled upon execution.
}

export enum newOrderRespType {
    ACK = 'ACK',
    RESULT = 'RESULT',
    FULL = 'FULL'
}