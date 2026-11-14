import test from "node:test";
import assert from "node:assert/strict";
import { proteinExplainer, standingDesksExplainer, skincareExplainer, airPurifiersExplainer, sunscreenExplainer, espressoMachinesExplainer, dogFoodExplainer, officeChairsExplainer, runningShoesExplainer, robotVacuumsExplainer, benchmarkExplainers, snapshotVideo } from "../benchmark-video.mjs";
const run = { id: "166", period_label: "2026-10-B", run_date: "2026-10-27" };
const approved = {
  ...proteinExplainer,
  approved: true,
  approvedSha256: "a".repeat(64),
};

test("a review video or missing approved checksum cannot appear on the public benchmark", () => {
  assert.equal(
    Boolean(snapshotVideo("protein-powder", run)),
    proteinExplainer.approved &&
      /^[a-f0-9]{64}$/.test(proteinExplainer.approvedSha256 || ""),
  );
  assert.equal(
    snapshotVideo("protein-powder", run, { ...approved, approved: false }),
    null,
  );
  for (const approvedSha256 of [null, "", "review", "g".repeat(64)])
    assert.equal(
      snapshotVideo("protein-powder", run, { ...approved, approvedSha256 }),
      null,
    );
});
test("an approved explainer belongs only to the October 27 protein powder snapshot", () => {
  assert.deepEqual(snapshotVideo("protein-powder", run, approved), approved);
  assert.deepEqual(
    snapshotVideo(
      "protein-powder",
      { ...run, id: 166, run_date: new Date("2026-10-27T00:00:00Z") },
      approved,
    ),
    approved,
  );
  assert.equal(snapshotVideo("standing-desks", run, approved), null);
  for (const change of [
    { id: 167 },
    { period_label: "2026-11-A" },
    { run_date: "2026-10-26" },
    { run_date: "not-a-date" },
  ])
    assert.equal(
      snapshotVideo("protein-powder", { ...run, ...change }, approved),
      null,
    );
});

test("an enabled production video must have an actual MP4 matching its approval checksum", async () => {

  const { readFileSync } = await import("node:fs");
  const { createHash } = await import("node:crypto");
  for (const video of benchmarkExplainers.filter((v) => v.approved)) {
    const asset = readFileSync(new URL("../../../public" + video.src, import.meta.url));
    assert.equal(createHash("sha256").update(asset).digest("hex"), video.approvedSha256);
  }
});


test("registry selects the Standing Desks explainer only for run167 on October29", () => {
 const deskRun = { id: 167, period_label: "2026-10-B", run_date: "2026-10-29" };
 assert.equal(snapshotVideo("standing-desks", deskRun), standingDesksExplainer);
 assert.equal(snapshotVideo("protein-powder", run), proteinExplainer);
 for (const change of [{id:157},{period_label:"2026-10-A"},{run_date:"2026-10-13"}])
   assert.equal(snapshotVideo("standing-desks", {...deskRun,...change}), null);
 assert.equal(snapshotVideo("skincare",deskRun),null);
 assert.equal(snapshotVideo("standing-desks",run),null);
});


test("approved Skincare explainer belongs only to the October 30 snapshot", () => {
  const skincareRun = { id: 168, period_label: "2026-10-C", run_date: "2026-10-30" };
  assert.equal(snapshotVideo("skincare", skincareRun), skincareExplainer);
  assert.equal(snapshotVideo("skincare", skincareRun, { ...skincareExplainer, approved: false }), null);
  for (const change of [{ id: 158 }, { period_label: "2026-10-B" }, { run_date: "2026-10-16" }])
    assert.equal(snapshotVideo("skincare", { ...skincareRun, ...change }), null);
});


test("Approved Air Purifiers explainer is isolated to the October 31 snapshot", async () => {
  const airRun = { id: 169, period_label: "2026-10-C", run_date: "2026-10-31" };
  assert.equal(snapshotVideo("air-purifiers", airRun), airPurifiersExplainer);
  assert.equal(snapshotVideo("air-purifiers", airRun, { ...airPurifiersExplainer, approved: false }), null);
  const released = { ...airPurifiersExplainer, approved: true };
  assert.equal(snapshotVideo("air-purifiers", airRun, released), released);
  for (const change of [{ id: 159 }, { period_label: "2026-10-B" }, { run_date: "2026-10-17" }])
    assert.equal(snapshotVideo("air-purifiers", { ...airRun, ...change }, released), null);
  assert.equal(snapshotVideo("skincare", airRun, released), null);
  const { readFileSync } = await import("node:fs");
  const { createHash } = await import("node:crypto");
  const asset = readFileSync(new URL("../../../public" + released.src, import.meta.url));
  assert.equal(createHash("sha256").update(asset).digest("hex"), released.approvedSha256);
});


test("Approved Sunscreen explainer belongs only to the November 1 snapshot", async () => {
  const sunscreenRun = { id: 170, period_label: "2026-11-A", run_date: "2026-11-01" };
  assert.equal(snapshotVideo("sunscreen", sunscreenRun), sunscreenExplainer);
  assert.equal(snapshotVideo("sunscreen", sunscreenRun, { ...sunscreenExplainer, approved: false }), null);
  const released = { ...sunscreenExplainer, approved: true };
  assert.equal(snapshotVideo("sunscreen", sunscreenRun, released), released);
  for (const change of [{ id: 160 }, { period_label: "2026-10-B" }, { run_date: "2026-10-18" }])
    assert.equal(snapshotVideo("sunscreen", { ...sunscreenRun, ...change }, released), null);
  assert.equal(snapshotVideo("skincare", sunscreenRun, released), null);
  const { readFileSync } = await import("node:fs");
  const { createHash } = await import("node:crypto");
  const asset = readFileSync(new URL("../../../public" + released.src, import.meta.url));
  assert.equal(createHash("sha256").update(asset).digest("hex"), released.approvedSha256);
});


test("Espresso review stays private and any approved export belongs only to November 2 run 171", async () => {
  const espressoRun = { id: 171, period_label: "2026-11-A", run_date: "2026-11-02" };
  assert.equal(snapshotVideo("espresso-machines", espressoRun, { ...espressoMachinesExplainer, approved: false }), null);
  const released = { ...espressoMachinesExplainer, approved: true };
  assert.equal(snapshotVideo("espresso-machines", espressoRun, released), released);
  for (const change of [{ id: 170 }, { period_label: "2026-11-B" }, { run_date: "2026-11-01" }])
    assert.equal(snapshotVideo("espresso-machines", { ...espressoRun, ...change }, released), null);
  assert.equal(snapshotVideo("sunscreen", espressoRun, released), null);
  const { readFileSync } = await import("node:fs");
  const { createHash } = await import("node:crypto");
  const asset = readFileSync(new URL("../../../public" + released.src, import.meta.url));
  assert.equal(createHash("sha256").update(asset).digest("hex"), released.approvedSha256);
});

test("Dog Food review is gated and any approved export belongs only to November 4 run 172", () => {
  const dogRun = { id: 172, period_label: "2026-11-A", run_date: "2026-11-04" };
  assert.equal(snapshotVideo("dog-food", dogRun), dogFoodExplainer);
  const released = { ...dogFoodExplainer, approved: true, approvedSha256: "a".repeat(64) };
  assert.equal(snapshotVideo("dog-food", dogRun, released), released);
  for (const change of [{ id: 161 }, { period_label: "2026-10-B" }, { run_date: "2026-10-19" }])
    assert.equal(snapshotVideo("dog-food", { ...dogRun, ...change }, released), null);
  assert.equal(snapshotVideo("sunscreen", dogRun, released), null);
  assert.equal(snapshotVideo("dog-food", dogRun, { ...released, approved: false }), null);
  assert.equal(snapshotVideo("dog-food", dogRun, { ...released, approvedSha256: null }), null);
});

test("Dog Food publication retains the approved final MP4 and exact closing captions", async () => {
  const { readFileSync } = await import("node:fs");
  const { createHash } = await import("node:crypto");
  const asset = readFileSync(new URL("../../../public" + dogFoodExplainer.src, import.meta.url));
  assert.equal(createHash("sha256").update(asset).digest("hex"), "737578bddfb7ebea52b1560dfeb4b4c7ac9db96c92213cb9455edd77079c763b");
  const captions = readFileSync(new URL("../../../public" + dogFoodExplainer.captions, import.meta.url), "utf8");
  assert.equal(captions.match(/-->/g)?.length, 17);
  assert.ok(captions.includes("Explore benchmark at getrecoscope.com."));
  assert.equal(dogFoodExplainer.transcript.at(-1).text, "Explore benchmark at getrecoscope.com.");
});


test("Office Chairs approved explainer belongs only to November 5 run173", () => {
  const officeRun = { id: 173, period_label: "2026-11-A", run_date: "2026-11-05" };
  assert.equal(snapshotVideo("office-chairs", officeRun), officeChairsExplainer);
  const approved = { ...officeChairsExplainer, approved: true, approvedSha256: "2806525009b4b7f1eb5e93eec8e6fd37871fa1f041033f261fecbc1e6bdd159f" };
  assert.equal(snapshotVideo("office-chairs", officeRun, approved), approved);
  for (const change of [{ id: 162 }, { period_label: "2026-10-B" }, { run_date: "2026-10-21" }])
    assert.equal(snapshotVideo("office-chairs", { ...officeRun, ...change }, approved), null);
  assert.equal(snapshotVideo("dog-food", officeRun, approved), null);
  assert.equal(snapshotVideo("office-chairs", officeRun, { ...approved, approved: false }), null);
  assert.equal(snapshotVideo("office-chairs", officeRun, { ...approved, approvedSha256: null }), null);
});

test("Office Chairs preview preserves supplied video, accessible captions and exact closing", async () => {
  const { readFileSync } = await import("node:fs");
  const { createHash } = await import("node:crypto");
  const asset = readFileSync(new URL("../../../public" + officeChairsExplainer.src, import.meta.url));
  assert.equal(createHash("sha256").update(asset).digest("hex"), "2806525009b4b7f1eb5e93eec8e6fd37871fa1f041033f261fecbc1e6bdd159f");
  const captions = readFileSync(new URL("../../../public" + officeChairsExplainer.captions, import.meta.url), "utf8");
  assert.ok(captions.startsWith("WEBVTT"));
  assert.equal(captions.match(/-->/g)?.length, 20);
  assert.ok(captions.includes("Explore benchmark at getrecoscope.com."));
  assert.equal(officeChairsExplainer.transcript.at(-1).text, "Explore benchmark at getrecoscope.com.");
});


test("Running Shoes review is gated and approved video is isolated to November 6 run174", () => {
  const runningRun = { id: 174, period_label: "2026-11-A", run_date: "2026-11-06" };
  assert.equal(snapshotVideo("running-shoes", runningRun, { ...runningShoesExplainer, approved: false }), null);
  const approved = { ...runningShoesExplainer, approved: true };
  assert.equal(snapshotVideo("running-shoes", runningRun, approved), approved);
  for (const change of [{ id: 163 }, { period_label: "2026-10-B" }, { run_date: "2026-10-24" }])
    assert.equal(snapshotVideo("running-shoes", { ...runningRun, ...change }, approved), null);
  assert.equal(snapshotVideo("office-chairs", runningRun, approved), null);
  assert.equal(snapshotVideo("running-shoes", runningRun, { ...approved, approvedSha256: null }), null);
});

test("Running Shoes supplied export and captions preserve the verified split and closing", async () => {
  const { readFileSync } = await import("node:fs");
  const { createHash } = await import("node:crypto");
  const asset = readFileSync(new URL("../../../public" + runningShoesExplainer.src, import.meta.url));
  assert.equal(createHash("sha256").update(asset).digest("hex"), "7eb59df21147bc1b3563d90d5dfa8ded6ee90c7d22500cab8786ce95019bc4e7");
  const captions = readFileSync(new URL("../../../public" + runningShoesExplainer.captions, import.meta.url), "utf8");
  assert.ok(captions.startsWith("WEBVTT"));
  assert.equal(captions.match(/-->/g)?.length, 16);
  assert.ok(captions.includes("ChatGPT and Claude\nput Brooks first."));
  assert.ok(captions.includes("Gemini and Perplexity\nput ASICS first."));
  assert.ok(captions.includes("These captured answers do not\nestablish product quality."));
  assert.equal(runningShoesExplainer.transcript.at(-1).text, "Explore benchmark at getrecoscope.com.");
  const poster = readFileSync(new URL("../../../public" + runningShoesExplainer.poster, import.meta.url));
  assert.equal(poster.subarray(0, 3).toString("hex"), "ffd8ff");
});


test("Robot Vacuums approved media belongs only to November 7 run175", () => {
 const run = { id: 175, period_label: "2026-11-A", run_date: "2026-11-07" };
 assert.equal(snapshotVideo("robot-vacuums", run), robotVacuumsExplainer);
 assert.equal(snapshotVideo("robot-vacuums", run, {...robotVacuumsExplainer,approved:false}), null);
 const approved = { ...robotVacuumsExplainer, approved: true };
 assert.equal(snapshotVideo("robot-vacuums", run, approved), approved);
 for (const change of [{id:164},{period_label:"2026-10-B"},{run_date:"2026-10-25"}])
  assert.equal(snapshotVideo("robot-vacuums", {...run,...change},approved),null);
 assert.equal(snapshotVideo("running-shoes",run,approved),null);
 assert.equal(snapshotVideo("robot-vacuums",run,{...approved,approvedSha256:null}),null);
});

test("Robot Vacuums supplied media preserves separate denominators and final closing", async () => {
 const {readFileSync}=await import("node:fs");
 const {createHash}=await import("node:crypto");
 const bytes=readFileSync(new URL("../../../public"+robotVacuumsExplainer.src,import.meta.url));
 assert.equal(createHash("sha256").update(bytes).digest("hex"),"33b325bc2d9c3d67b8c4766813e7e891f43965c6906a77e0e8cc5a6c845481ae");
 const captions=readFileSync(new URL("../../../public"+robotVacuumsExplainer.captions,import.meta.url),"utf8");
 assert.equal(captions.match(/-->/g)?.length,20);
 assert.ok(captions.includes("all twelve usable"));
 assert.ok(captions.includes("four Ranking answers."));
 assert.ok(captions.includes("do not establish"));
 assert.equal(robotVacuumsExplainer.transcript.at(-1).text,"Explore benchmark at getrecoscope.com.");
 const poster=readFileSync(new URL("../../../public"+robotVacuumsExplainer.poster,import.meta.url));
 assert.equal(poster.subarray(0,8).toString("hex"),"89504e470d0a1a0a");
});


test("November9 Protein Powder approval remains isolated from the October27 explainer", async () => {
  const { proteinNovemberExplainer } = await import("../benchmark-video.mjs");
  const current = { id:177, period_label:"2026-11-A", run_date:"2026-11-09" };
  assert.equal(snapshotVideo("protein-powder",current,{...proteinNovemberExplainer,approved:false}),null);
  assert.equal(snapshotVideo("protein-powder",current),proteinNovemberExplainer);
  assert.equal(snapshotVideo("protein-powder",run),proteinExplainer);
  const released = {...proteinNovemberExplainer,approved:true};
  assert.equal(snapshotVideo("protein-powder",current,released),released);
  for (const change of [{id:166},{period_label:"2026-10-B"},{run_date:"2026-10-27"}])
    assert.equal(snapshotVideo("protein-powder",{...current,...change},released),null);
  assert.equal(snapshotVideo("wireless-earbuds",current,released),null);
  const {readFileSync}=await import("node:fs");
  const {createHash}=await import("node:crypto");
  assert.equal(createHash("sha256").update(readFileSync(new URL("../../../public"+released.src,import.meta.url))).digest("hex"),released.approvedSha256);
  const captions=readFileSync(new URL("../../../public"+released.captions,import.meta.url),"utf8");
  assert.equal(captions.match(/-->/g)?.length,19);
  assert.ok(captions.replace(/\s+/g," ").includes("Explore benchmark at getrecoscope.com."));
  assert.equal(released.transcript.at(-1).text,"Explore benchmark at getrecoscope.com.");
});


test("November10 Standing Desks review stays private and cannot replace October29 run167", async () => {
  const {standingNovemberExplainer}=await import("../benchmark-video.mjs");
  const current={id:178,period_label:"2026-11-A",run_date:"2026-11-10"};
  assert.equal(snapshotVideo("standing-desks",current),standingNovemberExplainer);
  assert.equal(snapshotVideo("standing-desks",current,{...standingNovemberExplainer,approved:false}),null);
  assert.equal(snapshotVideo("standing-desks",{id:167,period_label:"2026-10-B",run_date:"2026-10-29"}),standingDesksExplainer);
  const released={...standingNovemberExplainer,approved:true};
  assert.equal(snapshotVideo("standing-desks",current,released),released);
  for(const change of [{id:167},{period_label:"2026-10-B"},{run_date:"2026-10-29"}])
    assert.equal(snapshotVideo("standing-desks",{...current,...change},released),null);
  assert.equal(snapshotVideo("protein-powder",current,released),null);
  assert.match(released.context,/11 usable answers from 12 prompts/);
  assert.ok(released.summary[1].includes("three usable comparisons out of four submitted"));
  const {readFileSync}=await import("node:fs");
  const {createHash}=await import("node:crypto");
  assert.equal(createHash("sha256").update(readFileSync(new URL("../../../public"+released.src,import.meta.url))).digest("hex"),released.approvedSha256);
  const captions=readFileSync(new URL("../../../public"+released.captions,import.meta.url),"utf8");
  assert.equal(captions.match(/-->/g)?.length,16);
  assert.ok(captions.replace(/\s+/g," ").includes("Explore benchmark at getrecoscope.com."));
  assert.equal(released.transcript.at(-1).text,"Explore benchmark at getrecoscope.com.");
});


test("Approved November11 Skincare stays isolated to run179 and preserves historical skincare", async () => {
 const {skincareNovemberExplainer,skincareExplainer,snapshotVideo}=await import("../benchmark-video.mjs");
 const run={id:179,period_label:"2026-11-A",run_date:"2026-11-11"};
 assert.equal(snapshotVideo("skincare",run),skincareNovemberExplainer);
 const released={...skincareNovemberExplainer,approved:true};
 assert.equal(snapshotVideo("skincare",run,released),released);
 for(const change of [{id:168},{period_label:"2026-10-C"},{run_date:"2026-10-30"}])assert.equal(snapshotVideo("skincare",{...run,...change},released),null);
 assert.equal(snapshotVideo("standing-desks",run,released),null);
 assert.equal(snapshotVideo("skincare",{id:168,period_label:"2026-10-C",run_date:"2026-10-30"}),skincareExplainer);
 const {readFileSync}=await import("node:fs");const {createHash}=await import("node:crypto");
 assert.equal(createHash("sha256").update(readFileSync(new URL("../../../public"+released.src,import.meta.url))).digest("hex"),released.approvedSha256);
 const captions=readFileSync(new URL("../../../public"+released.captions,import.meta.url),"utf8");assert.equal(captions.match(/-->/g)?.length,17);
 assert.equal(released.transcript.at(-1).text,"Explore benchmark at getrecoscope.com.");
 assert.match(released.summary[0],/\$55–65 upfront/);assert.match(released.summary[1],/totals \$54/);
});


test("November11 Skincare watch listing requires exact published run179",async()=>{
 const {skincareNovemberExplainer}=await import("../benchmark-video.mjs");const {publicWatchVideos,videoSchema}=await import("../video-watch.mjs");
 const run={id:179,category_slug:"skincare",period_label:"2026-11-A",run_date:"2026-11-11"};
 assert.ok(publicWatchVideos([run]).includes(skincareNovemberExplainer));
 for(const change of [{id:168},{period_label:"2026-10-C"},{run_date:"2026-10-30"}])assert.ok(!publicWatchVideos([{...run,...change}]).includes(skincareNovemberExplainer));
 assert.ok(!publicWatchVideos([]).includes(skincareNovemberExplainer));
 const schema=videoSchema(skincareNovemberExplainer);assert.equal(schema.duration,"PT50S");assert.match(schema.url,/skincare-2026-11-a-check-the-total$/);assert.match(schema.transcript,/Explore benchmark at getrecoscope.com/);
});


test("November12 Air Purifiers is approved and scoped to run180",async()=>{
 const {airPurifiersNovemberExplainer:v,airPurifiersExplainer:old,snapshotVideo}=await import("../benchmark-video.mjs");
 const run={id:180,period_label:"2026-11-A",run_date:"2026-11-12"};
 assert.equal(snapshotVideo("air-purifiers",run),v);
 assert.equal(snapshotVideo("air-purifiers",run,{...v,approved:false}),null);
 const released={...v,approved:true};assert.equal(snapshotVideo("air-purifiers",run,released),released);
 for(const change of [{id:169},{period_label:"2026-10-C"},{run_date:"2026-10-31"}])assert.equal(snapshotVideo("air-purifiers",{...run,...change},released),null);
 assert.equal(snapshotVideo("skincare",run,released),null);
 assert.equal(snapshotVideo("air-purifiers",{id:169,period_label:"2026-10-C",run_date:"2026-10-31"}),old);
 const {readFileSync}=await import("node:fs");const {createHash}=await import("node:crypto");
 assert.equal(createHash("sha256").update(readFileSync(new URL("../../../public"+v.src,import.meta.url))).digest("hex"),v.approvedSha256);
 const captions=readFileSync(new URL("../../../public"+v.captions,import.meta.url),"utf8");assert.equal(captions.match(/-->/g)?.length,16);
 assert.equal(v.transcript.at(-1).text,"Explore benchmark at getrecoscope.com.");assert.match(v.summary[0],/11 of 12/);assert.match(v.summary[1],/all four comparative answers/);
});


test("November12 Air Purifiers watch listing requires exact public evidence",async()=>{
 const {airPurifiersNovemberExplainer:v}=await import("../benchmark-video.mjs");const {publicWatchVideos,videoSchema}=await import("../video-watch.mjs");
 const run={id:180,category_slug:"air-purifiers",period_label:"2026-11-A",run_date:"2026-11-12"};
 assert.ok(publicWatchVideos([run]).includes(v));assert.ok(!publicWatchVideos([]).includes(v));
 for(const c of [{id:169},{period_label:"2026-10-C"},{run_date:"2026-10-31"}])assert.ok(!publicWatchVideos([{...run,...c}]).includes(v));
 const schema=videoSchema(v);assert.equal(schema.duration,"PT47S");assert.match(schema.url,/air-purifiers-2026-11-a-split-first-choice$/);assert.match(schema.transcript,/Explore benchmark at getrecoscope.com/);
});


test("approved Humidifiers video is scoped to the first November13 snapshot",async()=>{
 const {humidifiersExplainer:v,snapshotVideo,benchmarkExplainers}=await import("../benchmark-video.mjs");
 const {publicWatchVideos,videoSchema}=await import("../video-watch.mjs");
 const run={id:181,category_slug:"humidifiers",period_label:"2026-11-A",run_date:"2026-11-13"};
 assert.equal(snapshotVideo("humidifiers",run),v);assert.ok(publicWatchVideos([run]).includes(v));
 for(const change of [{id:180},{period_label:"2026-10-C"},{run_date:"2026-11-12"}]){
  assert.equal(snapshotVideo("humidifiers",{...run,...change}),null);
  assert.ok(!publicWatchVideos([{...run,...change}]).includes(v));
 }
 assert.equal(snapshotVideo("sunscreen",run),null);
 assert.equal(snapshotVideo("humidifiers",run,{...v,approved:false}),null);
 assert.equal(benchmarkExplainers.length,17);
 const schema=videoSchema(v);assert.equal(schema.duration,"PT43.5S");assert.match(schema.transcript,/Explore benchmark at getrecoscope\.com\.$/);
 const {readFileSync}=await import("node:fs");const {createHash}=await import("node:crypto");
 assert.equal(createHash("sha256").update(readFileSync(new URL("../../../public"+v.src,import.meta.url))).digest("hex"),v.approvedSha256);
 const captions=readFileSync(new URL("../../../public"+v.captions,import.meta.url),"utf8");assert.equal(captions.match(/-->/g)?.length,17);
 assert.match(v.summary[0],/all 12 usable answers/);assert.match(v.summary[0],/one of four/);
});


test("November14 DogFood video preserves the prior snapshot and exact new scoping",async()=>{
 const {dogFoodNovemberBExplainer:v,dogFoodExplainer:old,snapshotVideo,benchmarkExplainers}=await import("../benchmark-video.mjs");
 const {publicWatchVideos,videoSchema}=await import("../video-watch.mjs");
 const run={id:182,category_slug:"dog-food",period_label:"2026-11-B",run_date:"2026-11-14"};
 assert.equal(snapshotVideo("dog-food",run),v);assert.ok(publicWatchVideos([run]).includes(v));
 assert.equal(snapshotVideo("dog-food",{id:172,period_label:"2026-11-A",run_date:"2026-11-04"}),old);
 for(const change of [{id:172},{period_label:"2026-11-A"},{run_date:"2026-11-04"}]){
  assert.equal(snapshotVideo("dog-food",{...run,...change}),null);
  assert.ok(!publicWatchVideos([{...run,...change}]).includes(v));
 }
 assert.equal(snapshotVideo("humidifiers",run),null);
 assert.equal(snapshotVideo("dog-food",run,{...v,approved:false}),null);
 const schema=videoSchema(v);assert.equal(schema.duration,"PT48.3S");assert.match(schema.transcript,/Explore benchmark at getrecoscope\.com\.$/);
 const {readFileSync}=await import("node:fs");const {createHash}=await import("node:crypto");
 assert.equal(createHash("sha256").update(readFileSync(new URL("../../../public"+v.src,import.meta.url))).digest("hex"),v.approvedSha256);
 const captions=readFileSync(new URL("../../../public"+v.captions,import.meta.url),"utf8");assert.equal(captions.match(/-->/g)?.length,18);
 assert.match(v.summary[0],/Each date captured 12 usable answers/);assert.match(v.summary[2],/Two snapshots do not establish stable AI behavior/);
});
