import Vue from 'vue';

export const mutations = {
  updateMetric: (state, data) => {
    state.metrics = {
      ...state.metrics,
      [data.metric_id]: {
        ...state.metrics[data.metric_id],
        ...data,
      },
    };
  },
  deleteMetric: (state, data) => {
    Vue.delete(state.metrics, data.metric_id);
  },
  deleteReading: (state, data) => {
    Vue.delete(state.metrics[data.metric_id].readings, data.reading_id);
  },
  updateReading: (state, data) => {
    state.metrics = {
      ...state.metrics,
      [data.metric_id]: {
        ...state.metrics[data.metric_id],
        readings: {
          ...state.metrics[data.metric_id].readings,
          [data.reading_id]: data,
        },
      },
    };
  },
  setTrackIdMutation: (state, id) => {
    if (id) {
      localStorage.setItem('trackId', id);
    } else {
      localStorage.removeItem('trackId');
    }
  },
  setUsernameMutation: (state, name) => {
    if (name) {
      localStorage.setItem('username', name);
    } else {
      localStorage.removeItem('username');
    }
  },
  updateAllMetrics: (state, data) => {
    state.metrics = data.reduce((acc, metric) => ({
      ...acc,
      [metric.metric_id]: metric,
    }), {});
  },
  updateAllReadingsForMetric: (state, { metricId, data }) => {
    state.metrics = {
      ...state.metrics,
      [metricId]: {
        ...state.metrics[metricId],
        readings: data.reduce((acc, reading) => ({
          ...acc,
          [reading.reading_id]: reading,
        }), {}),
      },
    };
  },
};
