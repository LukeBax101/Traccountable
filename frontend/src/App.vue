<template>
  <div id="app">
    <transition name="slide-down">
      <b-alert v-if="show" class="alert" :variant="type" :show="true"> {{ text }}</b-alert>
    </transition>
  <transition :name="transition">
    <router-view class="router"/>
  </transition>
  <transition name="grow">
    <FloatButton
      v-if="showFloatButton"
      icon="plus"
      v-on:float-button-clicked="floatButtonClicked"
    >
    </FloatButton>
  </transition>
  <transition name="fade-out">
    <NavBar
      v-if="showNavBar"
      :icons="navBarIcons"
      :selected="currentNavBar"
      v-on:nav-bar-clicked="navBarClicked"
    ></NavBar>
  </transition>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import NavBar from '@/components/NavBar.vue';
import FloatButton from '@/components/FloatButton.vue';
import EventBus from './event-bus';


export default {
  name: 'App',
  components: {
    NavBar,
    FloatButton,
  },
  data() {
    return {
      show: 0,
      text: '',
      type: '',
      navBarIcons: ['graph-up', 'card-list', 'gear'],
      transition: 'fade-out',
    };
  },
  mounted() {
    EventBus.$on('show-alert', (data) => {
      this.text = data.text;
      this.type = data.type || 'danger';
      this.show = true;
      setTimeout(() => { this.show = false; }, (data.duration || 2) * 1000);
    });
    this.$router.beforeEach((to, from, next) => {
      this.transition = to.meta?.[from.name]
        ? to.meta?.[from.name]
        : 'fade-out';
      next();
    });
  },
  destroyed() {
    EventBus.$off('show-alert');
  },
  computed: {
    ...mapGetters([
      'metrics',
    ]),
    showFloatButton() {
      return (this.$route.name === 'Graph' && Object.values(this.metrics).length > 0) || this.$route.name === 'Legend';
    },
    showNavBar() {
      return this.$route.name !== 'Home';
    },
    currentNavBar() {
      if (this.$route.name === 'Legend') {
        return 1;
      }
      if (this.$route.name === 'Settings') {
        return 2;
      }
      return 0;
    },
  },
  methods: {
    floatButtonClicked() {
      if (this.$route.name === 'Graph') {
        this.$bvModal.show('new-reading-modal');
      } else if (this.$route.name === 'Legend') {
        this.$bvModal.show('new-metric-modal');
      }
    },
    navBarClicked(idx) {
      if (idx === 0) {
        this.$router.push('/graph');
      } else if (idx === 1) {
        this.$router.push('/legend');
      } else if (idx === 2) {
        this.$router.push('/settings');
      }
    },
  },
};
</script>


<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100%;
  height: 100%;
  position: absolute;
  overflow: hidden;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

.alert {
  position: absolute;
  width: 100%;
  top: 55px;
  z-index: 10000;
}

.router {
  top: 0px;
}

// Fade
.fade-out-enter-active,
.fade-out-leave-active {
  transition: all 1.8s ease;
}

.fade-out-enter,
.fade-out-leave-to {
  opacity: 0
}


.slide-left-enter-active,
.slide-left-leave-active {
  transition: all .8s ease;
}
.slide-left-enter {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(-100%);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all .4s ease;
}

.slide-down-leave-to,
.slide-down-enter {
  transform: translateY(-210%);
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all .8s ease;
}
.slide-right-enter {
  transform: translateX(-100%);
}
.slide-right-leave-to {
  transform: translateX(100%);
}

.grow-enter-active,
.grow-leave-active {
  transition: all .2s ease;
}
.grow-enter,
.grow-leave-to {
  transform: scale(0.7);
  opacity: 0;
}

</style>
