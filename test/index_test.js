/* eslint max-len: 0 */

import { expect } from 'chai';

import {
  getInitialState,
  getState,
  tpsToJson,
  jsonToTps,
} from '../lib/index';

import { BLACK, WHITE } from '../lib/constants';
import { getSquare } from '../lib/util';

describe('TPS', () => {
  describe('initialState', () => {
    it('converts 3x3 from JSON to TPS', () => {
      const initialState = getInitialState(3);
      expect(jsonToTps(initialState)).to.equal('[TPS "x3/x3/x3 1 1"]');
    });
    it('converts 4x4 from JSON to TPS', () => {
      const initialState = getInitialState(4);
      expect(jsonToTps(initialState)).to.equal('[TPS "x4/x4/x4/x4 1 1"]');
    });
    it('converts 5x5 from JSON to TPS', () => {
      const initialState = getInitialState(5);
      expect(jsonToTps(initialState)).to.equal('[TPS "x5/x5/x5/x5/x5 1 1"]');
    });
    it('converts 6x6 from JSON to TPS', () => {
      const initialState = getInitialState(6);
      expect(jsonToTps(initialState)).to.equal('[TPS "x6/x6/x6/x6/x6/x6 1 1"]');
    });
    it('converts 7x7 from JSON to TPS', () => {
      const initialState = getInitialState(7);
      expect(jsonToTps(initialState)).to.equal('[TPS "x7/x7/x7/x7/x7/x7/x7 1 1"]');
    });
    it('converts 8x8 from JSON to TPS', () => {
      const initialState = getInitialState(8);
      expect(jsonToTps(initialState)).to.equal('[TPS "x8/x8/x8/x8/x8/x8/x8/x8 1 1"]');
    });

    it('converts 3x3 from TPS to JSON', () => {
      const tps = '[TPS "x3/x3/x3 1 1"]';
      expect(tpsToJson(tps)).to.deep.equal(getInitialState(3));
    });
    it('converts 4x4 from TPS to JSON', () => {
      const tps = '[TPS "x4/x4/x4/x4 1 1"]';
      expect(tpsToJson(tps)).to.deep.equal(getInitialState(4));
    });
    it('converts 5x5 from TPS to JSON', () => {
      const tps = '[TPS "x5/x5/x5/x5/x5 1 1"]';
      expect(tpsToJson(tps)).to.deep.equal(getInitialState(5));
    });
    it('converts 6x6 from TPS to JSON', () => {
      const tps = '[TPS "x6/x6/x6/x6/x6/x6 1 1"]';
      expect(tpsToJson(tps)).to.deep.equal(getInitialState(6));
    });
    it('converts 7x7 from TPS to JSON', () => {
      const tps = '[TPS "x7/x7/x7/x7/x7/x7/x7 1 1"]';
      expect(tpsToJson(tps)).to.deep.equal(getInitialState(7));
    });
    it('converts 8x8 from TPS to JSON', () => {
      const tps = '[TPS "x8/x8/x8/x8/x8/x8/x8/x8 1 1"]';
      expect(tpsToJson(tps)).to.deep.equal(getInitialState(8));
    });
  });

  it('converts complex TPS to JSON and back to TPS', () => {
    const tps = '[TPS "x3,12,2S/x,22S,22C,11,21/121,212,12,1121C,1212S/21S,1,21,211S,12S/x,21S,2,x2 1 26"]';
    expect(jsonToTps(tpsToJson(tps))).to.equal(tps);
  });
});

describe('PTN', () => {
  const initialState = getInitialState(5);
  describe('first move', () => {
    it('white places a black stone', () => {
      const state = getState(initialState, 'a1');
      expect(getSquare(state.board, 'a1')).to.deep.equal([BLACK]);
    });

    it('then black places a white stone', () => {
      let state = getState(initialState, 'a1');
      state = getState(state, 'e5');

      expect(getSquare(state.board, 'e5')).to.deep.equal([WHITE]);
      expect(state.activeColor).to.equal(WHITE);
      expect(state.moveNumber).to.equal(2);
    });
  });
  describe('second move', () => {
    const state = getState(initialState, ['a1', 'e5', 'c3']);

    it('white places their own stone', () => {
      expect(getSquare(state.board, 'c3')).to.deep.equal([WHITE]);
      expect(state.activeColor).to.equal(BLACK);
    });
  });

  it('builds new state from list of moves', () => {
    let state = tpsToJson('[TPS "x5/x3,2112S,x/x5/x,1221,x3/x5 1 1"]');
    state = getState(state, [
      'a3', 'c2',
      'c2>', 'a3+',
      'd2+', 'a4>',
      'd3-', 'b4-',
      'd2<', 'Cc5?',
      'c2+', "b3>'",
      'a5', '2c3-2!',
    ]);

    expect(jsonToTps(state)).to.equal('[TPS "1,x,2C,x2/x3,2112S,x/x5/x,1221,12,x2/x5 1 8"]');
  });
});
