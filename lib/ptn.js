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

import { getCoords, getInitialState } from './util';
import { tpsToJson } from './tps';
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

export function ptnToJson(ptn) {
  const initialState = ptnToInitialState(ptn);
  const tags = ptnToTags(ptn);
  const moves = ptnToMoves(ptn);

  return {
    initialState,
    tags,
    moves,
  };
}

function ptnToInitialState(ptn) {
  const tps = ptn.match(/^\[TPS .*?\]/im);
  if (!tps) {
    let size = ptn.match(/^\[Size "(\d*?)"\]/im);
    if (!size) {
      throw Error('Unable to determine board size. The PTN must include TPS and/or Size.');
    }
    size = Number(size[1]);
    return getInitialState(size);
  }

  return tpsToJson(tps[0]);
}

function ptnToTags(ptn) {
  const tags = {};
  const tagsRegex = /^\[(?!.*TPS )(\S+)\s"(.*?)"]/gm;
  let nextTag = tagsRegex.exec(ptn);
  while (nextTag) {
    const [, key, value] = nextTag;
    tags[key] = value;
    nextTag = tagsRegex.exec(ptn);
  }
  return tags;
}

function ptnToMoves(ptn) {
  const moves = {};

  const movesRegex = /(\d+)\.\s+([\w<>+-]+)\s+(?:{(.*?)})?\s*([\w<>+-]+)\s*(?:{(.*?)})?/gm;
  let nextMoves = movesRegex.exec(ptn);
  while (nextMoves) {
    const [, moveNumber, firstMove, firstComment, secondMove, secondComment] = nextMoves;

    const moveEntries = [createMoveEntry(firstMove, firstComment)];
    if (secondMove) {
      moveEntries.push(createMoveEntry(secondMove, secondComment));
    }
    moves[moveNumber] = moveEntries;

    nextMoves = movesRegex.exec(ptn);
  }

  return moves;
}

function createMoveEntry(move, comment) {
  if (!comment) {
    return move;
  }

  return {
    move,
    comment: comment.trim(),
  };
}
