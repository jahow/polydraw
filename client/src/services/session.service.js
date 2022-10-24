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
 * @param {[number, number] | null} coords
 */
export function updatePosition(coords) {
  fetch('/api/move', {
    method: 'POST',
    body: coords,
  });
}
