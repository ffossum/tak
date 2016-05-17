import {
  get,
  times,
} from 'lodash';

import {
  RANKS,
  WHITE,
 } from './constants';

export function getInitialState(size) {
  return {
    activeColor: WHITE,
    moveNumber: 1,
    board: createEmptyBoard(size),
  };
}

function createEmptyBoard(size) {
  return times(size, () => createEmptyRank(size));
}

function createEmptyRank(size) {
  return times(size, () => []);
}

export function getCoords(ptnMove) {
  const matches = ptnMove.match(/([a-h])([1-8])/);
  const rank = matches[2] - 1;
  const file = RANKS.indexOf(matches[1]);
  return [rank, file];
}

export function getSquare(board, position) {
  const coords = getCoords(position);
  return get(board, coords);
}
