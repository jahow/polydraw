import { Injectable } from '@nestjs/common';
import { ActorId, ActorInfo, ActorPosition } from './model';
import {
  animationFrameScheduler,
  filter,
  interval,
  map,
  Observable,
  pairwise,
} from 'rxjs';

type ActorsSessionState = { [id: ActorId]: ActorInfo };
type ActorsPositionState = { [id: ActorId]: ActorPosition };

export type PositionsUpdate = { [id: ActorId]: ActorPosition };
export type SessionsUpdate = {
  in: { [id: ActorId]: ActorInfo };
  out: { [id: ActorId]: ActorInfo };
};

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  sessions: ActorsSessionState = {};
  positions: ActorsPositionState = {};

  newSession(): ActorInfo {
    const id = Math.floor(Math.random() * 1000000).toString();
    const actor: ActorInfo = {
      id,
      color: 'orange',
      name: 'Bob',
    };
    this.sessions[id] = actor;
    return actor;
  }

  getOtherSessions(forId: ActorId): ActorInfo[] {
    return Object.keys(this.sessions)
      .filter((id) => id !== forId)
      .map((id) => this.sessions[id]);
  }

  updatePosition(id: ActorId, position: ActorPosition) {
    this.positions[id] = position;
  }

  getPositionsUpdates(forId: ActorId): Observable<PositionsUpdate> {
    return interval(100, animationFrameScheduler).pipe(
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

  getSessionsUpdates(forId: ActorId): Observable<SessionsUpdate> {
    return interval(100, animationFrameScheduler).pipe(
      map(() => ({ ...this.sessions })),
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
}
