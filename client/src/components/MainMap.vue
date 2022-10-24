<template>
  <div ref="map-root" class="w-full h-full"></div>
</template>

<script>
import 'ol/ol.css';
import View from 'ol/View';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import { ref } from 'vue';
import { fromLonLat, toLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';

export default {
  props: {
    actorPositions: Object,
  },
  emits: ['cursorMove'],
  setup() {
    /** @type {Map} */
    const olMap = ref(null);

    /** @type {VectorLayer<VectorSource>} */
    const vectorLayer = ref(null);

    return {
      olMap,
      vectorLayer,
    };
  },
  mounted() {
    this.vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: [],
      }),
    });
    this.olMap = new Map({
      target: this.$refs['map-root'],
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://{a-d}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
          }),
        }),
        this.vectorLayer,
      ],
      view: new View({
        zoom: 0,
        center: [0, 0],
      }),
    });
    this.olMap.on('pointermove', (event) => {
      const coords = this.olMap.getCoordinateFromPixel(event.pixel);
      this.$emit('cursorMove', toLonLat(coords));
    });
  },
  watch: {
    actorPositions(value) {
      const source = this.vectorLayer.getSource();
      const positions = Object.keys(value)
        .filter((actorId) => value[actorId] !== null)
        .map((actorId) => {
          return new Feature({
            geometry: new Point(fromLonLat(value[actorId])),
            id: actorId,
          });
        });
      source.clear();
      source.addFeatures(positions);
    },
  },
  methods: {},
};
</script>

<style scoped></style>
