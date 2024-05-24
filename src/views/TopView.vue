<template>
    <div class="container">
        <h1>Top 10 Città Calde</h1>
        <div class="select-container">
            <label for="year-select">Select Year: </label>
            <select id="year-select" v-model="selectedYear" @change="updateChart">
                <option v-for="year in years" :key="year">{{ year }}</option>
            </select><br>
        </div>
        <div id="chart">
            <apexchart type="bar" :height="chartHeight" :options="chartOptions" :series="series"
                v-if="series.length && chartOptions.xaxis.categories.length"></apexchart>
            <div v-else>Loading data...</div>
        </div>
    </div>
</template>

<script>
import ApexCharts from 'vue3-apexcharts'
import * as XLSX from 'xlsx'
import temperatureFile from '../assets/Temperature.xlsx'

export default {
    components: {
        apexchart: ApexCharts,
    },
    data() {
        return {
            series: [],
            tableData: [],
            years: [],
            selectedYear: '',
            chartHeight: '350px',
            chartOptions: {
                chart: {
                    height: 350,
                    type: 'bar',
                },
                plotOptions: {
                    bar: {
                        horizontal: false,
                        columnWidth: '55%',
                        endingShape: 'rounded'
                    },
                },
                dataLabels: {
                    enabled: false,
                },
                stroke: {
                    width: 2
                },
                xaxis: {
                    categories: []
                },
                yaxis: {
                    labels: {
                        formatter: function (val) {
                            return val.toFixed(2) + " °C";
                        }
                    }
                },
                fill: {
                    opacity: 1,
                },
                tooltip: {
                    y: {
                        formatter: function (val) {
                            return val.toFixed(2) + " °C";
                        }
                    }
                },
                title: {
                    text: 'Temperatura media per città',
                    floating: true,
                    align: 'center',
                    style: {
                        color: '#444'
                    }
                }
            },
            showAll: false,
            currentYear: 2021,
            top10Cities: []
        }
    },
    computed: {
        displayedData() {
            return this.showAll ? this.tableData : this.tableData.slice(0, 5)
        }
    },
    mounted() {
        this.loadExcelData()
        this.adjustChartSize()
        window.addEventListener('resize', this.adjustChartSize)

        console.log("Initial table data:", this.tableData);
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.adjustChartSize)
    },
    methods: {
        async loadExcelData() {
            try {
                const response = await fetch(temperatureFile)
                const arrayBuffer = await response.arrayBuffer()
                const workbook = XLSX.read(arrayBuffer, { type: 'array' })

                const sheetName = workbook.SheetNames[0]
                const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 })

                console.log("Raw data:", worksheet);

                const data = this.processWorksheet(worksheet)
                console.log("Processed data:", data);

                this.tableData = this.formatDataForTable(data)
                this.years = worksheet[0].slice(1)

                if (data.length > 0) {
                    this.selectedYear = this.years[this.years.length - 1]
                    this.updateChartData(data, this.selectedYear)
                } else {
                    console.error("No valid data found for temperature.")
                }
            } catch (error) {
                console.error("Error loading or processing Excel data:", error)
            }
        },
        processWorksheet(worksheet) {
            const columns = ['Comune'].concat(
                worksheet[0].slice(1).map(year => `Temp_${year}`)
            )

            const data = worksheet.slice(1).map(row => {
                const rowData = {}
                columns.forEach((col, i) => {
                    rowData[col] = row[i]
                })
                return rowData
            })

            return data
        },
        formatDataForTable(data) {
            return data.map(row => {
                const formattedRow = { Comune: row.Comune }
                Object.keys(row).forEach(key => {
                    if (key.startsWith('Temp_')) {
                        formattedRow[key] = isNaN(row[key]) ? '-' : parseFloat(row[key]).toFixed(2)
                    }
                })
                return formattedRow
            })
        },
        updateChart() {
            const data = this.tableData
            this.updateChartData(data, this.selectedYear)
        },
        updateChartData(data, year) {
            const top10Data = data.map(row => {
                return {
                    Comune: row.Comune,
                    value: parseFloat(row[`Temp_${year}`]) || 0
                }
            }).sort((a, b) => b.value - a.value).slice(0, 10)

            this.top10Cities = top10Data.map(row => row.Comune)
            this.series = [{ data: top10Data.map(row => row.value), name: `Top 10 Cities in ${year}` }]
            this.chartOptions.xaxis.categories = this.top10Cities
        },
        showTop10Cities() {
            const data = this.tableData
            this.updateChartData(data, this.selectedYear)
        },
        toggleShowAll() {
            this.showAll = !this.showAll
        },

        adjustChartSize() {
            this.chartHeight = window.innerWidth > 1200 ? '600px' : '400px'
        }
    }
}
</script>

<style scoped>
#chart {
    margin-top: 20px;
    width: 100%;
}

#table-container {
    margin-top: 20px;
    overflow-x: auto;
    position: relative;

}

table {
    width: 100%;
    border-collapse: collapse;
}

th,
td {
    padding: 8px;
    text-align: center;
    border: 1px solid #ddd;
}

input[type="number"] {
    width: 100%;
    box-sizing: border-box;
    text-align: center;
    border: none;
}



button {
    margin-top: 10px;
    padding: 8px 16px;
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
    border-radius: 4px;
}

button:hover {
    background-color: #0056b3;
}

@media (max-width: 600px) {
    #chart {
        height: 300px;
    }

    th,
    td {
        padding: 4px;
    }

    h1 {
        font-size: 24px;
    }

    h2 {
        font-size: 20px;
    }
}
</style>