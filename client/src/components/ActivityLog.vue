<template>
  <div
    class="bg-white/[0.8] rounded-sm m-4 opacity-50 hover:opacity-100 w-[28%] min-w-[250px] max-h-[500px] transition-opacity flex flex-col"
  >
    <div
      class="p-2 pb-1 overflow-y-auto overflow-x-hidden text-gray-600"
      ref="container"
    >
      <ul class="flex flex-col">
        <li
          v-for="(log, index) in logs"
          :key="index"
          class="flex flex-row items-start"
        >
          <span class="font-mono leading-6 w-[95px] text-xs shrink-0">{{
            renderLogDate(log)
          }}</span>
          <span class="text-sm" v-html="renderLogItem(log)"></span>
        </li>
      </ul>
    </div>
    <input
      type="text"
      v-model="message"
      @keydown.enter="speak"
      class="self-stretch m-2 mt-0 text-sm bg-white rounded-sm border border-gray-400 focus:border-gray-800 p-1 leading-none"
    />
  </div>
</template>

<script>
import { ref, nextTick } from 'vue';
import {
  ActivityType,
  getActivityLog,
  speak,
} from '@/services/session.service';

export default {
  setup() {
    const logs = ref([
      { timestamp: Date.now(), args: ['Welcome to Polydraw!'] },
    ]);
    const message = '';
    return {
      logs,
      message,
    };
  },
  mounted() {
    getActivityLog().subscribe(async (log) => {
      this.logs = [...this.logs, log];
      const container = this.$refs['container'];
      await nextTick();
      container.scrollTo({ top: container.scrollHeight });
    });
  },
  methods: {
    renderLogItem(log) {
      let arg = log.args[0];
      function printActorName(actor) {
        return `<span style="color: ${actor.color}">${actor.name}</span>`;
      }
      switch (log.type) {
        case ActivityType.ACTOR_IN:
          return `${printActorName(arg)} has arrived.`;
        case ActivityType.ACTOR_OUT:
          return `${printActorName(arg)} left.`;
        case ActivityType.FEATURE_ADDED:
          return `A new <span class="text-black">${arg.geometry.type}</span> was added.`;
        case ActivityType.ACTOR_SPEAK:
          return `${printActorName(arg)} says "<span class="text-black">${
            log.args[1]
          }</span>"`;
        default:
          return arg;
      }
    },
    renderLogDate(log) {
      return new Date(log.timestamp).toLocaleTimeString();
    },
    speak() {
      if (!this.message) return;
      speak(this.message);
      this.message = '';
    },
  },
};
</script>

<style scoped></style>
