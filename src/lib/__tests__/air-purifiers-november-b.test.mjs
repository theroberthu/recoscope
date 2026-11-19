import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { airPurifiersNovemberBExplainer as video, airPurifiersNovemberExplainer, airPurifiersExplainer, snapshotVideo } from '../benchmark-video.mjs';
import { publicWatchVideos, videoSchema } from '../video-watch.mjs';

test('November19 Air Purifiers release matches approved media and only its exact snapshot', () => {
  const run = { id:191, category_slug:'air-purifiers', period_label:'2026-11-B', run_date:'2026-11-19' };
  assert.equal(snapshotVideo('air-purifiers',run),video);
  assert.ok(publicWatchVideos([run]).includes(video));
  assert.equal(snapshotVideo('air-purifiers',{id:180,period_label:'2026-11-A',run_date:'2026-11-12'}),airPurifiersNovemberExplainer);
  assert.equal(snapshotVideo('air-purifiers',{id:169,period_label:'2026-10-C',run_date:'2026-10-31'}),airPurifiersExplainer);
  for(const changed of [{id:180},{period_label:'2026-11-A'},{run_date:'2026-11-12'},{category_slug:'skincare'}]) {
    assert.ok(!publicWatchVideos([{...run,...changed}]).includes(video));
  }
  assert.equal(snapshotVideo('air-purifiers',run,{...video,approved:false}),null);
  const schema=videoSchema(video);
  assert.equal(schema.duration,'PT52.7S');
  assert.equal(schema.uploadDate,'2026-11-19T23:00:58.000Z');
  assert.match(video.summary[0],/Levoit appeared in 12\/12 usable answers and Coway in 11\/12/);
  assert.match(video.summary[0],/all four comparative answers ranked Coway first and Levoit second/);
  assert.equal(video.transcript.at(-1).text,'Explore benchmark at getrecoscope.com.');
  assert.equal(createHash('sha256').update(readFileSync(new URL('../../../public'+video.src,import.meta.url))).digest('hex'),video.approvedSha256);
  assert.equal(readFileSync(new URL('../../../public'+video.captions,import.meta.url),'utf8').match(/-->/g)?.length,19);
});
