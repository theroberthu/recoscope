# Homepage journey measurement

Released measurement version: `journey_v1`. Existing GA4 property: RecoScope530408270, tag G-NWNHPKNGBB. No new analytics vendor. Production measurement is limited to www.getrecoscope.com; local and preview hosts do not load the Google tag.

## Visitor populations

Open `https://www.getrecoscope.com/?rs_traffic=staff` on each staff browser/profile. Use `?rs_traffic=qa` for release checks, then return to staff mode. `?rs_traffic=visitor` clears the staff/test classification for that browser. The first-party preference lasts one year and labels the first Google event before tag configuration. QA also enables GA4 DebugView. These are self-declared labels, not authenticated identities. Other devices and browsers need their own marker. Old unknown visits cannot be reclassified retrospectively.

Filter journey reports by hostname exactly `www.getrecoscope.com`, Audience type exactly `visitor`, and Measurement version exactly `journey_v1`. Keep staff/QA separately available for diagnostics. Do not activate destructive GA4 exclusion filters. Missing audience labels are historical/unclassified, not confirmed visitors. No special label or reporting dimension proves someone belongs to the ICP.

## Events and dimensions

Existing event names are preserved. `source` is no longer sent as a UI event parameter: legacy UI source labels become `ui_element` to avoid mixing UI navigation with acquisition attribution. Historical attribution contamination remains a limitation.

- `journey_page_view`: one per sanitized route in the mounted journey tracker; use Destination path `/` as the homepage entry step. This supplements existing automatic page views, it is not an extra `page_view`.
- `homepage_section_view`: section visible for one continuous second, with at least half its height or200 pixels visible, once per mounted homepage. Sections: hero,example,deliverables,process,brand_leaders,categories,final_audit,author. This is exposure, not proof of reading.
- `audit_cta_click`: UI element distinguishes `home_hero_audit`, `home_final_audit`, `nav_audit`. Other audit links retain a distinct stable context.
- `benchmark_browse_click`: `home_example_anchor`, `home_explained_report`, `home_final_example` distinguish different choices.
- `benchmark_category_open`: `home_feature_report` and `home_feature_video` distinguish report and video destinations.
- `video_start`/`video_complete`: existing events retain video_id and carry audience/version labels. Repeats and autoplay on external platforms are not unique interested prospects.
- `audit_form_start`, `audit_form_validation`, `audit_form_error`, `audit_form_duplicate`, `audit_form_submit`: retain the audit entry element. Submit fires only after the API confirms a newly persisted request. Duplicate requests are separate, not a second submission.

GA4 event-scoped custom definitions: Audience type(`audience_type`), UI element(`ui_element`), Destination path(`destination_path`), Homepage section(`section_id`), Measurement version(`measurement_version`). Custom dimension reporting can take24–48hours; use DebugView for delivery verification. Existing standard date,device and session acquisition dimensions remain in use.

## Audit request evidence

The additive migration must run before the API deployment. `audit_leads.measurement_context` keeps an allowlisted landing path, audit entry path/element, referrer hostname, permitted campaign labels, version and audience. No arbitrary query strings, personal form values or analytics identifiers are included. Session context expires after30minutes inactivity; blocked browser storage degrades to unavailable context without blocking the form.

`review_status` starts `unreviewed`; QA and preview requests start `test` and suppress notification emails. `verified_non_test` must be set only following explicit evidence review, with `reviewed_at`. `spam` is separate. Staff visitor markers do not establish a qualified request. Do not auto-promote submissions to leads. The October21 documented QA requests remain unverified historical data and are excluded from verified demand.

## Funnel and decision rule

Use a closed, ordered, same-session funnel: homepage `journey_page_view` with Destination path `/` → `audit_cta_click` → `audit_form_start` → `audit_form_submit`. Allow intervening events. Compare device and session source/medium; separately inspect which example/video paths appear before the CTA. A second diagnostic funnel may add section_id `example`, but it is not required for a direct-to-audit visitor.

The primary business outcome is verified non-test audit demand, reconciled to stored requests. Never calculate an ordered funnel by dividing unrelated aggregate event counts. If the GA4 interface cannot constrain the steps to the same session, label its user funnel accordingly and use it as diagnostic context, not session conversion.

Keep the design stable for the first complete7-day observation and then the first28-day observation, both starting the day after launch. Apply the existing3-day processing lag. Save absolute eligible sessions/users and unique recorded requests alongside rates; annotate concurrent category/video releases, acquisition mix and remaining unmarked staff visits. Small samples do not establish causation. Do not compare new placement-specific events with historical events that grouped placements.
