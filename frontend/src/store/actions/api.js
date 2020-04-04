import axios from 'axios';
import { API_URL } from '@/properties';
import EventBus from '@/event-bus';
import router from '@/router';


async function getAllMetrics({ commit }) {
  try {
    if (localStorage.getItem('trackId')) {
      const req = await axios.get(`${API_URL}/track/${localStorage.trackId}`);
      commit('updateAllMetrics', req.data);
    } else {
      router.push('/');
      commit('setUsernameMutation');
    }
  } catch (e) {
    if (e.response.status === 401) {
      router.push('/');
      commit('setTrackIdMutation');
      commit('setUsernameMutation');
    } else {
      EventBus.$emit('show-alert', { text: `Error: ${e.response.data}` });
    }
  }
}

async function getAllActiveData({ state, commit, dispatch }) {
  try {
    if (localStorage.getItem('trackId')) {
      await dispatch('getAllMetrics');
      const activeMetrics = Object.values(state.metrics).filter((metric) => metric.active);
      activeMetrics.forEach(async (metric) => {
        if (localStorage.getItem('trackId')) {
          const req = await axios.get(`${API_URL}/track/${localStorage.getItem('trackId')}/metric/${metric.metric_id}`);
          commit('updateAllReadingsForMetric', { metricId: metric.metric_id, data: req.data });
        }
      });
    } else {
      router.push('/');
      commit('setUsernameMutation');
    }
  } catch (e) {
    if (e.response.status === 401) {
      router.push('/');
      commit('setTrackIdMutation');
      commit('setUsernameMutation');
    } else {
      EventBus.$emit('show-alert', { text: `Error: ${e.response.data}` });
    }
  }
}

async function updateTrackUsername({ commit }, data) {
  try {
    if (localStorage.getItem('trackId')) {
      const req = await axios.patch(`${API_URL}/track/${localStorage.trackId}`, {
        username: data.username,
      });
      commit('setUsernameMutation', req.data.username);
      EventBus.$emit('show-alert', { type: 'success', text: 'Username updated' });
    } else {
      router.push('/');
      commit('setUsernameMutation');
    }
  } catch (e) {
    if (e.response.status === 401) {
      router.push('/');
      commit('setTrackIdMutation');
      commit('setUsernameMutation');
    } else {
      EventBus.$emit('show-alert', { text: `Error: ${e.response.data}` });
    }
  }
}

async function updateTrackPassword({ commit }, data) {
  try {
    if (localStorage.getItem('trackId')) {
      await axios.patch(`${API_URL}/track/${localStorage.trackId}`, {
        password: data.password,
      });
      EventBus.$emit('show-alert', { type: 'success', text: 'Password updated' });
    } else {
      router.push('/');
      commit('setUsernameMutation');
    }
  } catch (e) {
    if (e.response.status === 401) {
      router.push('/');
      commit('setTrackIdMutation');
      commit('setUsernameMutation');
    } else {
      EventBus.$emit('show-alert', { text: `Error: ${e.response.data}` });
    }
  }
}

async function deleteTrack({ commit }) {
  try {
    if (localStorage.getItem('trackId')) {
      await axios.delete(`${API_URL}/track/${localStorage.trackId}`);
      commit('setTrackIdMutation');
      EventBus.$emit('show-alert', { type: 'success', text: 'Track deleted' });
      await axios.get(`${API_URL}/auth/logout`);
    }
    commit('setUsernameMutation');
  } catch (e) {
    if (e.response.status === 401) {
      router.push('/');
      commit('setTrackIdMutation');
      commit('setUsernameMutation');
    } else {
      EventBus.$emit('show-alert', { text: `Error: ${e.response.data}` });
    }
  }
}

async function addMetric({ commit }, data) {
  try {
    if (localStorage.getItem('trackId')) {
      const req = await axios.post(`${API_URL}/track/${localStorage.trackId}/metric`, {
        name: data.name,
        units: data.units,
        colour: data.colour,
      });
      commit('updateMetric', req.data);
    } else {
      router.push('/');
      commit('setUsernameMutation');
    }
  } catch (e) {
    if (e.response.status === 401) {
      router.push('/');
      commit('setTrackIdMutation');
      commit('setUsernameMutation');
    } else {
      EventBus.$emit('show-alert', { text: `Error: ${e.response.data}` });
    }
  }
}

async function updateMetric({ commit }, data) {
  try {
    if (localStorage.getItem('trackId')) {
      const req = await axios.patch(`${API_URL}/track/${localStorage.trackId}/metric/${data.metric_id}`, data);
      commit('updateMetric', req.data);
    } else {
      router.push('/');
      commit('setUsernameMutation');
    }
  } catch (e) {
    if (e.response.status === 401) {
      router.push('/');
      commit('setTrackIdMutation');
      commit('setUsernameMutation');
    } else {
      EventBus.$emit('show-alert', { text: `Error: ${e.response.data}` });
    }
  }
}

async function deleteMetric({ commit }, data) {
  try {
    if (localStorage.getItem('trackId')) {
      await axios.delete(`${API_URL}/track/${localStorage.trackId}/metric/${data.metric_id}`);
      commit('deleteMetric', {
        track_id: localStorage.trackId,
        metric_id: data.metric_id,
      });
    } else {
      router.push('/');
      commit('setUsernameMutation');
    }
  } catch (e) {
    if (e.response.status === 401) {
      router.push('/');
      commit('setTrackIdMutation');
      commit('setUsernameMutation');
    } else {
      EventBus.$emit('show-alert', { text: `Error: ${e.response.data}` });
    }
  }
}

async function addReading({ commit }, data) {
  try {
    if (localStorage.getItem('trackId')) {
      const req = await axios.post(`${API_URL}/track/${localStorage.trackId}/metric/${data.metric_id}/reading`, {
        value: data.value,
        read_at: data.read_at,
      });
      commit('updateReading', req.data);
    } else {
      router.push('/');
      commit('setUsernameMutation');
    }
  } catch (e) {
    if (e.response.status === 401) {
      router.push('/');
      commit('setTrackIdMutation');
      commit('setUsernameMutation');
    } else {
      EventBus.$emit('show-alert', { text: `Error: ${e.response.data}` });
    }
  }
}

async function updateReading({ commit }, data) {
  try {
    if (localStorage.getItem('trackId')) {
      const req = await axios.patch(`${API_URL}/track/${localStorage.trackId}/metric/${data.metric_id}/reading/${data.reading_id}`, data);
      commit('updateReading', req.data);
    } else {
      router.push('/');
      commit('setUsernameMutation');
    }
  } catch (e) {
    if (e.response.status === 401) {
      router.push('/');
      commit('setTrackIdMutation');
      commit('setUsernameMutation');
    } else {
      EventBus.$emit('show-alert', { text: `Error: ${e.response.data}` });
    }
  }
}

async function deleteReading({ commit }, data) {
  try {
    if (localStorage.getItem('trackId')) {
      await axios.delete(`${API_URL}/track/${localStorage.trackId}/metric/${data.metric_id}/reading/${data.reading_id}`);
      commit('deleteReading', {
        track_id: localStorage.trackId,
        metric_id: data.metric_id,
        reading_id: data.reading_id,
      });
    } else {
      router.push('/');
      commit('setUsernameMutation');
    }
  } catch (e) {
    if (e.response.status === 401) {
      router.push('/');
      commit('setTrackIdMutation');
      commit('setUsernameMutation');
    } else {
      EventBus.$emit('show-alert', { text: `Error: ${e.response.data}` });
    }
  }
}


async function login({ commit }, data) {
  try {
    const req = await axios.post(`${API_URL}/auth/login`, {
      username: data.username,
      password: data.password,
    });
    if (req.status === 200) {
      commit('setTrackIdMutation', req.data.track_id);
      commit('setUsernameMutation', req.data.username);
      EventBus.$emit('show-alert', { text: 'Login Successful', type: 'success' });
      router.push('/graph');
    }
  } catch (e) {
    if (e.response.status === 401) {
      EventBus.$emit('show-alert', { text: 'Incorrect password' });
    } else {
      EventBus.$emit('show-alert', { text: `Error: ${e.response.data}` });
    }
  }
}

async function signup({ commit }, data) {
  try {
    const req = await axios.post(`${API_URL}/auth/signup`, {
      username: data.username,
      password: data.password,
    });
    if (req.status === 200) {
      commit('setTrackIdMutation', req.data.track_id);
      commit('setUsernameMutation', req.data.username);
      EventBus.$emit('show-alert', { text: 'Signup Successful', type: 'success' });
      router.push('/graph');
    }
  } catch (e) {
    EventBus.$emit('show-alert', { text: `Error: ${e.response.data}` });
  }
}

async function logout({ commit }) {
  try {
    const req = await axios.get(`${API_URL}/auth/logout`);
    if (req.status === 200) {
      commit('setTrackIdMutation');
      commit('setUsernameMutation');
      EventBus.$emit('show-alert', { text: 'Logout Successful', type: 'success' });
      router.push('/');
    }
  } catch (e) {
    EventBus.$emit('show-alert', { text: `Error: ${e.response.data}` });
  }
}

// eslint-disable-next-line
async function wait(time) {
  await new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

// eslint-disable-next-line
async function defaultAPI({ commit }, data) {
  try {
    if (localStorage.getItem('trackId')) {
      // const req = await axios.post(`${API_URL}/track/${localStorage.trackId}`, {
      // });
      // commit('', );
    } else {
      router.push('/');
      commit('setUsernameMutation');
    }
  } catch (e) {
    if (e.response.status === 401) {
      router.push('/');
      commit('setTrackIdMutation');
      commit('setUsernameMutation');
    } else {
      EventBus.$emit('show-alert', { text: `Error: ${e.response.data}` });
    }
  }
}

export const api = {
  getAllMetrics,
  getAllActiveData,
  updateTrackUsername,
  updateTrackPassword,
  deleteTrack,
  addMetric,
  updateMetric,
  deleteMetric,
  addReading,
  updateReading,
  deleteReading,
  login,
  signup,
  logout,
};
