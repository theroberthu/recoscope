import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { eventParameters, safePath, cleanSession, sanitizeLeadMeasurement, readAudience } from "../journey.mjs";
import { analyticsBootstrapScript } from "../analytics-bootstrap.mjs";

test("UI parameters cannot overwrite acquisition or send personal form values", () => {
  const p=eventParameters({source:"homepage",ui_element:"home_hero_audit",destination_path:"/audit?source=homepage&email=private@example.com",email:"private@example.com",brand_name:"Private brand",medium:"organic"},"qa");
  assert.equal(p.ui_element,"home_hero_audit");assert.equal(p.destination_path,"/audit");assert.equal(p.audience_type,"qa");assert.equal(p.debug_mode,true);
  for(const key of ["email","brand_name","source","medium"])assert.ok(!(key in p));
  assert.equal(eventParameters({source:"old_source"}).ui_element,"old_source");
});
test("stored paths and campaigns strip private queries and off-site destinations", () => {
  assert.equal(safePath("https://www.getrecoscope.com/tracker/standing-desks?period=2026-11-C&email=secret#secret"),"/tracker/standing-desks?period=2026-11-C");
  assert.equal(safePath("https://evil.example/audit"),"");assert.equal(safePath("/someone@example.com"),"");
  const m=sanitizeLeadMeasurement({measurement_version:"journey_v1",entry_element:"home_hero_audit",landing_path:"/?email=private@example.com",email:"private@example.com",campaign:{utm_source:"youtube",utm_medium:"organic_video",utm_campaign:"private@example.com",password:"private"}},"qa");
  assert.equal(m.landing_path,"/");assert.deepEqual(m.campaign,{utm_source:"youtube",utm_medium:"organic_video"});assert.ok(!JSON.stringify(m).includes("private"));assert.equal(m.audience_type,"qa");
});
test("entry attribution persists within the visit and expires after inactivity", () => {
  const s={landing_path:"/",entry_path:"/",entry_element:"home_final_audit",utm_source:"youtube",last_seen:10000};
  assert.equal(cleanSession(s,11000).entry_element,"home_final_audit");assert.equal(cleanSession(s,11000).utm_source,"youtube");assert.equal(cleanSession(s,1810001),null);assert.equal(cleanSession(s,1),null);
  assert.equal(readAudience("other=x; recoscope_audience=qa"),"qa");assert.equal(readAudience("recoscope_audience=unknown"),"visitor");
});
test("visit marker is applied before the first GA config; previews never load GA", () => {
  function run(host,search,cookie=""){
    const scripts=[];const document={cookie,createElement:()=>({}),head:{appendChild:s=>scripts.push(s)}};const window={location:{hostname:host,search}};
    vm.runInNewContext(analyticsBootstrapScript,{window,document,URLSearchParams,Date});
    return {calls:(window.dataLayer||[]).map(x=>[...x]),scripts,document};
  }
  const q=run("www.getrecoscope.com","?rs_traffic=qa");assert.equal(q.calls[0][0],"set");assert.equal(q.calls[0][1].audience_type,"qa");assert.equal(q.calls[2][0],"config");assert.equal(q.scripts.length,1);assert.match(q.document.cookie,/SameSite=Lax; Secure/);
  for(const host of ["localhost","127.0.0.1","recoscope-preview.vercel.app"]){const r=run(host,"?rs_traffic=qa");assert.equal(r.calls.length,0);assert.equal(r.scripts.length,0);}
  assert.equal(run("www.getrecoscope.com","","recoscope_audience=staff").calls[0][1].audience_type,"staff");
});
