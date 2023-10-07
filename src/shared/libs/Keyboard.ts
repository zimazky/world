
const KEYBUFFER_SIZE = 256;
const keyDownBuffer = Array<number>(KEYBUFFER_SIZE).fill(0);
const keyPressBuffer = Array<number>(KEYBUFFER_SIZE).fill(0);

function onKeyDown(e: KeyboardEvent) {
  if(e.keyCode >= KEYBUFFER_SIZE) return;
  keyDownBuffer[e.keyCode] = 1;
  keyPressBuffer[e.keyCode] = 1;
  console.log(e.keyCode, e.code, keyPressBuffer);
  e.preventDefault();
}

function onKeyUp(e: KeyboardEvent) {
  if(e.keyCode >= KEYBUFFER_SIZE) return;
  keyDownBuffer[e.keyCode] = 0;
  e.preventDefault();
}

export function initKeyBuffer() {
  window.addEventListener('keydown', onKeyDown, false);
  window.addEventListener('keyup', onKeyUp, false);
}

export function isKeyPress(k: number) {
  const s = keyPressBuffer[k];
  keyPressBuffer[k] = 0;
  return s;
}

export function isKeyDown(k: number) {
  return keyDownBuffer[k];
}
