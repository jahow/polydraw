<template>
  <div class="flex flex-col h-full">
    <MainMap class="grow"></MainMap>
    <StatusBar class="shrink-0"></StatusBar>
  </div>
</template>

<script setup>
import MainMap from './components/MainMap';
import StatusBar from './components/StatusBar';
</script>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
