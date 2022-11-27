<template>
  <div class="flex flex-col h-full relative">
    <MainMap
      class="grow"
      @new-position="handleNewPosition"
      :actor-positions="actorPositions"
      :actors="actors"
    ></MainMap>
    <StatusBar class="shrink-0" :user="user"></StatusBar>
    <CurrentActors
      class="absolute top-0 right-0"
      :actors="actors"
    ></CurrentActors>
  </div>
</template>

<script async>
import MainMap from './components/MainMap';
import StatusBar from './components/StatusBar';
import {
  getActorsInfo,
  getActorsPosition,
  getUserInfo,
  updatePosition,
} from '@/services/session.service';
import { ref } from 'vue';
import throttle from 'lodash/throttle';
import CurrentActors from '@/components/CurrentActors';

export default {
  components: {
    CurrentActors,
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
    getActorsInfo().subscribe((actors) => (this.actors = actors));
    getActorsPosition().subscribe(
      (positions) => (this.actorPositions = positions),
    );
  },
  methods: {
    handleNewPosition: throttle(
      (value) => {
        updatePosition(value.cursor, value.viewport);
      },
      16,
      { leading: false },
    ),
  },
};
</script>

<style></style>
