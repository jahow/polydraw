<template>
  <div ref="map-root" class="w-full h-full"></div>
</template>

<script>
import View from 'ol/View';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import 'ol/ol.css';
import XYZ from 'ol/source/XYZ';

import { ref } from 'vue';

export default {
  setup() {
    /** @type {Map} */
    const olMap = ref(null);

    /** @type {VectorLayer} */
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
      const hovered = this.olMap.forEachFeatureAtPixel(
        event.pixel,
        (feature) => feature,
      );
      if (hovered !== this.selectedFeature) {
        this.$set(this, 'selectedFeature', hovered);
      }
    });
  },
  watch: {
    geojson(value) {
      this.updateSource(value);
    },
    selectedFeature(value) {
      this.$emit('select', value);
    },
  },
  methods: {
    updateSource(geojson) {
      const view = this.olMap.getView();
      const source = this.vectorLayer.getSource();
      const features = new GeoJSON({
        featureProjection: 'EPSG:3857',
      }).readFeatures(geojson);
      source.clear();
      source.addFeatures(features);
      view.fit(source.getExtent());
    },
  },
};
</script>

<style scoped></style>
