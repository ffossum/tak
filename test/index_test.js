/* eslint max-len: 0 */
import {
  size,
  toArray,
} from 'lodash';
import { expect } from 'chai';

import {
  getInitialState,
  getState,
  tpsToJson,
  jsonToTps,
  ptnToJson,
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

  describe('moving capstone on stop of standing stone', () => {
    const state = tpsToJson('[TPS "1,2,x2/x4/x4/1C,2S,x2 1 3"]');
    it('flattens standing stone', () => {
      const newState = getState(state, 'a1>');
      expect(getSquare(newState.board, 'b1')).to.deep.equal(['2', '1C']);
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

  const ptn = `[Event "First Video for Tak Strategy"]
[Site "PlayTak.com"]
[Date "2015.11.15"]
[Round "1"]
[Player1 "BenWo"]
[Player2 "JT (Mongoose1021)"]
[Size "5"]
[Result "0-R"]

1. e5 {comment1} a1
2.  c3  d2 {comment2}
3.  e3  Cd3
4.  Cc2 {comment3} d4 {comment4}
5.  c2> Sc2
6.  Sd1 c4
7.  a4  b4
8.  a4> c4<
9.  c5  c4
10. c5- d4<
11. c3+ 2b4>
12. Sa4 c5
13. b1  d3<
14. 1d2< d5
15. Sb5 c3+
16. a4> a4
17. b5> a5
18. 2c5>11 b5
19. 2e5< 4c4+
20. 2b4> e5
21. 4d5> 1c5-
22. Sd5 3c4>12 0-R`;

  it('builds initial state from size', () => {
    const model = ptnToJson(ptn);
    expect(model.initialState).to.deep.equal(getInitialState(5));
  });

  it('parses comments', () => {
    const model = ptnToJson(ptn);
    expect(size(model.comments)).to.equal(4);
    expect(model.comments['1 1']).to.equal('comment1');
    expect(model.comments['2 2']).to.equal('comment2');
    expect(model.comments['4 1']).to.equal('comment3');
    expect(model.comments['4 2']).to.equal('comment4');
  });

  it('parses move list', () => {
    const model = ptnToJson(ptn);
    expect(size(model.moves)).to.equal(44);
  });

  it('parses tags', () => {
    const model = ptnToJson(ptn);
    expect(model.tags.Site).to.equal('PlayTak.com');
    expect(model.tags.Date).to.equal('2015.11.15');
    expect(model.tags.Round).to.equal('1');
  });

  it('gets correct final state', () => {
    const model = ptnToJson(ptn);
    const moves = toArray(model.moves);
    const finalState = getState(model.initialState, moves);

    const finalTps = jsonToTps(finalState);
    expect(finalTps).to.equal('[TPS "2,2,112,1S,22221S/2,x,212,2,12C/x4,1/x2,21C,2,x/1,1,x,1S,x 1 23"]');
  });
});
