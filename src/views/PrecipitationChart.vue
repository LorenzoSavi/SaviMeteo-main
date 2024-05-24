<template>
  <div>
    <h1>Precipitazioni</h1>
    <div id="chart">
      <apexchart
        type="line"
        :height="chartHeight"
        :options="chartOptions"
        :series="series"
        v-if="series.length && chartOptions.xaxis.categories.length"
      ></apexchart>
      <div v-else>Loading data...</div>
    </div>
    <h2 id="titData" >Data Table</h2>
    <div id="table-container">
      <button id="mostra-btn" v-if="!showAll" @click="toggleShowAll">Mostra tutti</button>
      <button id="mostra-btn" v-if="showAll" @click="toggleShowAll">Mostra meno</button><br>
      <button id="anno-btn" class="button" @click="addNewYear">Aggiungi Nuovo Anno</button><br><br>
      <table>
        <thead>
          <tr>
            <th>Comune</th>
            <th v-for="year in chartOptions.xaxis.categories" :key="year">{{ year }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in displayedRows" :key="index">
            <td>{{ row.Comune }}</td>
            <td v-for="year in chartOptions.xaxis.categories" :key="year">
              <input type="number" v-model="row[`Prec_${year}`]" @change="ensureNonEmpty(row, `Prec_${year}`)">
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import ApexCharts from 'vue3-apexcharts'
import * as XLSX from 'xlsx'
import precipitationFile from '../assets/Precipitazioni.xlsx'

export default {
  components: {
    apexchart: ApexCharts,
  },
  data() {
    return {
      series: [],
      tableData: [],
      chartHeight: '350px',
      chartOptions: {
        chart: {
          height: 350,
          type: 'line',
        },
        stroke: {
          width: 2 
        },
        xaxis: {
          categories: [2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021],
        },
        yaxis: {
          labels: {
            formatter: function (val) {
              return val.toFixed(2) + " mm";
            }
          }
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return val.toFixed(2) + " mm";
            }
          }
        },
        title: {
          text: 'Precipitazioni in varie città',
          floating: true,
          align: 'center',
          style: {
            color: '#444'
          }
        }
      },
      currentYear: 2021,
      showAll: false
    }
  },
  computed: {
    displayedRows() {
      return this.showAll ? this.tableData : this.tableData.slice(0, 5)
    }
  },
  mounted() {
    this.loadExcelData()
    this.adjustChartSize()
    window.addEventListener('resize', this.adjustChartSize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.adjustChartSize)
  },
  methods: {
    async loadExcelData() {
      try {
        const response = await fetch(precipitationFile)
        const arrayBuffer = await response.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })

        const sheetName = workbook.SheetNames[0]
        const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 })

        const data = this.processWorksheet(worksheet)
        this.tableData = this.formatDataForTable(data)
        const seriesData = this.formatDataForChart(data, 'Prec')

        console.log("Processed data:", seriesData); 

        if (seriesData.length > 0) {
          this.series = seriesData
          this.chartOptions.xaxis.categories = [2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021]
        } else {
          console.error("Non sono stati trovati dati validi per le precipitazioni.")
        }
      } catch (error) {
        console.error("Errore durante il caricamento o l'elaborazione dei dati Excel:", error)
      }
    },
    processWorksheet(worksheet) {
      const columns = ['Comune'].concat(
        worksheet[0].slice(1).map(year => `Prec_${year}`)
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
    formatDataForChart(data, type) {
      return data.map(row => {
        const values = Object.keys(row)
          .filter(key => key.startsWith(type))
          .map(key => parseFloat(row[key]))

        const validValues = values.filter(value => !isNaN(value))
        const avgValue = validValues.reduce((a, b) => a + b, 0) / validValues.length

        return {
          name: row.Comune,
          data: values.map(value => isNaN(value) ? avgValue : value).map(value => parseFloat(value.toFixed(2)))
        }
      })
    },
    formatDataForTable(data) {
      return data.map(row => {
        const formattedRow = { Comune: row.Comune }
        Object.keys(row).forEach(key => {
          if (key.startsWith('Prec_')) {
            formattedRow[key] = isNaN(row[key]) || parseFloat(row[key]) < 1 ? 1 : parseFloat(row[key]).toFixed(2)
          }
        })
        return formattedRow
      })
    },
    adjustChartSize() {
      this.chartHeight = window.innerWidth > 1200 ? '500px' : '350px'
    },
    addNewYear() {
      this.currentYear += 1
      const newYear = this.currentYear
      const lastYear = newYear - 1
      this.chartOptions.xaxis.categories.push(newYear)

      this.tableData.forEach(row => {
        const lastYearPrec = parseFloat(row[`Prec_${lastYear}`])
        const variation = ((Math.random() - 0.5) * 300).toFixed(2) 
        let newPrec = lastYearPrec + parseFloat(variation)
        newPrec = Math.max(1, Math.min(1000, newPrec)) 
        row[`Prec_${newYear}`] = newPrec.toFixed(2)
      })

      this.series.forEach((serie, index) => {
        const newPrec = parseFloat(this.tableData[index][`Prec_${newYear}`])
        serie.data.push(newPrec)
      })
    },
    ensureNonEmpty(row, key) {
      if (!row[key]) {
        row[key] = 1; 
      } else if (parseFloat(row[key]) < 1) {
        row[key] = 1; 
      }
      this.updateSeriesData();
    },
    updateSeriesData() {
      
      const newData = this.tableData.map(row => {
        return {
          name: row.Comune,
          data: this.chartOptions.xaxis.categories.map(year => parseFloat(row[`Prec_${year}`]))
        }
      });
      this.series.splice(0, this.series.length, ...newData);
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
th, td {
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
#mostra-btn{
  position: absolute;
  right: 10px;

}
#titData{
  position: absolute;
  left: 47.5%;
}

#anno-btn{
  position: absolute;
  left: 10px;
  top: 0px;
}
th {
  background-color: #f2f2f2;
}
button {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #6ca3d6;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}
button:hover {
  background-color: #345069;
  color: white;
}
@media (max-width: 600px) {
  #chart {
    height: 300px;
  }
  th, td {
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