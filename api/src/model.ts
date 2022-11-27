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
