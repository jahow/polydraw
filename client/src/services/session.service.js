import { BehaviorSubject } from 'rxjs';

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
 * @type {BehaviorSubject<Object.<string, { name: string, color: string }>>}
 */
const actorsInfo$ = new BehaviorSubject({});
/**
 * @type {BehaviorSubject<Object.<string, { cursor: [number, number] | null, viewport: [number, number, number, number] }>>}
 */
const actorsPosition$ = new BehaviorSubject({});

eventSource.addEventListener('sessionStart', ({ data }) => {
  const message = JSON.parse(data);
  actorsInfo$.next(message.others);

  // emit position of all actors as null, waiting for session updates to have actual positions
  const emptyPositions = { ...message.others };
  for (const id in emptyPositions) {
    emptyPositions[id] = { cursor: null, viewport: [0, 0, 0, 0] };
  }
  actorsPosition$.next(emptyPositions);
});
eventSource.addEventListener('sessionUpdate', ({ data }) => {
  const message = JSON.parse(data);
  const newInfos = { ...actorsInfo$.value };
  const newPositions = { ...actorsPosition$.value };

  // actors getting in
  if (message.sessions?.in) {
    Object.keys(message.sessions.in).forEach((id) => {
      newInfos[id] = message.sessions.in[id];
    });
  }
  // actors getting out
  if (message.sessions?.out) {
    Object.keys(message.sessions.out).forEach((id) => {
      delete newInfos[id];
    });
  }
  if (message.sessions) {
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

export function getActorsInfo() {
  return actorsInfo$;
}

export function getActorsPosition() {
  return actorsPosition$;
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
