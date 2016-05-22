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
  last,
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
    update(board, toCoords, existingStones => {
      const bottomStones = dropRight(existingStones, 1);
      let topStone = last(existingStones);

      if (isCapstone(first(droppedStones)) && isStanding(topStone)) {
        topStone = flatten(topStone);
      }

      if (topStone) {
        bottomStones.push(topStone);
      }

      return [...bottomStones, ...droppedStones];
    });
    moveStones(board, drop(stones, dropCount), drop(dropCounts), toCoords, direction);
  }
}

function isCapstone(stone) {
  return stone === '1C' || stone === '2C';
}

function isStanding(stone) {
  return stone === '1S' || stone === '2S';
}

function flatten(standingStone) {
  return standingStone.replace('S', '');
}

function getDropCounts(ptnMove) {
  const movingStones = ptnMove.match(/^\d*/)[0] || '1';
  return (ptnMove.match(/[<>+-](\d*)/)[1] || movingStones).split('').map(Number);
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
  const { moves, comments } = ptnToMovesAndComments(ptn);

  return {
    initialState,
    tags,
    moves,
    comments,
  };
}

function ptnToInitialState(ptn) {
  const tps = ptn.match(/^\[TPS .*?\]/im);
  if (!tps) {
    let boardSize = ptn.match(/^\[Size "(\d*?)"\]/im);
    if (!boardSize) {
      throw Error('Unable to determine board size. The PTN must include TPS and/or Size.');
    }
    boardSize = Number(boardSize[1]);
    return getInitialState(boardSize);
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

function ptnToMovesAndComments(ptn) {
  const moves = {};
  const comments = {};

  const movesRegex = /(\d+)\.+\s*([\w<>+-]+)\s+(?:{(.*?)})?\s*([\w<>+-]+)\s*(?:{(.*?)})?/gm;
  let nextMoves = movesRegex.exec(ptn);
  while (nextMoves) {
    const [, moveNumber, firstMove, firstComment, secondMove, secondComment] = nextMoves;
    const firstKey = `${moveNumber} 1`;
    const secondKey = `${moveNumber} 2`;

    if (secondMove) {
      moves[firstKey] = firstMove;
      if (firstComment) {
        comments[firstKey] = firstComment;
      }

      moves[secondKey] = secondMove;
      if (secondComment) {
        comments[secondKey] = secondComment;
      }
    } else {
      moves[secondKey] = firstMove;
      if (firstComment) {
        comments[secondKey] = firstComment;
      }
    }

    nextMoves = movesRegex.exec(ptn);
  }

  return { moves, comments };
}
