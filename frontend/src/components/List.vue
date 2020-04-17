<template>
  <div class="list">
    <transition-group
      name="slide"
      v-bind:css="false"
      v-on:before-enter="beforeEnter"
      v-on:enter="enter"
      v-on:leave="leave"
    >
    <div
      v-for="([key, items]) in sortedFields"
      :key="key"
    >
      <div class="title">
        {{ calcTitle(key) }}
      </div>
      <b-button
        block
        v-for="(item, idx) in items"
        variant="light"
        v-on:click="$emit('item-clicked', item)"
        v-bind:key="item.metric_id"
        v-bind:data-index="idx"
      >
        <b-icon
          class="icon-a"
          :icon="iconA(item)"
          v-bind:style="{ 'color': item.colour }"
          ></b-icon>
        <span>
          {{ item.name }}
        </span>
        <span v-if="item.units && item.units !== 'none' && item.units !== 'tod'">
          ({{ item.units }})
        </span>
          <div
            :id="`menu-button-${key}-${idx}`"
            class="icon-end"
            v-on:click.stop="togglePopover(idx, key)"
          >
            <b-icon icon="three-dots"></b-icon>
          </div>
          <b-popover
            :ref="`menu-popover-${key}-${idx}`"
            :id="`menu-popover-${key}-${idx}`"
            :target="`menu-button-${key}-${idx}`"
            triggers="hover"
            placement="auto"
          >
            <div v-if="calcKey(key)" class="popover-body">
              <div class="icon-b" v-on:click.stop="iconBClicked(item, idx, key)">
                <b-icon scale="1.3" :icon="iconB"></b-icon>
              </div>
              <div class="icon-c" v-on:click.stop="iconCClicked(item, idx, key)">
                <b-icon scale="1.3" :icon="iconC"></b-icon>
              </div>
              <div class="icon-d" v-on:click.stop="iconDClicked(item, idx, key)">
                <b-icon scale="1.3" :icon="iconD"></b-icon>
              </div>
          </div>
          <div v-else class="popover-body single">
            <div class="icon-d" v-on:click.stop="iconCClicked(item, idx, key)">
              <b-icon scale="1.3" :icon="iconC"></b-icon>
            </div>
        </div>
        </b-popover>
      </b-button>
    </div>
    </transition-group>
  </div>
</template>

<script>
import Velocity from 'velocity-animate';

export default {
  name: 'List',
  props: {
    items: Object,
    iconA: Function,
    iconB: String,
    iconC: String,
    iconD: String,
  },
  computed: {
    fields() {
      return Object.values(this.items).reduce((acc, item) => ({
        ...acc,
        [item.owner]: [...(acc[item.owner] || []), item],
      }), {});
    },
    sortedFields() {
      return Object.entries(this.fields).sort((a, b) => {
        if (a[0] === localStorage.getItem('username')) return -1;
        if (b[0] === localStorage.getItem('username')) return 1;
        return 0;
      });
    },
  },
  methods: {
    beforeEnter(el) {
      const element = el;
      element.style.transform = 'translateX(100%)';
    },
    enter(el, done) {
      const delay = el.dataset.index * 150;
      setTimeout(() => {
        Velocity(
          el,
          { translateX: [0, 500] },
          { complete: done },
        );
      }, delay);
    },
    leave(el, done) {
      const delay = el.dataset.index * 150;
      setTimeout(() => {
        Velocity(
          el,
          { translateX: [-500, 0] },
          { complete: done },
        );
      }, delay);
    },
    iconBClicked(item, idx, key) {
      this.$root.$emit('bv::hide::popover', `menu-popover-${key}-${idx}`);
      this.$emit('share-clicked', item);
    },
    iconCClicked(item, idx, key) {
      this.$root.$emit('bv::hide::popover', `menu-popover-${key}-${idx}`);
      this.$emit('edit-clicked', item);
    },
    iconDClicked(item, idx, key) {
      this.$root.$emit('bv::hide::popover', `menu-popover-${key}-${idx}`);
      this.$emit('delete-clicked', item);
    },
    togglePopover(idx, key) {
      if (this.$refs[`menu-popover-${key}-${idx}`][0].localShow) {
        this.$root.$emit('bv::hide::popover', `menu-popover-${key}-${idx}`);
      } else {
        this.$root.$emit('bv::show::popover', `menu-popover-${key}-${idx}`);
      }
    },
    calcTitle(username) {
      if (username === localStorage.getItem('username')) return 'My Metrics';
      return `${username}'s Metrics`;
    },
    calcKey(key) {
      return key === localStorage.getItem('username');
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>

.list {
  width: 100%;
  position:relative;
  overflow-y:auto;
  overflow-x:hidden;
  height: calc(100% - 50px);
}

.title {
  text-align: left;
  color: $scheme-light;
  padding-left: 10px;
  font-weight: bold;
}

.btn-block {
  height: 60px;
  border: none;
  box-shadow: 4px 2px 10px 6px $box-shadow;
  font-weight: bold;
}

.btn-block:last-child {
  margin-bottom: 20px;
}

.btn-block:first-child {
  margin-top: 10px;
}

.icon-a {
  position: absolute;
  left: 10px;
}

.icon-b {
  display: inline-block;
  position: absolute;
  right: 70px;
  top: 13px;
  height: 30px;
  width:30px;
}
.icon-c {
  display: inline-block;
  position: absolute;
  right: 35px;
  top: 13px;
  height: 30px;
  width:30px;
}
.icon-d {
  display: inline-block;
  position: absolute;
  right: 0px;
  top: 13px;
  height: 30px;
  width:30px;
}

.icon-end {
  display: inline-block;
  position: absolute;
  right: 10px;
}

.popover-body {
  width: 90px;
  height: 30px
}

.single {
  width: 20px;
}

</style>
