import Vue from 'vue';

export const mutations = {
  updateMetric: (state, data) => {
    state.metrics = {
      ...state.metrics,
      [data.metric_id]: {
        ...state.metrics[data.metric_id],
        ...data,
        owner: localStorage.getItem('username'),
      },
    };
  },
  deleteMetric: (state, data) => {
    Vue.delete(state.metrics, data.metric_id);
    state.shares = {
      ...state.shares,
      incoming: Object.entries(state.shares.incoming).reduce((acc, [username, income]) => ({
        ...acc,
        [username]: Object.entries(income)
          .filter(([key]) => key !== data.metric_id)
          .reduce((acc2, [key, value]) => ({
            ...acc,
            [key]: value,
          }), {}),
      }), {}),
      outgoing: Object.entries(state.shares.outgoing).reduce((acc, [username, metricsIds]) => ({
        ...acc,
        [username]: metricsIds.filter((id) => id !== data.metric_id),
      }), {}),
      accepted: Object.entries(state.shares.accepted).reduce((acc, [username, metricsIds]) => ({
        ...acc,
        [username]: metricsIds.filter((id) => id !== data.metric_id),
      }), {}),
    };
  },
  deleteReading: (state, data) => {
    if (state.metrics[data.metric_id] && state.metrics[data.metric_id].readings) {
      Vue.delete(state.metrics[data.metric_id].readings, data.reading_id);
    }
  },
  updateReading: (state, data) => {
    if (state.metrics[data.metric_id] && state.metrics[data.metric_id].readings) {
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
    }
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
    state.metrics = Object.entries(data).reduce((acc, [username, metrics]) => ({
      ...acc,
      ...metrics.reduce((acc2, metric) => ({
        ...acc2,
        [metric.metric_id]: {
          ...metric,
          owner: username,
        },
      }), {}),
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
  updateAllShares: (state, data) => {
    state.shares = data;
  },
  selfShare: (state, data) => {
    state.shares = {
      ...state.shares,
      outgoing: {
        ...state.shares.outgoing,
        [data.share_username]: [
          ...(state.shares.outgoing[data.share_username] || []),
          data.metric_id,
        ],
      },
    };
  },
  foreignShare: (state, data) => {
    state.shares = {
      ...state.shares,
      incoming: {
        ...state.shares.incoming,
        [data.owner_username]: {
          ...(state.shares.incoming[data.owner_username] || {}),
          [data.metric_id]: {
            name: data.name,
            units: data.units,
            owner: data.owner_username,
          },
        },
      },
    };
  },
  selfAccept: (state, data) => {
    state.shares = {
      ...state.shares,
      incoming: {
        [data.owner_username]: Object.entries(state.shares.incoming[data.owner_username] || {})
          .filter(([key]) => (key !== data.metric_id))
          .reduce((acc, [key, val]) => ({
            ...acc,
            [key]: val,
          }), {}),
      },
    };
    state.metrics = {
      ...state.metrics,
      [data.metric_id]: {
        owner: data.owner_username,
        metric_id: data.metric_id,
        name: data.name,
        units: data.units,
        active: data.active,
        colour: data.colour,
        ...(state.metrics[data.metric_id] || {}),
      },
    };
  },
  foreignAccept: (state, data) => {
    state.shares = {
      ...state.shares,
      outgoing: {
        ...state.shares.outgoing,
        [data.share_username]: state.shares.outgoing[data.share_username]
          .filter((id) => id !== data.metric_id),
      },
      accepted: {
        ...state.shares.accepted,
        [data.share_username]: [
          ...(state.shares.accepted[data.share_username] || []),
          data.metric_id,
        ],
      },
    };
  },
  deleteShare: (state, data) => {
    if (data.share_username === localStorage.getItem('username')) {
      state.shares = {
        ...state.shares,
        incoming: {
          [data.owner_username]: Object.entries(state.shares.incoming[data.owner_username] || {})
            .filter(([key]) => (key !== data.metric_id))
            .reduce((acc, [key, val]) => ({
              ...acc,
              [key]: val,
            }), {}),
        },
      };
      state.metrics = Object.entries(state.metrics || {})
        .filter(([key]) => (key !== data.metric_id))
        .reduce((acc, [key, val]) => ({
          ...acc,
          [key]: val,
        }), {});
    } else {
      state.shares = {
        ...state.shares,
        outgoing: {
          ...state.shares.outgoing,
          [data.share_username]: (state.shares.outgoing[data.share_username] || [])
            .filter((id) => id !== data.metric_id),
        },
        accepted: {
          ...state.shares.accepted,
          [data.share_username]: (state.shares.accepted[data.share_username] || [])
            .filter((id) => id !== data.metric_id),
        },
      };
    }
  },
  updateShare: (state, data) => {
    state.metrics = {
      ...state.metrics,
      [data.metric_id]: {
        ...state.metrics[data.metric_id],
        colour: data.colour,
        active: data.active,
        owner: data.owner_username,
      },
    };
  },
  foreignMetricUpdate: (state, data) => {
    if (state.metrics[data.metric_id]) {
      state.metrics = {
        ...state.metrics,
        [data.metric_id]: {
          ...state.metrics[data.metric_id],
          name: data.name,
          units: data.units,
        },
      };
    }
    state.shares = {
      ...state.shares,
      incoming: Object.entries(state.shares.incoming).reduce((acc, [username, metrics]) => ({
        ...acc,
        [username]: Object.entries(metrics).reduce((acc2, [metricId, metric]) => ({
          ...acc,
          [metricId]: {
            ...metric,
            ...(metricId === data.metric_id ? {
              name: data.name,
              units: data.units,
            } : null),
          },
        }), {}),
      }), {}),
    };
  },
  removeUsername: (state, username) => {
    state.metrics = Object.entries(state.metrics || {})
      .filter(([, value]) => (value.owner !== username))
      .reduce((acc, [key, val]) => ({
        ...acc,
        [key]: val,
      }), {});
    Vue.delete(state.shares.incoming, username);
    Vue.delete(state.shares.outgoing, username);
    Vue.delete(state.shares.accepted, username);
  },
  changeForeignUsername: (state, data) => {
    state.metrics = Object.entries(state.metrics).reduce((acc, [metricId, metric]) => ({
      ...acc,
      [metricId]: {
        ...metric,
        ...(metric.owner === data.old_username ? { owner: data.username } : null),
      },
    }), {});
    state.shares = {
      ...state.shares,
      incoming: Object.entries(state.shares.incoming || {}).reduce((acc, [username, val]) => ({
        ...acc,
        ...(username === data.old_username ? { [data.username]: val } : { [username]: val }),
      }), {}),
      outgoing: Object.entries(state.shares.outgoing || {}).reduce((acc, [username, val]) => ({
        ...acc,
        ...(username === data.old_username ? { [data.username]: val } : { [username]: val }),
      }), {}),
      accepted: Object.entries(state.shares.accepted || {}).reduce((acc, [username, val]) => ({
        ...acc,
        ...(username === data.old_username ? { [data.username]: val } : { [username]: val }),
      }), {}),
    };
  },
  logout: (state) => {
    state.metrics = {};
    state.shares = {
      incoming: {},
      outgoing: {},
      accepted: {},
    };
  },
};
