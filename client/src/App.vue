<template>
  <div class="flex flex-col h-full">
    <div class="relative h-full">
      <MainMap
        class="grow"
        @new-position="handleNewPosition"
        @new-feature="handleNewFeature"
        :actor-positions="actorPositions"
        :actors="actors"
        :features="features"
        :user="user"
      ></MainMap>
      <CurrentActors class="absolute top-0 right-0"></CurrentActors>
      <ActivityLog class="absolute bottom-0 right-0"></ActivityLog>
    </div>
    <StatusBar class="shrink-0" :user="user"></StatusBar>
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
import ActivityLog from '@/components/ActivityLog.vue';

export default {
  components: {
    CurrentActors,
    MainMap,
    StatusBar,
    ActivityLog,
  },
  setup() {
    const user = ref({});
    const features = ref({});
    return {
      user,
      features,
    };
  },
  async mounted() {
    getFeatures().subscribe((features) => (this.features = features));
    this.user = await getUserInfo();
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
