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
