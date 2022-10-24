<template>
  <div class="bg-white flex flex-row items-center p-4">
    <div>
      You are currently
      <span class="font-bold" :style="{ color: user.color }">{{
        user.name
      }}</span
      >.
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
