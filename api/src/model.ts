export type ActorId = string;
export interface ActorInfo {
  id: ActorId;
  name: string;
  color: string;
}
export type ActorPosition = [number, number] | null; // null is when cursor is outside map
