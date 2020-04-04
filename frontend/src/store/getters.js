export const getters = {
  metrics: (state) => state.metrics,
  activeMetrics: (state) => Object.values(state.metrics)
    .filter((metric) => metric.active),
  metricOptions: (state) => Object.values(state.metrics)
    .reduce((acc, metric) => [
      ...acc,
      { value: metric.metric_id, text: metric.name },
    ], [{ value: null, text: 'Please select an option' }]),
  validUnits: (state) => state.validUnits,
};
