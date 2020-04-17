export const getters = {
  metrics: (state) => state.metrics,
  activeMetrics: (state) => Object.values(state.metrics)
    .filter((metric) => metric.active),
  metricOptions: (state) => Object.values(state.metrics)
    .filter((metric) => metric.owner === localStorage.getItem('username'))
    .reduce((acc, metric) => [
      ...acc,
      { value: metric.metric_id, text: metric.name },
    ], [{ value: null, text: 'Please select an option' }]),
  validUnits: (state) => state.validUnits,
  incomingPending: (state) => Object.entries(state.shares.incoming)
    .reduce((acc, [key, value]) => ({
      ...acc,
      ...(Object.keys(value).length > 0 ? { [key]: value } : null),
    }), {}),
  incomingAccepted: (state) => Object.values(state.metrics)
    .filter((metric) => metric.owner !== localStorage.getItem('username')),
  outgoingPending: (state) => Object.entries(state.shares.outgoing)
    .reduce((acc, [key, value]) => ({
      ...acc,
      ...(value.length > 0 ? { [key]: value } : null),
    }), {}),
  outgoingAccepted: (state) => Object.entries(state.shares.accepted)
    .reduce((acc, [key, value]) => ({
      ...acc,
      ...(value.length > 0 ? { [key]: value } : null),
    }), {}),
};
