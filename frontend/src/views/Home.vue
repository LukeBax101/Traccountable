<template>
  <div class="home">
    <!-- <b-button pill v-on:click="$bvModal.show('login-modal')"> Login </b-button> -->

    <!-- <Modal
      id = "login-modal"
      title="Login"
      :fields="loginModal"
      v-on:submit="login"
    ></Modal> -->
    <div class="logo">
      Traccountable
    </div>
    <div class="login">
      <form ref="loginForm" @submit.stop.prevent="handleSubmit">
        <b-form-group
          :state="usernameValid"
          label="Username"
          label-for="username"
          invalid-feedback="Username must be at least a character long"
          key="username"
        >
          <b-form-input
            id="username"
            v-model="usernameValue"
            type="text"
            :state="usernameValid"
            required
            :autofocus="true"
          >
          </b-form-input>
        </b-form-group>
          <b-form-group
            :state="passwordValid"
            label="Password"
            label-for="password"
            invalid-feedback="Password must be at least 4 characters long"
            key="password"
          >
          <div class="password-entry">

            <b-form-input
              id="password"
              v-model="passwordValue"
              :type="passwordState ? 'password' : 'text'"
              :state="passwordValid"
              required
            >
            </b-form-input>
            <b-icon
              scale="1.3"
              class="password-eye"
              :icon="(passwordState) ? 'eye-fill' : 'eye-slash-fill'"
              v-on:click.prevent.stop="passwordState = !passwordState"
              ></b-icon>
            </div>
          </b-form-group>
      </form>
      <b-button block v-on:click="handleSubmit"> Login </b-button>
    </div>
    <div class="sign-up">
      <span> Don't have an account? </span>
      <div class="sign-up-link" v-on:click="$bvModal.show('signup-modal')"> Sign up here! </div>
    </div>

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
      signupModal: [{
        id: 'username',
        label: 'Username',
        invalidFeedback: 'Name must be at least a character long',
        isValid: (id) => (id && id.length >= 1),
        type: 'text',
      },
      {
        id: 'password',
        label: 'Password',
        invalidFeedback: 'Password must be at least 4 characters long',
        isValid: (id) => (id && id.length >= 4),
        type: 'password',
      }],
      usernameValue: '',
      usernameValid: null,
      passwordValue: '',
      passwordValid: null,
      passwordState: true,
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
    checkFormValidity() {
      this.usernameValid = (this.usernameValue.length >= 1);
      this.passwordValid = (this.passwordValue.length >= 4);

      return this.$refs.loginForm.checkValidity() && this.usernameValid && this.passwordValid;
    },
    handleSubmit() {
      if (!this.checkFormValidity()) {
        return;
      }
      this.login({
        username: this.usernameValue,
        password: this.passwordValue,
      });
    },
  },
};
</script>

<style lang="scss">
.password-entry {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.password-eye {
  width: 40px;
}
.logo {
  position: absolute;
  border-style: solid;
  border-width: 4px;
  border-color: $scheme-dark;
  border-radius: 15px;
  box-shadow: 0px 0px 10px 5px $scheme-dark;
  width: 80%;
  height: 10%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  left: 10%;
  top: 10%;
  font-variant: small-caps;
  font-size: 35px;
}

.login {
  padding: 10px;
  position: absolute;
  display: flex;
  flex-direction: column;
  text-align: left;
  width: 80%;
  top: 35%;
  left: 10%;
  border-style: solid;
  border-width: 4px;
  border-color: $scheme-dark;
  border-radius: 15px;
  box-shadow: 0px 0px 10px 5px $scheme-dark;
}

.sign-up {
  justify-content: center;
  display: flex;
  width: 100%;
  align-items: center;
  flex-direction: row;
  position: absolute;
  bottom: 0px;
  padding-bottom: 5px;
}

.sign-up-link {
  padding-left: 10px;
  font-style: italic;
  text-decoration: underline;
  color: $scheme-light
}

.home {
  background-color: $app-background;
}
</style>
