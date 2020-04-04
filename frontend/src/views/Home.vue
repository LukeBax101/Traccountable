<template>
  <div class="home">
    <b-button pill v-on:click="$bvModal.show('login-modal')"> Login </b-button>
    <b-button pill v-on:click="$bvModal.show('signup-modal')"> Sign up </b-button>

    <Modal
      id = "login-modal"
      title="Login"
      :fields="loginModal"
      v-on:submit="login"
    ></Modal>
    <!-- <form ref="form" @submit.stop.prevent="handleSubmit">
      <b-form-group
        :state="validity[field.id]"
        :label="field.label"
        :label-for="field.id"
        :invalid-feedback="field.invalidFeedback"
        :key="field.id"
      >
        <div v-if="field.type === 'password'" class="password-entry">
          <b-form-input
            :id="field.id"
            v-model="values[field.id]"
            :type="calcType(field.id, field.type)"
            :state="validity[field.id]"
            required
            :autofocus="idx === 0"
          >
          </b-form-input>
          <b-icon
            scale="1.3"
            class="password-eye"
            :icon="(passwordState[field.id]) ? 'eye-fill' : 'eye-slash-fill'"
            v-on:click.prevent.stop="passwordState[field.id] = !passwordState[field.id]"
            ></b-icon>
        </div>
        <b-form-input
          v-else
          :id="field.id"
          v-model="values[field.id]"
          :type="calcType(field.id, field.type)"
          :state="validity[field.id]"
          required
          :autofocus="idx === 0"
        >
        </b-form-input>
      </b-form-group>
    </form> -->
    <Modal
      id = "signup-modal"
      title="Sign Up"
      :fields="signupModal"
      v-on:submit="signup"
    ></Modal>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import Modal from '@/components/Modal.vue';


export default {
  name: 'Home',
  components: {
    Modal,
  },
  data() {
    return {
      loginModal: [{
        id: 'username',
        label: 'Username',
        invalidFeedback: 'Name must be at least a character long',
        isValid: (id) => (id && id.length >= 0),
        type: 'text',
      },
      {
        id: 'password',
        label: 'Password',
        invalidFeedback: 'Password must be at least 4 characters long',
        isValid: (id) => (id && id.length >= 4),
        type: 'password',
      }],
      signupModal: [{
        id: 'username',
        label: 'Username',
        invalidFeedback: 'Name must be at least a character long',
        isValid: (id) => (id && id.length >= 0),
        type: 'text',
      },
      {
        id: 'password',
        label: 'Password',
        invalidFeedback: 'Password must be at least 4 characters long',
        isValid: (id) => (id && id.length >= 4),
        type: 'password',
      }],
    };
  },
  mounted() {
    if (localStorage.getItem('trackId')) this.$router.push('/graph');
  },
  methods: {
    ...mapActions([
      'login',
      'signup',
    ]),
  },
};
</script>

<style lang="scss">

</style>
