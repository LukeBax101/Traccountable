<template>
  <div class="list">
    <transition-group
      name="slide"
      appear
      v-bind:css="false"
      v-on:before-enter="beforeEnter"
      v-on:enter="enter"
      v-on:leave="leave"
    >
      <b-button
        block
        v-for="(item, idx) in Object.values(items)"
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
        <div class="icon-b" v-on:click.stop="$emit('edit-clicked', item)">
          <b-icon :icon="iconB"></b-icon>
        </div>
        <div class="icon-c" v-on:click.stop="$emit('delete-clicked', item)">
          <b-icon :icon="iconC"></b-icon>
        </div>
      </b-button>
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

.btn-block {
  height: 60px;
  border: none;
  box-shadow: 4px 2px 10px 6px $box-shadow;
  font-weight: bold;
}

.btn-block:last-child {
  margin-bottom: 80px;
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
  right: 40px;
}
.icon-c {
  display: inline-block;
  position: absolute;
  right: 10px;
}

</style>
