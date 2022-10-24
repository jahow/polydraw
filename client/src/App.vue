<template>
  <div class="flex flex-col h-full">
    <MainMap
      class="grow"
      @cursor-move="handleCursorMove"
      :actor-positions="actorPositions"
    ></MainMap>
    <StatusBar class="shrink-0" :user="user"></StatusBar>
  </div>
</template>

<script async>
import MainMap from './components/MainMap';
import StatusBar from './components/StatusBar';
import { getUserInfo, updatePosition } from '@/services/session.service';
import { ref } from 'vue';
import throttle from 'lodash/throttle';

export default {
  components: {
    MainMap,
    StatusBar,
  },
  setup() {
    const user = ref({});
    const actorPositions = ref({});
    const actors = ref({});
    return {
      user,
      actors,
      actorPositions,
    };
  },
  async mounted() {
    this.user = await getUserInfo();
  },
  methods: {
    handleCursorMove: throttle(
      (value) => {
        updatePosition(value);
      },
      100,
      { leading: false },
    ),
  },
};
</script>

<style></style>
