<template>
    <b-modal
      :id="id"
      :ref="id"
      :title="title"
      v-on:show="setInitialValues"
      v-on:hidden="resetModal"
      v-on:ok="handleOk"
    >
      <form ref="form" @submit.stop.prevent="handleSubmit">
        <b-form-group
          v-for="(field, idx) in fields"
          :state="validity[field.id]"
          :label="field.label"
          :label-for="field.id"
          :invalid-feedback="field.invalidFeedback"
          :key="field.id"
          :class="{ inline: field.type === 'colour' || field.optional }"
        >
          <div
            class="optional"
            v-if="field.optional"
            v-on:click="togggleOptional(field.id)"
          >
            {{ optional[field.id] ? 'Add ' : 'Remove ' }}{{ field.optional }}
          </div>
          <div v-if="!optional[field.id]">
            <div v-if="field.type === 'password'" class="password-entry">
              <b-form-input
                :id="field.id"
                :value="values[field.id]"
                :type="calcType(field.id, field.type)"
                :state="validity[field.id]"
                required
                :autofocus="idx === 0"
                v-on:update="(val) => fieldUpdated(field.id, val)"
              >
              </b-form-input>
              <b-icon
                scale="1.3"
                class="password-eye"
                :icon="(passwordState[field.id]) ? 'eye-fill' : 'eye-slash-fill'"
                v-on:click.prevent.stop="passwordState[field.id] = !passwordState[field.id]"
                ></b-icon>
            </div>
            <div class="colour-picker" v-else-if="field.type === 'colour'">
              <verte
                :id="field.id"
                picker="wheel"
                model="hex"
                :enableAlpha="false"
                :value="values[field.id]"
                v-on:input="(val) => fieldUpdated(field.id, val)"
                menuPosition="center"
                :draggable="false"
              >
              </verte>
            </div>
            <div v-else-if="field.type === 'date'">
              <b-form-datepicker
                :id="field.id"
                :value="values[field.id]"
                v-on:input="(val) => fieldUpdated(field.id, val)"
                :max="max"
                :state="validity[field.id]"
                class="mb-2"
                today-button
                reset-button
                close-button
              ></b-form-datepicker>
            </div>
            <div v-else-if="field.type === 'time'">
              <b-form-timepicker
                :id="field.id"
                :value="values[field.id]"
                v-on:input="(val) => fieldUpdated(field.id, val)"
                :state="validity[field.id]"
                class="mb-2"
                placeholder="No time selected (Optional)"
                now-button
                reset-button
              ></b-form-timepicker>
            </div>
            <div v-else-if="field.type === 'dropdown'">
              <b-form-select
                :id="field.id"
                :value="values[field.id]"
                :options="field.options"
                v-on:input="(val) => fieldUpdated(field.id, val)"
                :state="validity[field.id]"
              ></b-form-select>
            </div>
            <div v-else-if="field.type === 'unit'">
              <div class="unit-entry"  v-if="unit !== 'tod'">
                <b-form-input
                  :id="field.id"
                  :value="values[field.id]"
                  type="number"
                  step="0.00000001"
                  v-on:update="(val) => fieldUpdated(field.id, val)"
                  :state="validity[field.id]"
                  required
                ></b-form-input>
                <div class="unit" v-if="unit">
                  {{ unit }}
                </div>
              </div>
              <div v-else>
                <b-form-timepicker
                  :id="field.id"
                  :value="timeOfDayValue"
                  v-on:input="(val) => fieldUpdated(field.id, val)"
                  :state="validity[field.id]"
                  class="mb-2"
                  now-button
                  reset-button
                ></b-form-timepicker>
              </div>
            </div>
            <b-form-input
              v-else
              :id="field.id"
              :value="values[field.id]"
              :type="field.type"
              :state="validity[field.id]"
              required
              :autofocus="idx === 0"
              v-on:update="(val) => fieldUpdated(field.id, val)"
            >
            </b-form-input>
          </div>
        </b-form-group>
      </form>
    </b-modal>
</template>

<script>
import Verte from 'verte';
import Vue from 'vue';

export default {
  name: 'Modal',
  components: {
    Verte,
  },
  props: {
    id: String,
    title: String,
    fields: Array,
    units: Object,
  },
  data() {
    return {
      max: new Date(),
      date: null,
      values: {},
      validity: {},
      optional: {},
      passwordState: {},
    };
  },
  computed: {
    unit() {
      if (this.values.metric_id && this.units) {
        const val = this.units[this.values.metric_id].units;
        return val !== 'none' ? val : null;
      }
      return null;
    },
    timeOfDayValue() {
      if (this.values && this.values.value) {
        const mins = this.values.value % 60;
        const hours = Math.floor(this.values.value / 60);
        return `${hours}:${mins}:00`;
      }
      return '';
    },
  },
  mounted() {
    this.$root.$on('bv::modal::show', () => {
      this.validity = {};
      this.passwordState = this.calcInitialPasswordState();
    });
  },
  destoyed() {
    this.$root.$off('bv::modal::show');
  },
  methods: {
    calcType(id, type) {
      if (type !== 'password') return type;
      return this.passwordState[id] ? 'password' : 'text';
    },
    setInitialValues() {
      Vue.set(this.values, 'colour', '#000000');
      const initialFields = this.fields.reduce((acc, field) => (field.default ? ({
        ...acc,
        [field.id]: field.default,
      }) : acc), {});
      Object.entries(initialFields).forEach(([key, val]) => {
        Vue.set(this.values, key, val);
      });
      const optionalFields = this.fields.reduce((acc, field) => ({
        ...acc,
        [field.id]: !!field.optional,
      }), {});
      Object.entries(optionalFields).forEach(([key, val]) => {
        Vue.set(this.optional, key, val);
      });
    },
    calcInitialPasswordState() {
      return this.fields.reduce((acc, field) => (field.type === 'password' ? ({
        ...acc,
        [field.id]: true,
      }) : acc), {});
    },
    fieldUpdated(id, val) {
      if (this.unit === 'tod' && id === 'value') {
        const timeVals = val.split(':');
        const hours = Number(timeVals[0]);
        const mins = Number(timeVals[1]);
        Vue.set(this.values, id, (hours * 60) + mins);
      } else {
        Vue.set(this.values, id, val);
      }
      if (this.validity[id] === false) {
        this.validity[id] = this.fields.filter((field) => field.id === id)[0].isValid(val);
      }
      if (id === 'metric_id') {
        if (this.unit === 'tod') {
          const date = new Date(Date.now());
          Vue.set(this.values, 'value', (date.getHours() * 60) + date.getMinutes());
        } else {
          Vue.set(this.values, 'value', null);
        }
        this.validity.value = null;
      }
    },
    checkFormValidity() {
      this.validity = this.fields.reduce((acc, field) => (
        {
          ...acc,
          [field.id]: !!field.isValid(this.values[field.id]),
        }), {});
      return this.$refs.form.checkValidity() && Object.values(this.validity).every((x) => x);
    },
    resetModal() {
      this.values = {};
    },
    handleOk(bvModalEvt) {
      bvModalEvt.preventDefault();
      this.handleSubmit();
    },
    handleSubmit() {
      if (!this.checkFormValidity()) {
        return;
      }
      this.$emit('submit', this.values);
      this.$nextTick(() => {
        this.$bvModal.hide(this.id);
      });
    },
    togggleOptional(id) {
      Vue.set(this.optional, id, !this.optional[id]);
    },
  },
};
</script>

<style>
.password-entry {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.password-eye {
  width: 40px;
}

.inline {
  display: flex;
  flex-direction: row;
}

.colour-picker {
  position: absolute;
  left: 80px;
}

.unit-entry {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.unit {
  margin-left: 10px;
}

.optional {
  margin-left: 20px;
  font-style: oblique;
text-decoration: underline;
}
</style>
