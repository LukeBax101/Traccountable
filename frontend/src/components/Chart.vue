<template>
  <canvas ref="myChart" width="400" height="400"></canvas>
</template>


<script>
import Chart from 'chart.js';

export default {
  name: 'Chart',
  props: {
    data: Array,
  },
  data() {
    return {
      chart: null,
      config: {
        type: 'line',
        data: {
          datasets: [],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          elements: {
            point: {
              hitRadius: 10,
            },
          },
          tooltips: {
            callbacks: {
              label: (tooltipItem, data) => {
                const { scale, offset, unit } = data
                  .datasets[tooltipItem.datasetIndex]
                  .data[tooltipItem.index];
                let label = data.datasets[tooltipItem.datasetIndex].label || '';

                if (label) {
                  label += ': ';
                }
                if (unit === 'tod') {
                  const avg = Math.round((this.calcAvgTime(data
                    .datasets[tooltipItem.datasetIndex]
                    .data.slice(0, tooltipItem.index + 1)
                    .map((val) => ((val.y * val.scale) + val.offset))) + 1440) % 1440);
                  const val = (Math.round(
                    ((tooltipItem.yLabel * scale) + offset) * 10,
                  ) / 10) % 1440;
                  label += `${String(Math.floor(val / 60)).padStart(2, '0')}:${String(val % 60).padStart(2, '0')}`;
                  label += ` (Avg: ${String(Math.floor(avg / 60)).padStart(2, '0')}:${String(avg % 60).padStart(2, '0')})`;
                } else if (unit === 'qty') {
                  const sum = Math.round(data
                    .datasets[tooltipItem.datasetIndex]
                    .data.slice(0, tooltipItem.index + 1)
                    .map((val) => ((val.y * val.scale) + val.offset))
                    .reduce((acc, val) => acc + val, 0) * 10) / 10;
                  label += Math.round(((tooltipItem.yLabel * scale) + offset) * 10) / 10;
                  label += ` (Total: ${sum})`;
                } else {
                  label += Math.round(((tooltipItem.yLabel * scale) + offset) * 10) / 10;
                }
                return label;
              },
              title: (tooltipItem) => new Date(tooltipItem[0].label).toDateString(),
              labelColor: (tooltipItem, chart) => {
                const { colour } = chart.config.data
                  .datasets[tooltipItem.datasetIndex]
                  .data[tooltipItem.index];
                return {
                  borderColor: colour,
                  backgroundColor: colour,
                };
              },
            },
          },
          scales: {
            yAxes: [{
              gridLines: {
                display: false,
              },
              ticks: {
                display: false,
                suggestedMax: 2,
                suggestedMin: -2,
              },
            }],
            xAxes: [{
              type: 'time',
              display: true,
              ticks: {
                major: {
                  enabled: true,
                },
              },
            }],
          },
        },
      },
    };
  },
  mounted() {
    const ctx = this.$refs.myChart.getContext('2d');
    this.chart = new Chart(ctx, this.config);
  },
  watch: {
    data(newData) {
      this.config.data.datasets = newData
        .reduce((acc, data) => [...acc, this.getDataSet(data)], []);
      this.chart.update();
    },
  },
  methods: {
    compare(a, b) {
      if (a.read_at < b.read_at) {
        return -1;
      }
      if (a.read_at > b.read_at) {
        return 1;
      }
      return 0;
    },
    getDataSet(data) {
      const rgba = this.getRgbaFromHex(data.colour);
      const ctx = this.$refs.myChart.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 0, 400);
      grad.addColorStop(0, rgba[0]);
      grad.addColorStop(0.5, rgba[1]);
      grad.addColorStop(1, rgba[2]);
      if (!data.readings) return {};
      let readings;
      if (data.units === 'tod') {
        readings = this.convertTimeReadings(data.readings);
      } else {
        readings = data.readings;
      }
      const { scale, offset } = this.getScaleOffset(
        Object.values(readings).map((reading) => reading.value),
      );
      const displayData = readings
        ? Object.values(readings)
          .sort(this.compare)
          .reduce((acc, reading) => [...acc, {
            x: reading.read_at,
            y: (reading.value - offset) / scale,
            scale,
            offset,
            unit: data.units,
            colour: data.colour,
          }], [])
        : [];
      let label;
      if (data.units === 'none') {
        label = data.name;
      } else if (data.units === 'tod') {
        label = `${data.name} (Time)`;
      } else {
        label = `${data.name} (${data.units})`;
      }
      return {
        label,
        borderColor: data.colour,
        pointBorderColor: 'black',
        borderWidth: 2,
        fill: 'start',
        backgroundColor: grad,
        pointBackgroundColor: 'black',
        data: displayData,
      };
    },
    getScaleOffset(readings) {
      const max = Math.max(...readings);
      const min = Math.min(...readings);
      const avg = (max + min) / 2;
      return {
        scale: max - avg,
        offset: avg,
      };
    },
    getRgbaFromHex(hex) {
      if (hex.length !== 7) {
        return ['rgba(255, 0, 0, 0.5)', 'rgba(255, 0, 0, 0.25)', 'rgba(255, 0, 0, 0)'];
      }
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [
        `rgba(${r}, ${g}, ${b}, 0.5)`,
        `rgba(${r}, ${g}, ${b}, 0.25)`,
        `rgba(${r}, ${g}, ${b}, 0)`,
      ];
    },
    convertTimeReadings(readings) {
      const mean = (
        this.calcAvgTime(Object.values(readings).map((reading) => reading.value)) + 1440
      ) % 1440;
      const split = (mean + 720) % 1440;
      return Object.entries(readings).reduce((acc, [key, reading]) => ({
        ...acc,
        [key]: {
          ...reading,
          value: (reading.value < split) ? (reading.value + 1440) : reading.value,
        },
      }), {});
    },
    randomScalingFactor() {
      return Math.round((Math.random() * 200));
    },
    calcAvgTime(vals) {
      function sum(a) {
        let s = 0;
        for (let i = 0; i < a.length; i += 1) s += a[i];
        return s;
      }

      function timeToRad(a) {
        return (Math.PI / 180) * (a / 4);
      }

      return ((180 / Math.PI) * Math.atan2(
        sum(vals.map(timeToRad).map(Math.sin)) / vals.length,
        sum(vals.map(timeToRad).map(Math.cos)) / vals.length,
      ) * 4);
    },
  },
};
</script>

<style>
</style>
