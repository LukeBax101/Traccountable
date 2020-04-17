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
        <div class="sharing-center">
          <span class="sharing-center-title">
            Sharing Center
          </span>
          <div
            v-if="Object.entries(sharedByMe).length > 0 || Object.entries(sharedWithMe).length > 0"
          >
            <div class="shared-with" v-if="Object.entries(sharedByMe).length > 0">
              <span class="shared-with-title">
                My Metrics Shared With Others
              </span>
              <div
                v-for="([key, metrics]) in Object.entries(sharedByMe)"
                :key="`${key}-by-me`"
                class="share-user"
              >
                <span class="share-user-title">
                  {{ key }}
                </span>
                <div
                  v-for="(metric, idx) in metrics"
                  :key="`${metric.metric_id}-${key}-${idx}`"
                  class="metric-entry"
                >
                    <span>{{ `${metric.name} (${metric.units})` }}
                    </span>
                    <div class="metric-end">
                      <b-button disabled class="marker">
                        {{ `${metric.accepted ? 'Accepted' : 'Pending'}` }}
                      </b-button>
                      <b-icon
                        class="delete-icon"
                        scale="1.3"
                        icon="trash"
                        v-on:click="shareDelete(key, metric)"
                      ></b-icon>
                    </div>
                </div>
              </div>
            </div>
            <div class="shared-with" v-if="Object.entries(sharedWithMe).length > 0">
              <span class="shared-with-title">
                Other's Metrics Shared With Me
              </span>
              <div
                v-for="([key, metrics]) in Object.entries(sharedWithMe)"
                :key="`${key}-with-me`"
                class="share-user"
              >
                <span class="share-user-title" v-if="metrics.length > 0">
                  {{ key }}
                </span>
                <div
                  v-for="(metric, idx) in metrics"
                  :key="`${metric.metric_id}-${key}-${idx}`"
                  class="metric-entry"
                  :class="{ 'pending': !metric.accepted }"
                >
                  <span>{{ `${metric.name} (${metric.units})` }}
                  </span>
                  <div class="metric-end">
                    <div v-if="metric.accepted">
                      <b-button disabled class="marker">
                        Accepted
                      </b-button>
                      <b-icon
                        class="delete-icon"
                        scale="1.3"
                        icon="trash"
                        v-on:click="shareDelete(key, metric)"
                      ></b-icon>
                    </div>
                    <div v-else>
                      <b-button variant="success" class="marker" v-on:click="shareAccept(metric)">
                        Accept
                      </b-button>
                      <b-button
                        variant="danger"
                        class="marker"
                        v-on:click="shareDelete(key, metric)"
                      >
                        Reject
                      </b-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="placeholder" v-else>
            <span class="placeholder-text">
            Looks like you're not sharing any metrics nor is anyone sharing with you!
             Why not start the cycle and share the love!
           </span>
          </div>
      </div>
      <div class="account-options">
        <span class="account-options-title">
          Account Management
        </span>
        <b-button v-on:click="logout">Logout</b-button>
        <b-button
          v-on:click="$bvModal.show('username-update-modal')"
        >
          Change Username
        </b-button>
        <b-button
          v-on:click="$bvModal.show('password-update-modal')"
        >
          Change Password
        </b-button>
        <b-button
          variant="danger"
          v-on:click="confirm('This will delete all associated metrics and data!')"
        >
          Delete Account
        </b-button>
      </div>
    </div>
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
import { mapActions, mapGetters } from 'vuex';
import Header from '@/components/Header.vue';
import Modal from '@/components/Modal.vue';

export default {
  name: 'Settings',
  components: {
    Header,
    Modal,
  },
  data() {
    return {
      loading: false,
      periodicCheck: 0,
      circle: () => 'Circle',
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
    this.periodicCheck = setInterval(() => {
      this.getAllMetrics();
      this.getShares();
    }, 600000);
  },
  destroyed() {
    clearInterval(this.periodicCheck);
  },
  computed: {
    ...mapGetters([
      'metrics',
      'incomingPending',
      'incomingAccepted',
      'outgoingPending',
      'outgoingAccepted',
    ]),
    sharedWithMe() {
      const pending = Object.entries(this.incomingPending || {})
        .reduce((acc, [username, metricIds]) => ({
          ...acc,
          [username]: Object.entries(metricIds).reduce((acc2, [metricId, metric]) => [
            ...acc2,
            {
              ...metric,
              metric_id: metricId,
              owner: username,
              accepted: false,
            },
          ], []),
        }), {});

      return this.incomingAccepted
        .reduce((acc, metric) => ({
          ...acc,
          [metric.owner]: [
            ...(acc[metric.owner] || []),
            {
              ...metric,
              accepted: true,
            },
          ],
        }), pending);
    },
    sharedByMe() {
      const pending = Object.entries(this.outgoingPending || {})
        .reduce((acc, [username, metricIds]) => ({
          ...acc,
          [username]: metricIds.map((metricId) => ({
            ...this.metrics[metricId],
            accepted: false,
          })),
        }), {});

      return Object.entries(this.outgoingAccepted || {})
        .reduce((acc, [username, metricIds]) => ({
          ...acc,
          [username]: [
            ...(acc[username] || []),
            ...metricIds.map((metricId) => ({
              ...this.metrics[metricId],
              accepted: true,
            })),
          ],
        }), pending);
    },
  },
  methods: {
    ...mapActions([
      'logout',
      'getAllMetrics',
      'getShares',
      'updateTrackUsername',
      'updateTrackPassword',
      'deleteTrack',
      'acceptShare',
      'deleteShare',
    ]),
    async load() {
      this.loading = true;
      await this.getAllMetrics();
      await this.getShares();
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
    async shareDelete(key, metric) {
      const text = (key === metric.owner)
        ? `${metric.owner} will need to share it again before you can view it again.`
        : `${key} won't be able to view this metric till you share it again.`;
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
        this.deleteShare({
          metric_id: metric.metric_id,
          share_username: (key === metric.owner) ? localStorage.getItem('username') : key,
          owner_username: metric.owner,
        });
      }
    },
    shareAccept(metric) {
      this.acceptShare({ metric_id: metric.metric_id });
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
  background-color: $app-background;
}

.overlay{
  width: 100%;
  height: 100%;
  color: $overlay-load;
}

.account-options {
  position: absolute;
  width: 100%;
  display: flex;
  flex-direction: column;
  bottom: 60px;
}

.account-options-title {
  text-align: left;
  font-weight: bold;
  padding-left: 10px;
}

.sharing-center {
  top: 60px;
  width: 100%;
  position: absolute;
  display: flex;
  flex-direction: column;
  text-align: left;
  padding-left: 10px;
}

.sharing-center-title {
  font-weight: bold;
}

.shared-with {
  padding-left: 10px;
  color: black;
}

.shared-with-title {
  text-decoration: underline;
  font-weight: bold;
}

.share-user {
  padding-left: 10px;
  margin-bottom: 10px;
  margin-right: 10px;
}

.share-user-title {
  font-style: italic;
}

.metric-entry {
  margin-left: 10px;
  padding-left: 10px;
  margin-right: 10px;
  margin-bottom: 5px;

  display: flex;
  flex-direction: row;
  height: 30px;
}

.metric-end {
  display: flex;
  flex-direction: row;
  position: absolute;
  right: 40px;
}

.marker {
  height: 20px;
  font-variant: small-caps;
  font-size: 12px;
  justify-content: center;
  text-align: center;
  padding-top: 0px;
  padding-bottom: 0px;
  margin-right: 10px;
}

.delete-icon {
  position: absolute;
  top: 5px;
  right: -10px;
}

.placeholder{
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-text {
  width: 60%;
  font-weight: 200;
  color: rgba(100,100,100,0.4);
  text-overflow: clip;
  text-align: center;
}
</style>
