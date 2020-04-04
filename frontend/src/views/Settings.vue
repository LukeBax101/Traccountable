<template>
  <div class="settings">
    <b-overlay
      :show="loading"
      spinner-type="grow"
      rounded="sm"
      class="overlay"
    >
      <Header
        title="Settings"
      ></Header>
      <div class="settings-list">
        <b-button pill v-on:click="logout">Logout</b-button>
        <b-button
          pill
          v-on:click="$bvModal.show('username-update-modal')"
        >
          Change Username
        </b-button>
        <b-button
          pill
          v-on:click="$bvModal.show('password-update-modal')"
        >
          Change Password
        </b-button>
        <b-button
          pill
          variant="danger"
          v-on:click="confirm('This will delete all associated metrics and data!')"
        >
          Delete Track
        </b-button>
      </div>
      <NavBar
        :icons="navBarIcons"
        :selected="2"
        v-on:nav-bar-clicked="navBarClicked"
      ></NavBar>
    </b-overlay>
    <Modal
      id = "username-update-modal"
      title="Change Username"
      :fields="usernameUpdateModal"
      v-on:submit="updateTrackUsername"
    ></Modal>
    <Modal
      id = "password-update-modal"
      title="Change Password"
      :fields="passwordUpdateModal"
      v-on:submit="updateTrackPassword"
    ></Modal>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import Header from '@/components/Header.vue';
import NavBar from '@/components/NavBar.vue';
import Modal from '@/components/Modal.vue';

export default {
  name: 'Settings',
  components: {
    Header,
    NavBar,
    Modal,
  },
  data() {
    return {
      loading: false,
      periodicCheck: 0,
      circle: () => 'Circle',
      navBarIcons: ['graph-up', 'card-list', 'gear'],
      usernameUpdateModal: [{
        id: 'username',
        label: 'New Username',
        invalidFeedback: 'Name must be at least a character long',
        isValid: (id) => (id && id.length >= 0),
        type: 'text',
      }],
      passwordUpdateModal: [{
        id: 'password',
        label: 'New Password',
        invalidFeedback: 'Password must be at least 4 characters long',
        isValid: (id) => (id && id.length >= 4),
        type: 'password',
      }],
    };
  },
  async mounted() {
    this.load();
    this.periodicCheck = setInterval(() => {}, 60000);
  },
  destroyed() {
    clearInterval(this.periodicCheck);
  },
  methods: {
    ...mapActions([
      'logout',
      'getAllMetrics',
      'updateTrackUsername',
      'updateTrackPassword',
      'deleteTrack',
    ]),
    navBarClicked(idx) {
      if (idx === 0) {
        this.$router.push('/graph');
      } else if (idx === 1) {
        this.$router.push('/legend');
      }
    },
    async load() {
      this.loading = true;
      await this.getAllMetrics();
      this.loading = false;
    },
    async confirm(text) {
      const confirmed = await this.$bvModal.msgBoxConfirm(text, {
        title: 'Are you sure?',
        size: 'sm',
        buttonSize: 'sm',
        okVariant: 'danger',
        okTitle: 'YES',
        cancelTitle: 'NO',
        footerClass: 'p-2',
        hideHeaderClose: false,
        centered: true,
      });
      if (confirmed) {
        this.deleteTrack();
      }
    },
  },
};
</script>

<style lang="scss">
.settings {
  position: absolute;
  width: 100%;
  height: 100%;
}

.settings-list {
  display: flex;
  flex-direction: column;
  height: calc(100% - 60px);
}

.overlay{
  width: 100%;
  height: 100%;
  color: $overlay-load;
}

</style>
