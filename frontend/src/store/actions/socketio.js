/* eslint-disable camelcase */

import EventBus from '@/event-bus';
import router from '@/router';


async function socket_trackUpdate({ commit }, data) {
  if (data.track_id && data.track_id === localStorage.trackId) {
    commit('setUsernameMutation', data.username);
  }
}

// eslint-disable-next-line
async function socket_trackDelete({ commit }, data) {
  if (data.track_id && data.track_id === localStorage.trackId) {
    commit('setUsernameMutation');
    commit('setTrackIdMutation');
    EventBus.$emit('show-alert', { text: 'Track deleted elsewhere' });
    router.push('/');
  }
}

async function socket_metricNew({ commit }, data) {
  if (data.track_id && data.track_id === localStorage.trackId) {
    commit('updateMetric', data);
  }
}

async function socket_metricUpdate({ commit }, data) {
  if (data.track_id && data.track_id === localStorage.trackId) {
    commit('updateMetric', data);
  }
}

async function socket_metricDelete({ commit }, data) {
  if (data.track_id && data.track_id === localStorage.trackId) {
    commit('deleteMetric', data);
  }
}

async function socket_readingNew({ commit }, data) {
  if (data.track_id && data.track_id === localStorage.trackId) {
    commit('updateReading', data);
  }
}

async function socket_readingUpdate({ commit }, data) {
  if (data.track_id && data.track_id === localStorage.trackId) {
    commit('updateReading', data);
  }
}

async function socket_readingDelete({ commit }, data) {
  if (data.track_id && data.track_id === localStorage.trackId) {
    commit('deleteReading', data);
  }
}


// eslint-disable-next-line
async function wait(time) {
  await new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

export const socketio = {
  socket_trackUpdate,
  socket_trackDelete,
  socket_metricNew,
  socket_metricUpdate,
  socket_metricDelete,
  socket_readingNew,
  socket_readingUpdate,
  socket_readingDelete,
};
