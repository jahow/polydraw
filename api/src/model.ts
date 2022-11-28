import { Geometry } from 'geojson';

export type ActorId = string;
export interface ActorInfo {
  id: ActorId;
  name: string;
  color: string;
}
export interface ActorPosition {
  cursor: [number, number] | null; // null is when cursor is outside map
  viewport: [number, number, number, number];
}

export type FeatureId = string;
export interface FeatureInfo {
  id: FeatureId;
  version: number;
  properties: Record<string, string | number>;
  geometry: Geometry;
}
