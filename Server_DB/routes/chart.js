const Chart = require('../model/chart');

const createChart = async (data) => {
    console.log('createChart')

    const { userId, chartId, chartOptions, minimized } = data
    /**Pasos a realizar
     * 1. Obtener usuario en el que se va a crear la chart con el String username
     * 2. Comprobar el usuario
     * 3. Obtener id del usuario en cuestion
     * 4. Crear chart en bbdd con los datos correspondientes
     */

    try {
		const response = await Chart.create({
            user_id: userId,
			chart_id: chartId,
            chart_options: chartOptions,
            minimized,
		})
		console.log('Chart created successfully: ', response)
	} catch (error) {
		if (error.code === 11000) {
			// duplicate key
			return { status: 'error', error: 'Chart already exists' }
		}
		throw error
	}

	return { status: 'ok' }

}

const getUserCharts = async (data) => {
    console.log('getUserCharts')
    const { userId } = data

    const charts = await Chart.find({ user_id: userId })

    const data_charts = charts.map((chart) => {
        return {
            chartId: chart.chart_id,
            chartOptions: chart.chart_options,
            minimized: chart.minimized
        }
    })

    return { status: 'ok', data: data_charts, userId }
}

const deleteChart = async (data) => {
    console.log('deleteChart')

    const { chartId, userId } = data;
    const chart_id = chartId, user_id = userId;
    
    try {
		const response = await Chart.deleteOne({ chart_id, user_id })
        console.log('Chart deleted: ', response)
        if(response.deletedCount == 0) {
            return { status: 'error', error: 'Chart trying to delete does not exist' }
        }
	} catch (error) {
		if (error.code === 11000) {
			// duplicate key
			return { status: 'error', error: 'Chart could not be deleted' }
		}
		throw error
	}
    
    return { status: 'ok' }
}

const updateChart = async (data) => {
    console.log('updateChart')

    try {
		const response = await Chart.updateOne({ chart_id: data.chartId, user_id: data.userId }, { chart_options: data.chartOptions })
        console.log('Chart updated: ', response)
        if(response.nModified == 0) {
            return { status: 'error', error: 'Chart trying to update does not exist' }
        }
	} catch (error) {
		if (error.code === 11000) {
			// duplicate key
			return { status: 'error', error: 'Chart could not be updated' }
		}
		throw error
	}

    return { status: 'ok' }
}

const updateChartMinimized = async (data) => {
    console.log('updateChartMinimized')
}

const getIdByChartId = async (chart_id) => {
    console.log('getIdByChartId')
	const chart = await Chart.findOne({ chart_id }).lean();
	if (!chart) {
		return false
	}

	return chart._id
}

const getChartParamsByChartId = async (chart_id) => {
    console.log('getChartParamsByChartId')
	const chart = await Chart.findOne({ chart_id }).lean();
	if (!chart) {
		return false
	}

	return chart.chart_options
}

const getUserIdByChartId = async (chart_id) => {
    console.log('getChartParamsByChartId')
	const chart = await Chart.findOne({ chart_id }).lean();
	if (!chart) {
		return false
	}

	return chart.user_id
}

module.exports = {
    createChart,
    getUserCharts,
    deleteChart,
    getIdByChartId,
    updateChart,
    getChartParamsByChartId,
    getUserIdByChartId
}