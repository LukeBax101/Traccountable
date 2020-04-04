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
      </div>
      <FloatButton
        icon="plus"
        v-on:float-button-clicked="$bvModal.show('new-reading-modal')"
      >
      </FloatButton>
      <NavBar
        :icons="navBarIcons"
        :selected="0"
        v-on:nav-bar-clicked="navBarClicked"
      ></NavBar>
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
import NavBar from '@/components/NavBar.vue';
import FloatButton from '@/components/FloatButton.vue';
import Chart from '@/components/Chart.vue';
import Modal from '@/components/Modal.vue';


export default {
  name: 'Graph',
  components: {
    Header,
    NavBar,
    FloatButton,
    Chart,
    Modal,
  },
  data() {
    return {
      loading: false,
      periodicCheck: 0,
      circle: () => 'Circle',
      navBarIcons: ['graph-up', 'card-list', 'gear'],
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
      return [{
        id: 'reading_at_date',
        label: 'Date',
        invalidFeedback: 'Please select a date',
        isValid: (id) => (!!id),
        type: 'date',
      },
      {
        id: 'reading_at_time',
        label: 'Time',
        isValid: () => true,
        type: 'time',
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
    this.periodicCheck = setInterval(this.getAllActiveData, 60000);
  },
  destroyed() {
    clearInterval(this.periodicCheck);
  },
  methods: {
    ...mapActions([
      'getAllActiveData',
      'addReading',
    ]),
    navBarClicked(idx) {
      if (idx === 1) {
        this.$router.push('/legend');
      } else if (idx === 2) {
        this.$router.push('/settings');
      }
    },
    async load() {
      this.loading = true;
      await this.getAllActiveData();
      this.loading = false;
    },
    addReadings(vals) {
      console.log(vals);
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
  background: rgba(0, 0, 0, 0.8);
}

.readings-list {
  height: calc(100% - 100px);
}

.overlay{
  width: 100%;
  height: 100%;
  color: $overlay-load;
}

</style>
