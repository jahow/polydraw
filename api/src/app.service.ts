import { Injectable } from '@nestjs/common';
import {
  ActorId,
  ActorInfo,
  ActorPosition,
  FeatureInfo,
  FeatureId,
} from './model';
import {
  animationFrameScheduler,
  filter,
  interval,
  map,
  Observable,
  pairwise,
} from 'rxjs';
import {
  adjectives,
  animals,
  uniqueNamesGenerator,
} from 'unique-names-generator';
import * as chroma from 'chroma-js';
import { Feature, FeatureCollection } from 'geojson';

type ActorsInfoState = { [id: ActorId]: ActorInfo };
type ActorsPositionState = { [id: ActorId]: ActorPosition };
type FeaturesState = { [id: FeatureId]: FeatureInfo };

export type ActorPositionUpdate = { [id: ActorId]: ActorPosition };
export type ActorInfoUpdate = {
  in: { [id: ActorId]: ActorInfo };
  out: { [id: ActorId]: ActorInfo };
};
export type ActorsInfo = { [id: ActorId]: ActorInfo };
export type FeaturesList = FeatureInfo[];

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  infos: ActorsInfoState = {};
  positions: ActorsPositionState = {};
  features: FeaturesState = {};

  newSession(): ActorInfo {
    const id = Math.floor(Math.random() * 1000000).toString();
    const name = uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      separator: ' ',
    });
    const colors = chroma.brewer.Set1; // see https://colorbrewer2.org/#type=qualitative&scheme=Set1&n=9
    const color = colors[Math.floor(Math.random() * colors.length)];
    const actor: ActorInfo = {
      id,
      color,
      name,
    };
    this.infos[id] = actor;
    return actor;
  }

  closeSession(id: ActorId) {
    delete this.infos[id];
  }

  getOtherActorsInfo(forId: ActorId): ActorsInfo {
    return Object.keys(this.infos)
      .filter((id) => id !== forId)
      .reduce((prev, curr) => ({ ...prev, [curr]: this.infos[curr] }), {});
  }

  updatePosition(id: ActorId, position: ActorPosition) {
    this.positions[id] = position;
  }

  getActorsPositionUpdates(forId: ActorId): Observable<ActorPositionUpdate> {
    return interval(16, animationFrameScheduler).pipe(
      map(() => ({ ...this.positions })),
      pairwise(),
      map(([prevPositions, currPositions]) =>
        Object.keys(currPositions)
          .filter(
            (actorId) =>
              currPositions[actorId] !== prevPositions[actorId] &&
              actorId !== forId,
          )
          .reduce(
            (prev, curr) => ({ ...prev, [curr]: currPositions[curr] }),
            {},
          ),
      ),
      filter((positions) => Object.keys(positions).length > 0),
    );
  }

  getActorsInfoUpdates(forId: ActorId): Observable<ActorInfoUpdate> {
    return interval(16, animationFrameScheduler).pipe(
      map(() => ({ ...this.infos })),
      pairwise(),
      map(([prevSessions, currSessions]) => ({
        in: Object.keys(currSessions)
          .filter((actorId) => !(actorId in prevSessions) && actorId !== forId)
          .reduce(
            (prev, curr) => ({ ...prev, [curr]: currSessions[curr] }),
            {},
          ),
        out: Object.keys(prevSessions)
          .filter((actorId) => !(actorId in currSessions) && actorId !== forId)
          .reduce(
            (prev, curr) => ({ ...prev, [curr]: prevSessions[curr] }),
            {},
          ),
      })),
      filter(
        (sessions) =>
          Object.keys(sessions.in).length > 0 ||
          Object.keys(sessions.out).length > 0,
      ),
    );
  }

  addFeature(feature: FeatureInfo) {
    this.features[feature.id] = feature;
  }

  removeFeature(featureId: FeatureId) {
    delete this.features[featureId];
  }

  getAllFeatures(): FeaturesList {
    return Object.keys(this.features).map(
      (featureId) => this.features[featureId],
    );
  }

  getFeaturesUpdates(): Observable<FeaturesList> {
    return interval(16, animationFrameScheduler).pipe(
      map(() => ({ ...this.features })),
      pairwise(),
      map(([prevFeatures, currFeatures]) =>
        Object.keys(currFeatures)
          .filter((featureId) => !(featureId in prevFeatures))
          .map((featureId) => currFeatures[featureId]),
      ),
      filter((features) => features.length > 0),
    );
  }

  getFeatureCollection(): FeatureCollection {
    const features: Feature[] = Object.keys(this.features).map((featureId) => ({
      type: 'Feature',
      properties: this.features[featureId].properties,
      geometry: this.features[featureId].geometry,
    }));
    return {
      type: 'FeatureCollection',
      features,
    };
  }
}
