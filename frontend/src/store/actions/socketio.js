/* eslint-disable camelcase */

import EventBus from '@/event-bus';
import router from '@/router';


async function socket_trackUpdate({ commit }, data) {
  if (data.track_id && data.track_id === localStorage.trackId) {
    commit('setUsernameMutation', data.username);
  } else if (data.old_username) {
    commit('changeForeignUsername', data);
  }
}

// eslint-disable-next-line
async function socket_trackDelete({ commit }, data) {
  if (data.track_id && data.track_id === localStorage.trackId) {
    commit('setUsernameMutation');
    commit('setTrackIdMutation');
    commit('logout');
    EventBus.$emit('show-alert', { text: 'Track deleted elsewhere' });
    router.push('/');
  } else {
    commit('removeUsername', data.username);
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
  } else {
    commit('foreignMetricUpdate', data);
  }
}

async function socket_metricDelete({ commit }, data) {
  commit('deleteMetric', data);
}

async function socket_readingNew({ commit }, data) {
  if (data.track_id && data.track_id === localStorage.trackId) {
    commit('updateReading', data);
  }
}

async function socket_readingUpdate({ commit }, data) {
  commit('updateReading', data);
}

async function socket_readingDelete({ commit }, data) {
  commit('deleteReading', data);
}

async function socket_shareNew({ commit }, data) {
  if (data.owner_track_id && data.owner_track_id === localStorage.trackId) {
    commit('selfShare', data);
  } else if (data.shared_track_id && data.shared_track_id === localStorage.trackId) {
    commit('foreignShare', data);
  }
}

async function socket_shareAccept({ commit }, data) {
  if (data.owner_track_id && data.owner_track_id === localStorage.trackId) {
    commit('foreignAccept', data);
  } else if (data.shared_track_id && data.shared_track_id === localStorage.trackId) {
    commit('selfAccept', data);
  }
}

async function socket_shareDelete({ commit }, data) {
  if (data.owner_username === localStorage.getItem('username') || data.share_username === localStorage.getItem('username')) {
    commit('deleteShare', data);
  }
}

async function socket_shareUpdate({ commit }, data) {
  if (data.shared_track_id === localStorage.getItem('trackId')) {
    commit('updateShare', data);
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
  socket_shareNew,
  socket_shareAccept,
  socket_shareDelete,
  socket_shareUpdate,
};
