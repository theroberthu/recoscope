# Benchmark publication: homepage logos

Before publishing any new run, identify its most-mentioned brand(s), including
all ties. Combine these with every leader already displayed on the homepage.
Save the resulting exact brand names as a JSON array outside the repository.

Run `npm run check:logos -- --leaders /absolute/path/leaders.json` against the
release checkout. This is a required publication check: missing mappings,
missing files, invalid image content, or an empty leader list must be resolved
before making the new run public. Do not remove a tied leader or change benchmark
data to make the check pass.

For a missing mark, obtain an official brand image, save it under
`public/brand-marks/`, add its exact brand-name mapping to
`src/lib/home-brand-marks.json`, and record its official source in
`public/brand-marks/credits.json`. Deploy the assets before publishing the run.

After publication, run `npm run check:logos` to verify every leader on the live
homepage, including cards outside the initially visible part of the rail.
The command reads the public homepage and validates the corresponding local
assets; it never writes benchmark data. If the homepage is unavailable or does
not expose its leader list, it fails rather than silently passing.

Then check desktop and mobile in the browser: scroll through the entire rail,
confirm each image loads (`naturalWidth > 0`), inspect framing and contrast,
confirm there are no initials standing in for logos, and save proof. The browser
check is necessary because valid local files alone do not prove hosted image
delivery or lazy loading. Save both command output and browser results with the
run's publication evidence. Reuse existing analytics; staff QA is not organic
engagement.

## Homepage freshness after publication

Logo loading alone does not prove that a new snapshot reached the homepage.
The homepage uses a five-minute revalidation interval and can temporarily serve
the previous snapshot after a database publication. Do not report a release as
complete until a normal request to the canonical homepage (without a cache-busting
query string) and a browser check both show the expected new snapshot.

Check the featured latest benchmark and its exact dated report link, first
category-leader card (brand, date and mention fraction), newest category card
(finding, date and usable coverage), and benchmark directory. Preserve the
distinction between mention fraction and usable-answer coverage. If the cached
page is stale, allow expiry and background regeneration, then request it again.
If it stays stale after repeated regeneration windows, investigate the failed
refresh instead of declaring success. Save the canonical HTML, expected values,
and desktop/mobile proof alongside the release evidence. Do not modify benchmark
data to satisfy this check. Staff QA visits are not organic acquisition.
