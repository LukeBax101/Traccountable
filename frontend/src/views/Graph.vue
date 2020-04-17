<template>
  <div class="graph">
    <b-overlay
      :show="loading"
      spinner-type="grow"
      rounded="sm"
      class="overlay"
    >
      <Header
        :title="username"
      ></Header>
      <div class="readings-list">
        <Chart v-if="activeMetrics.length > 0" :data="activeMetrics"></Chart>
        <div class="placeholder" v-else>
          <span class="placeholder-text">
          Hmmm, it looks like you've got no metrics currently active,
           try turning one on to see your data!
         </span>
        </div>
      </div>
    </b-overlay>
    <Modal
      id = "new-reading-modal"
      title="New Reading"
      :fields="newReadingModal"
      v-on:submit="addReadings"
      :units="metrics"
    ></Modal>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import Header from '@/components/Header.vue';
import Chart from '@/components/Chart.vue';
import Modal from '@/components/Modal.vue';


export default {
  name: 'Graph',
  components: {
    Header,
    Chart,
    Modal,
  },
  data() {
    return {
      loading: false,
      periodicCheck: 0,
      circle: () => 'Circle',
      datacollection: null,
    };
  },
  computed: {
    ...mapGetters([
      'activeMetrics',
      'metricOptions',
      'metrics',
    ]),
    newReadingModal() {
      const date = new Date(Date.now());
      const today = `${date.getUTCFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      return [{
        id: 'reading_at_date',
        label: 'Date',
        invalidFeedback: 'Please select a date',
        isValid: (id) => (!!id),
        type: 'date',
        default: today,
      },
      {
        id: 'reading_at_time',
        label: 'Time',
        isValid: () => true,
        type: 'time',
        optional: 'specific time?',
      },
      {
        id: 'metric_id',
        options: this.metricOptions,
        label: 'Metric',
        invalidFeedback: 'Please select a metric',
        isValid: (id) => (!!id),
        type: 'dropdown',
      },
      {
        id: 'value',
        label: 'Value',
        invalidFeedback: 'Please provide a valid value',
        isValid: (id) => (!!id && !Number.isNaN(id)),
        type: 'unit',
      }];
    },
    username() {
      return localStorage.getItem('username');
    },
  },
  async mounted() {
    this.load();
    this.periodicCheck = setInterval(this.getAllActiveData, 600000);
  },
  destroyed() {
    clearInterval(this.periodicCheck);
  },
  methods: {
    ...mapActions([
      'getAllActiveData',
      'addReading',
    ]),
    async load() {
      this.loading = true;
      await this.getAllActiveData();
      this.loading = false;
    },
    addReadings(vals) {
      const readAt = `${vals.reading_at_date}T${vals.reading_at_time || '12:00:00'}.000Z`;
      this.addReading({
        metric_id: vals.metric_id,
        value: vals.value,
        read_at: readAt,
      });
    },
  },
};
</script>

<style lang="scss">
.graph {
  position: absolute;
  width: 100%;
  height: 100%;
}

.readings-list {
  height: calc(100% - 100px);
  background-color: $app-background;
}

.overlay{
  width: 100%;
  height: 100%;
  color: $overlay-load;
}

.placeholder{
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-text {
  width: 60%;
  font-weight: 200;
  color: rgba(100,100,100,0.4);
  text-overflow: clip;
}

</style>
