import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { officeChairsNovemberBExplainer as video, officeChairsExplainer, snapshotVideo } from '../benchmark-video.mjs';
import { publicWatchVideos, videoSchema } from '../video-watch.mjs';

test('November 15 Office Chairs release stays isolated from its prior snapshot and leads the video listing', () => {
  const run = { id: 183, category_slug: 'office-chairs', period_label: '2026-11-B', run_date: '2026-11-15' };
  const previous = { id: 173, category_slug: 'office-chairs', period_label: '2026-11-A', run_date: '2026-11-05' };
  assert.equal(snapshotVideo('office-chairs', run), video);
  assert.equal(snapshotVideo('office-chairs', previous), officeChairsExplainer);
  assert.equal(snapshotVideo('office-chairs', previous, video), null);
  assert.equal(snapshotVideo('office-chairs', { ...run, run_date: '2026-11-05' }, video), null);
  assert.equal(publicWatchVideos([previous, run])[0], video);
  assert.equal(videoSchema(video).duration, 'PT44.3S');
});

test('Office Chairs public media matches the owner-approved export and caption closing', () => {
  const bytes = readFileSync(new URL('../../../public' + video.src, import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), video.approvedSha256);
  const captions = readFileSync(new URL('../../../public' + video.captions, import.meta.url), 'utf8');
  assert.equal(captions.match(/-->/g).length, 17);
  assert.ok(captions.includes('Explore benchmark at getrecoscope.com.'));
  assert.ok(video.summary.join(' ').includes('Claude ranked Herman Miller first'));
  assert.ok(video.summary.join(' ').includes('not a controlled trend'));
});
