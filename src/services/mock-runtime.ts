export function waitForMock(ms = 420) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function nowIso() {
  return new Date().toISOString();
}
