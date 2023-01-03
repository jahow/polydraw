import { BehaviorSubject, ReplaySubject } from 'rxjs';

const eventSource = new EventSource('/api/draw');

/**
 * @type {Promise<Object>}
 */
const userInfo = new Promise((resolve, reject) => {
  eventSource.addEventListener('sessionStart', ({ data }) => {
    const message = JSON.parse(data);
    resolve(message.me);
  });
  eventSource.onerror = (e) => {
    reject(e);
  };
});

export function getUserInfo() {
  return userInfo;
}

/**
 * @enum {number} ActivityType
 */
export const ActivityType = {
  ACTOR_IN: 1,
  ACTOR_OUT: 2,
  ACTOR_MESSAGE: 3,
  FEATURE_ADDED: 4,
  FEATURE_CHANGED: 5,
  FEATURE_REMOVED: 6,
};

/**
 * @type {BehaviorSubject<Object.<string, { name: string, color: string }>>}
 */
const actorsInfo$ = new BehaviorSubject({});
/**
 * @type {BehaviorSubject<Object.<string, { cursor: [number, number] | null, viewport: [number, number, number, number] }>>}
 */
const actorsPosition$ = new BehaviorSubject({});
/**
 * @type {BehaviorSubject<{id: string, properties: Object, geometry: Object}[]>}
 */
const features$ = new BehaviorSubject([]);
/**
 * @type {ReplaySubject<{type: ActivityType, timestamp: number, args: any[]}>}
 */
const activity$ = new ReplaySubject();

activity$.subscribe(console.log);

eventSource.addEventListener('sessionStart', ({ data }) => {
  const message = JSON.parse(data);
  actorsInfo$.next(message.others);

  // emit position of all actors as null, waiting for session updates to have actual positions
  const emptyPositions = { ...message.others };
  for (const id in emptyPositions) {
    emptyPositions[id] = { cursor: null, viewport: [0, 0, 0, 0] };
  }
  actorsPosition$.next(emptyPositions);

  features$.next(message.features);
});
eventSource.addEventListener('actorsUpdate', ({ data }) => {
  const message = JSON.parse(data);
  const newInfos = { ...actorsInfo$.value };
  const newPositions = { ...actorsPosition$.value };

  // actors getting in
  if (message.infos?.in) {
    Object.keys(message.infos.in).forEach((id) => {
      newInfos[id] = message.infos.in[id];

      activity$.next({
        type: ActivityType.ACTOR_IN,
        timestamp: Date.now(),
        args: [message.infos.in[id]],
      });
    });
  }
  // actors getting out
  if (message.infos?.out) {
    Object.keys(message.infos.out).forEach((id) => {
      delete newInfos[id];

      activity$.next({
        type: ActivityType.ACTOR_OUT,
        timestamp: Date.now(),
        args: [message.infos.out[id]],
      });
    });
  }
  if (message.infos) {
    actorsInfo$.next(newInfos);
  }

  // update positions
  if (message.positions) {
    Object.keys(message.positions).forEach((id) => {
      newPositions[id] = message.positions[id];
    });
    actorsPosition$.next(newPositions);
  }
});
eventSource.addEventListener('featuresUpdate', ({ data }) => {
  const message = JSON.parse(data);
  // TODO: this only handles feature addition!
  const newFeatures = [...features$.value, ...message.features];
  message.features.forEach((feature) =>
    activity$.next({
      type: ActivityType.FEATURE_ADDED,
      timestamp: Date.now(),
      args: [feature],
    }),
  );
  features$.next(newFeatures);
});

export function getActorsInfo() {
  return actorsInfo$;
}

export function getActorsPosition() {
  return actorsPosition$;
}

export function getFeatures() {
  return features$;
}

export function getActivityLog() {
  return activity$;
}

/**
 * @param {[number, number] | null} cursor
 * @param {[number, number, number, number]} viewport
 */
export function updatePosition(cursor, viewport) {
  userInfo.then((user) => {
    fetch('/api/move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: user.id, position: { cursor, viewport } }),
    });
  });
}

/**
 *
 * @param {{id: string, properties: Object, geometry: Object}} feature
 */
export function addFeature(feature) {
  fetch('/api/feature', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(feature),
  });
}
