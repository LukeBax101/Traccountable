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
          scales: {
            yAxes: [{
              gridLines: {
                display: false,
              },
              ticks: {
                display: false,
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
      const displayData = data.readings
        ? Object.values(data.readings)
          .sort(this.compare)
          .reduce((acc, reading) => [...acc, {
            x: reading.read_at,
            y: reading.value,
          }], [])
        : [];

      return {
        label: `${data.name} (${data.units})`,
        borderColor: data.colour,
        pointBorderColor: 'white',
        borderWidth: 2,
        backgroundColor: grad,
        pointBackgroundColor: 'white',
        data: displayData,
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
    randomScalingFactor() {
      return Math.round((Math.random() * 200));
    },
  },
};
</script>

<style>
</style>
