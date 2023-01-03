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
import { fromLonLat, toLonLat, transformExtent } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromExtent } from 'ol/geom/Polygon';
import GeometryCollection from 'ol/geom/GeometryCollection';
import { Circle, Fill, Stroke, Style } from 'ol/style';
import DrawInteraction from 'ol/interaction/Draw';
import Collection from 'ol/Collection';
import GeoJSON from 'ol/format/GeoJSON';
import { getActorsInfo, getActorsPosition } from '@/services/session.service';

const createActorPositionStyle = (actor) =>
  new Style({
    image: new Circle({
      stroke: new Stroke({ color: 'white', width: 2 }),
      fill: new Fill({ color: actor.color }),
      radius: 7,
    }),
    stroke: new Stroke({
      color: actor.color,
      lineDash: [4, 4],
      width: 1,
    }),
  });

const styles = {};
const defaultStyle = createActorPositionStyle({ color: 'grey' });

const dataStyle = new Style({
  fill: new Fill({ color: 'rgba(255, 255, 255, 0.3)' }),
  stroke: new Stroke({ width: 3, color: 'grey' }),
});

const geojson = new GeoJSON({
  dataProjection: 'EPSG:4326',
  featureProjection: 'EPSG:3857',
});

export default {
  props: {
    features: Array,
    user: Object,
  },
  emits: ['newPosition', 'newFeature'],
  setup() {
    /** @type {Map} */
    const olMap = ref(null);

    /** @type {VectorLayer<VectorSource>} */
    const actorsLayer = ref(null);

    /** @type {VectorLayer<VectorSource>} */
    const vectorLayer = ref(null);

    const actors = ref({});
    const actorPositions = ref({});
    return {
      actors,
      actorPositions,
      olMap,
      actorsLayer,
      vectorLayer,
    };
  },
  mounted() {
    this.actorsLayer = new VectorLayer({
      source: new VectorSource({
        features: [],
      }),
      style: (feature) => {
        if (styles[feature.getId()]) return styles[feature.getId()];
        else if (this.actors?.[feature.getId()]) {
          styles[feature.getId()] = createActorPositionStyle(
            this.actors?.[feature.getId()],
          );
          return styles[feature.getId()];
        }
        return defaultStyle;
      },
    });
    this.vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: [],
      }),
      style: (feature) => {
        dataStyle.getStroke().setColor(feature.get('color') || 'grey');
        return dataStyle;
      },
    });
    const view = new View({
      zoom: 0,
      center: [0, 0],
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
        this.actorsLayer,
      ],
      view,
    });
    let cursor;
    let viewport = transformExtent(
      view.calculateExtent(),
      'EPSG:3857',
      'EPSG:4326',
    );
    this.olMap.on('pointermove', (event) => {
      const coords = this.olMap.getCoordinateFromPixel(event.pixel);
      cursor = toLonLat(coords);
      this.$emit('newPosition', { cursor, viewport });
    });
    view.on(['change:center', 'change:resolution'], () => {
      viewport = transformExtent(
        view.calculateExtent(),
        'EPSG:3857',
        'EPSG:4326',
      );
      this.$emit('newPosition', { cursor, viewport });
    });

    const drawFeatures = new Collection();
    const draw = new DrawInteraction({
      type: 'Polygon',
      features: drawFeatures,
    });
    draw.on('drawend', (event) => {
      const olFeature = event.feature;
      const feature = {
        id: Math.floor(Math.random() * 1000000),
        properties: {
          color: this.user.color,
        },
        geometry: geojson.writeGeometryObject(olFeature.getGeometry()),
      };
      this.$emit('newFeature', feature);
      drawFeatures.clear();
    });
    this.olMap.addInteraction(draw);

    getActorsInfo().subscribe((actors) => (this.actors = actors));
    getActorsPosition().subscribe(
      (positions) => (this.actorPositions = positions),
    );
  },
  watch: {
    actorPositions(value) {
      const source = this.actorsLayer.getSource();
      const positions = Object.keys(value).map((actorId) => {
        const cursor = value[actorId].cursor;
        const viewport = value[actorId].viewport;
        const geometries = [];
        if (cursor !== null) {
          geometries.push(new Point(fromLonLat(cursor)));
        }
        if (viewport !== null) {
          geometries.push(
            fromExtent(transformExtent(viewport, 'EPSG:4326', 'EPSG:3857')),
          );
        }
        const feature = new Feature({
          geometry: new GeometryCollection(geometries),
        });
        feature.setId(actorId);
        return feature;
      });
      source.clear();
      source.addFeatures(positions);
    },
    features(value) {
      this.vectorLayer.getSource().clear();
      const features = value.map(
        (featureInfo) =>
          new Feature({
            ...featureInfo.properties,
            geometry: geojson.readGeometry(featureInfo.geometry),
          }),
      );
      this.vectorLayer.getSource().addFeatures(features);
    },
  },
  methods: {},
};
</script>

<style scoped></style>
