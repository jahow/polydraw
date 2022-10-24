<template>
  <div class="flex flex-col p-4 gap-4">
    <div
      v-for="actor in actors"
      :key="actor.id"
      class="rounded-full bg-white shadow p-4"
    >
      {{ actor.name }}
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
