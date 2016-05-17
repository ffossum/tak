import {
  cloneDeep,
  get,
  set,
  reduce,
  zipWith,
  drop,
  dropRight,
  take,
  takeRight,
  isEmpty,
  first,
  update,
  concat,
} from 'lodash';

import { getCoords } from './util';
import { BLACK, WHITE } from './constants';

export function getState(state, ptnMoves) {
  return reduce(concat(ptnMoves), nextState, state);
}

function nextState(state, ptnMove) {
  const newState = cloneDeep(state);
  const coords = getCoords(ptnMove);

  if (isPlacement(ptnMove)) {
    const type = ptnMove.match(/^[CS]?/)[0];
    set(newState.board, coords, [getPlacedColor(state) + type]);
  } else {
    const stones = get(newState.board, coords);
    const movingStoneCount = Number(ptnMove.match(/^\d*/)[0] || 1);
    const movingStones = takeRight(stones, movingStoneCount);
    const dropCounts = getDropCounts(ptnMove);
    const direction = getMovementDirection(ptnMove);

    liftStones(newState.board, movingStoneCount, coords);
    moveStones(newState.board, movingStones, dropCounts, coords, direction);
  }

  if (state.activeColor === BLACK) {
    newState.moveNumber++;
  }
  newState.activeColor = invertColor(newState.activeColor);
  return newState;
}

function liftStones(board, n, coords) {
  update(board, coords, stones => dropRight(stones, n));
}

function moveStones(board, stones, dropCounts, fromCoords, direction) {
  if (!isEmpty(dropCounts)) {
    const dropCount = first(dropCounts);
    const droppedStones = take(stones, dropCount);
    const toCoords = getNextCoords(fromCoords, direction);

    update(board, toCoords, existingStones => [...existingStones, ...droppedStones]);
    moveStones(board, drop(stones, dropCount), drop(dropCounts), toCoords, direction);
  }
}

function getDropCounts(ptnMove) {
  return (ptnMove.match(/[<>+-](\d*)/)[1] || '1').split('').map(Number);
}

function getPlacedColor(state) {
  if (state.moveNumber === 1) {
    return invertColor(state.activeColor);
  }

  return state.activeColor;
}

function invertColor(color) {
  switch (color) {
    case WHITE: return BLACK;
    case BLACK: return WHITE;
    default: return null;
  }
}

function getNextCoords(coords, direction) {
  return zipWith(coords, direction, (a, b) => a + b);
}

function isPlacement(ptnMove) {
  return !isMovement(ptnMove);
}

function isMovement(ptnMove) {
  return /[<>+-]/.test(ptnMove);
}

const NORTH = [1, 0];
const SOUTH = [-1, 0];
const WEST = [0, -1];
const EAST = [0, 1];

function getMovementDirection(ptnMove) {
  const direction = ptnMove.match(/[<>+-]/)[0];
  switch (direction) {
    case '+': return NORTH;
    case '-': return SOUTH;
    case '<': return WEST;
    case '>': return EAST;
    default: return [0, 0];
  }
}
