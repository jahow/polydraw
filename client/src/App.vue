<template>
  <div class="flex flex-col h-full relative">
    <MainMap
      class="grow"
      @new-position="handleNewPosition"
      @new-feature="handleNewFeature"
      :actor-positions="actorPositions"
      :actors="actors"
      :features="features"
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
  addFeature,
  getActorsInfo,
  getActorsPosition,
  getFeatures,
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
    const features = ref({});
    return {
      user,
      actors,
      actorPositions,
      features,
    };
  },
  async mounted() {
    this.user = await getUserInfo();
    getActorsInfo().subscribe((actors) => (this.actors = actors));
    getActorsPosition().subscribe(
      (positions) => (this.actorPositions = positions),
    );
    getFeatures().subscribe((features) => (this.features = features));
  },
  methods: {
    handleNewPosition: throttle(
      (value) => {
        updatePosition(value.cursor, value.viewport);
      },
      16,
      { leading: false },
    ),
    handleNewFeature: (feature) => {
      addFeature(feature);
    },
  },
};
</script>

<style></style>
