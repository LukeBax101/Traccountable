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
          v-if="Object.values(metrics).length > 0"
          :items="metrics"
          :iconA="metricActive"
          iconC="pencil"
          iconD="trash"
          iconB="people-fill"
          v-on:item-clicked="toggleMetricActive"
          v-on:share-clicked="shareClicked"
          v-on:edit-clicked="editClicked"
          v-on:delete-clicked="deleteClicked"
        >
        </List>
        <div class="placeholder" v-else>
          <span class="placeholder-text">
          Ahh you must be new here! Get started by adding a metric with the button below!
         </span>
        </div>
      </div>
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
    <Modal
      id = "share-metric-modal"
      title="Share Metric"
      :fields="shareMetricModal"
      v-on:submit="shareMetricSubmit"
    ></Modal>
    <Modal
      id = "edit-share-modal"
      title="Edit Shared Metric"
      :fields="editShareModal"
      v-on:submit="editShareSubmit"
    ></Modal>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import Header from '@/components/Header.vue';
import Modal from '@/components/Modal.vue';

import List from '@/components/List.vue';

export default {
  name: 'Legend',
  components: {
    Header,
    List,
    Modal,
  },
  data() {
    return {
      loading: false,
      periodicCheck: 0,
      circle: () => 'Circle',
      currentEditMetric: null,
      currentShareMetric: null,
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
    shareMetricModal() {
      return this.currentShareMetric ? [{
        id: 'username',
        label: 'Username',
        invalidFeedback: 'Name must be at least a character long',
        isValid: (id) => (id && id.length >= 0),
        type: 'text',
      }] : [];
    },
    editShareModal() {
      return this.currentEditMetric ? [{
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
    this.periodicCheck = setInterval(this.getAllMetrics, 600000);
  },
  destroyed() {
    clearInterval(this.periodicCheck);
  },
  methods: {
    ...mapActions([
      'addShare',
      'updateShare',
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
      if (metric.owner === localStorage.getItem('username')) {
        this.updateMetric({
          metric_id: metric.metric_id,
          active: !metric.active,
        });
      } else {
        this.updateShare({
          metric_id: metric.metric_id,
          active: !metric.active,
        });
      }
    },
    editClicked(metric) {
      this.currentEditMetric = metric.metric_id;
      if (metric.owner === localStorage.getItem('username')) {
        this.$nextTick(() => {
          this.$bvModal.show('edit-metric-modal');
        });
      } else {
        this.$nextTick(() => {
          this.$bvModal.show('edit-share-modal');
        });
      }
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
    editShareSubmit(vals) {
      if (this.currentEditMetric) {
        this.updateShare({
          ...vals,
          metric_id: this.currentEditMetric,
        });
      }
      this.currentEditMetric = null;
    },
    shareClicked(metric) {
      this.currentShareMetric = metric.metric_id;
      this.$nextTick(() => {
        this.$bvModal.show('share-metric-modal');
      });
    },
    async shareMetricSubmit(vals) {
      const confirmed = await this.$bvModal.msgBoxConfirm('This will share all data under the given metric with this user!', {
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
        this.addShare({ username: vals.username, metric_id: this.currentShareMetric });
      }
      this.currentShareMetric = null;
    },
    async deleteClicked(metric) {
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
