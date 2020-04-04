import Vue from 'vue';
import VueSocketIOExt from 'vue-socket.io-extended';
import socketio from 'socket.io-client';
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue';
import axios from 'axios';
import Verte from 'verte';
import { SOCKET_URL, SOCKET_PATH } from './properties';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import 'verte/dist/verte.css';

Vue.config.productionTip = false;

axios.defaults.withCredentials = true;

export const socket = socketio(SOCKET_URL, {
  path: SOCKET_PATH,
  transports: ['websocket'],
});

Vue.use(VueSocketIOExt, socket, { store });
Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);

Vue.use(Verte, {
  recentColors: JSON.parse(localStorage.getItem('colors')),
  onRecentColorsChange(colors) {
    localStorage.setItem('colors', JSON.stringify(colors));
  },
});

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
