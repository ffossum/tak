import {
  map,
  flatMap,
  times,
  isEmpty,
} from 'lodash';

export function tpsToJson(tps) {
  const matches = tps.match(/\[TPS "(.*) (\d) (\d+)"\]/i);
  if (!matches) {
    throw new Error(`${tps} is not a valid TPS string`);
  }

  const activeColor = matches[2];
  const moveNumber = Number(matches[3]);

  const tpsBoard = matches[1];
  const board = boardFromTps(tpsBoard);

  return {
    activeColor,
    moveNumber,
    board,
  };
}

function boardFromTps(tpsBoard) {
  const tpsRanks = tpsBoard.split('/').reverse();
  return map(tpsRanks, rankFromTps);
}

function rankFromTps(tpsRank) {
  const tpsSquares = tpsRank.split(',');
  return flatMap(tpsSquares, squaresFromTps);
}

function squaresFromTps(tpsSquares) {
  const empty = tpsSquares.match(/x(\d)?/);
  if (empty) {
    const numberOfSquares = empty[1] || 1;
    return times(numberOfSquares, () => []);
  }
  return [tpsSquares.match(/\d\D?/g)];
}

export function jsonToTps(state) {
  let tpsBoard = tpsFromBoard(state.board);
  tpsBoard = tpsBoard.replace(/x(,x)+/g, match => (
    `x${Math.ceil(match.length / 2)}`
  ));
  return `[TPS "${tpsBoard} ${state.activeColor} ${state.moveNumber}"]`;
}

function tpsFromBoard(board) {
  return map(board, tpsFromRank).reverse().join('/');
}

function tpsFromRank(rank) {
  return map(rank, tpsFromSquare).join(',');
}

function tpsFromSquare(square) {
  return isEmpty(square) ? 'x' : square.join('');
}
