import test from 'node:test';
import assert from 'node:assert/strict';
import {spreadChartLabels} from '../chart-layout.mjs';

test('tied endpoint labels remain distinct without moving the data', () => {
  const observations = [{brand:'A',y:24},{brand:'B',y:24},{brand:'C',y:45}];
  const labels = spreadChartLabels(observations,24,250);
  assert.deepEqual(labels.map(x=>x.labelY),[24,46,68]);
  assert.deepEqual(observations.map(x=>x.y),[24,24,45]);
  assert.ok(observations.every(x=>!('labelY' in x)));
});

test('bottom-edge ties stay inside the chart and preserve their order', () => {
  const labels = spreadChartLabels([{brand:'A',y:230},{brand:'B',y:250},{brand:'C',y:250}],24,250);
  assert.deepEqual(labels.map(x=>x.labelY),[206,228,250]);
  assert.deepEqual(labels.map(x=>x.brand),['A','B','C']);
});

test('empty and already-separated endpoints do not need adjustment', () => {
  assert.deepEqual(spreadChartLabels([],24,250),[]);
  assert.deepEqual(spreadChartLabels([{y:24},{y:120},{y:250}],24,250).map(x=>x.labelY),[24,120,250]);
});
