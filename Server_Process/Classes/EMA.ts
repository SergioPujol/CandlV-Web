class EMA {

    private listValues: Array<{ EMA: number, date: number }>;
    private nPeriod: number;
    //private quantityValues: number;

    constructor(listValues: Array<{ EMA: number, date: number }>, nPeriod: number) {
        this.listValues = listValues
        //this.quantityValues = listValues.length
        this.nPeriod = nPeriod
    }

    getListValues() {
        return this.listValues
    }

    getNPeriod() {
        return this.nPeriod
    }

    getLast2Points() {
        return this.listValues.slice(-2)
    }

    getLastPoint() {
        return this.listValues[this.listValues.length - 1]
    }
}

export { EMA }