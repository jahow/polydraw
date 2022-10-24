<template>
  <div class="flex flex-col p-4 gap-4">
    <div
      v-for="actor in actors"
      :key="actor.id"
      class="rounded-full bg-white shadow p-2 flex flex-row items-center"
    >
      <span class="ml-2">{{ actor.name }}</span>
      <div
        class="ml-2 w-6 h-6 rounded-full"
        :style="{ background: actor.color }"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    actors: Object,
  },
};
</script>

<style scoped></style>
