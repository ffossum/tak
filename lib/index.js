import { getState } from './ptn';
import { jsonToTps, tpsToJson } from './tps';

export { getState, ptnToJson } from './ptn';
export { jsonToTps, tpsToJson } from './tps';
export { getInitialState } from './util';

export function getTps(tps, moves) {
  const state = getState(tpsToJson(tps), moves);
  return jsonToTps(state);
}
