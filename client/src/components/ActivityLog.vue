<template>
  <div
    class="bg-white rounded-sm m-4 p-2 opacity-50 hover:opacity-80 w-[350px] max-h-[500px] transition-opacity overflow-auto"
    ref="container"
  >
    <ul class="flex flex-col gap-1">
      <li
        v-for="(log, index) in logs"
        :key="index"
        class="flex flex-row items-start"
      >
        <span
          class="font-mono leading-6 text-gray-700 w-[90px] text-xs shrink-0"
          >{{ renderLogDate(log) }}</span
        >
        <span class="text-sm" v-html="renderLogItem(log)"></span>
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, nextTick } from 'vue';
import { ActivityType, getActivityLog } from '@/services/session.service';

export default {
  setup() {
    const logs = ref([
      { timestamp: Date.now(), args: ['Welcome to Polydraw!'] },
    ]);
    return {
      logs,
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
          return `A new <strong>${arg.geometry.type}</strong> was added.`;
        case ActivityType.ACTOR_MESSAGE:
          return `${printActorName(arg)} says "${log.args[1]}"`;
        default:
          return arg;
      }
    },
    renderLogDate(log) {
      return new Date(log.timestamp).toLocaleTimeString();
    },
  },
};
</script>

<style scoped></style>
