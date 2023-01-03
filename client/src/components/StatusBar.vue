<template>
  <div class="bg-white p-1">
    <div class="flex flex-row items-center px-5 pb-0 py-3">
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
    <div class="w-full text-center text-sm text-gray-500">
      <span class="text-gray-900">Polydraw</span> is made by
      <a
        href="https://www.camptocamp.com/"
        target="_blank"
        class="text-gray-900 underline hover:text-black"
        >Camptocamp</a
      >
      - take a look at my
      <a
        href="https://github.com/jahow/polydraw"
        target="_blank"
        class="text-gray-900 underline hover:text-black"
        >source code</a
      >!
    </div>
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
