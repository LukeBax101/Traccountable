<template>
  <div class="legend">
    <b-overlay
      :show="loading"
      spinner-type="grow"
      rounded="sm"
      class="overlay"
    >
      <Header
        title="Metrics"
      ></Header>
      <div class="metrics-list">
        <List
          v-if="metrics"
          :items="metrics"
          :iconA="metricActive"
          iconB="pencil"
          iconC="trash"
          v-on:item-clicked="toggleMetricActive"
          v-on:edit-clicked="editClicked"
          v-on:delete-clicked="confirm"
        >
        </List>
      </div>
      <FloatButton
        icon="plus"
        v-on:float-button-clicked="$bvModal.show('new-metric-modal')"
      >
      </FloatButton>
      <NavBar
        :icons="navBarIcons"
        :selected="1"
        v-on:nav-bar-clicked="navBarClicked"
      ></NavBar>
    </b-overlay>
    <Modal
      id = "new-metric-modal"
      title="New Metric"
      :fields="newMetricModal"
      v-on:submit="addMetric"
    ></Modal>
    <Modal
      id = "edit-metric-modal"
      title="Edit Metric"
      :fields="editMetricModal"
      v-on:submit="editMetricSubmit"
    ></Modal>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import Header from '@/components/Header.vue';
import NavBar from '@/components/NavBar.vue';
import FloatButton from '@/components/FloatButton.vue';
import Modal from '@/components/Modal.vue';

import List from '@/components/List.vue';

export default {
  name: 'Legend',
  components: {
    Header,
    NavBar,
    List,
    FloatButton,
    Modal,
  },
  data() {
    return {
      loading: false,
      periodicCheck: 0,
      circle: () => 'Circle',
      navBarIcons: ['graph-up', 'card-list', 'gear'],
      currentEditMetric: null,
    };
  },
  computed: {
    ...mapGetters([
      'metrics',
      'validUnits',
    ]),
    newMetricModal() {
      return [{
        id: 'name',
        label: 'Name',
        invalidFeedback: 'Name must be at least a character long',
        isValid: (id) => (id && id.length >= 0),
        type: 'text',
      },
      {
        id: 'units',
        label: 'Units',
        options: this.validUnits,
        invalidFeedback: 'Please select a unit',
        isValid: (id) => (!!id),
        type: 'dropdown',
      },
      {
        id: 'colour',
        label: 'Colour',
        invalidFeedback: 'Colour must be 7 characters long',
        isValid: (id) => (id && id.length === 7),
        type: 'colour',
      }];
    },
    editMetricModal() {
      return this.currentEditMetric ? [{
        id: 'name',
        label: 'Name',
        invalidFeedback: 'Name must be at least a character long',
        isValid: (id) => (id && id.length >= 0),
        type: 'text',
        default: this.metrics[this.currentEditMetric].name,
      },
      {
        id: 'units',
        label: 'Units',
        options: this.validUnits,
        invalidFeedback: 'Please select a unit',
        isValid: (id) => (!!id),
        type: 'dropdown',
        default: this.metrics[this.currentEditMetric].units,
      },
      {
        id: 'colour',
        label: 'Colour',
        invalidFeedback: 'Colour must be 7 characters long',
        isValid: (id) => (id && id.length === 7),
        type: 'colour',
        default: this.metrics[this.currentEditMetric].colour,
      }] : [];
    },
  },
  async mounted() {
    this.load();
    this.periodicCheck = setInterval(this.getAllMetrics, 60000);
  },
  destroyed() {
    clearInterval(this.periodicCheck);
  },
  methods: {
    ...mapActions([
      'getAllMetrics',
      'addMetric',
      'updateMetric',
      'deleteMetric',
      'updateMetric',
    ]),
    metricActive(metric) {
      return metric.active ? 'circle-fill' : 'circle';
    },
    toggleMetricActive(metric) {
      this.updateMetric({
        metric_id: metric.metric_id,
        active: !metric.active,
      });
    },
    editClicked(metric) {
      this.currentEditMetric = metric.metric_id;
      this.$nextTick(() => {
        this.$bvModal.show('edit-metric-modal');
      });
    },
    editMetricSubmit(vals) {
      if (this.currentEditMetric) {
        this.updateMetric({
          ...vals,
          metric_id: this.currentEditMetric,
        });
      }
      this.currentEditMetric = null;
    },
    navBarClicked(idx) {
      if (idx === 0) {
        this.$router.push('/graph');
      } else if (idx === 2) {
        this.$router.push('/settings');
      }
    },
    async confirm(metric) {
      const confirmed = await this.$bvModal.msgBoxConfirm('This will delete all associated data!', {
        title: 'Are you sure?',
        size: 'sm',
        buttonSize: 'sm',
        okVariant: 'danger',
        okTitle: 'YES',
        cancelTitle: 'NO',
        footerClass: 'p-2',
        hideHeaderClose: false,
        centered: true,
      });
      if (confirmed) {
        this.deleteMetric({ metric_id: metric.metric_id });
      }
    },
    async load() {
      this.loading = true;
      await this.getAllMetrics();
      this.loading = false;
    },
  },
};
</script>

<style lang="scss">
.legend {
  position: absolute;
  width: 100%;
  height: 100%;
}

.metrics-list {
  height: calc(100% - 60px);
}

.overlay{
  width: 100%;
  height: 100%;
  color: $overlay-load;
}

</style>
