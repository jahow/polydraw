<template>
  <div class="bg-white flex flex-row items-center p-4">
    <div class="grow">
      You are currently
      <span class="font-bold" :style="{ color: user.color }">{{
        user.name
      }}</span
      >.
    </div>
    <a
      class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
      target="_blank"
      download
      href="/api/data.json"
      >Download data as GeoJSON</a
    >
  </div>
</template>

<script>
export default {
  props: {
    user: Object,
  },
};
</script>

<style scoped></style>
