import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/graph',
    name: 'Graph',
    // route level code-splitting
    // this generates a separate chunk (sessions.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "sessions" */ '../views/Graph.vue'),
    meta: {
      Legend: 'slide-right',
      Settings: 'slide-right',
    },
  },
  {
    path: '/legend',
    name: 'Legend',
    // route level code-splitting
    // this generates a separate chunk (live.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "live" */ '../views/Legend.vue'),
    meta: {
      Graph: 'slide-left',
      Settings: 'slide-right',
    },
  },
  {
    path: '/settings',
    name: 'Settings',
    // route level code-splitting
    // this generates a separate chunk (settings.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "settings" */ '../views/Settings.vue'),
    meta: {
      Legend: 'slide-left',
      Graph: 'slide-left',
    },
  },
];

const router = new VueRouter({
  routes,
});

export default router;
