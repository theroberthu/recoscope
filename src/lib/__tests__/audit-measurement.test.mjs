import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { NextResponse } from "next/server.js";
import * as journey from "../journey.mjs";

async function route({cookie="",duplicate=false,failInsert=false,hostname="www.getrecoscope.com"}={}){
  const queries=[];const emails=[];
  const sql=async(strings,...values)=>{queries.push({text:strings.join("?"),values});if(strings.join("").includes("SELECT id"))return duplicate?[{id:1}]:[];if(failInsert)throw new Error("test insert failure");return [];};
  const code=ts.transpileModule(readFileSync(new URL("../../app/api/audit/route.ts",import.meta.url),"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  const exports={};const require=name=>({"next/server":{NextResponse},"@/lib/db":{getDb:()=>sql},"@/lib/journey.mjs":journey,"resend":{Resend:class{emails={send:async data=>{emails.push(data);return {};}}}}})[name];
  new Function("require","exports","process",code)(require,exports,{env:{RESEND_API_KEY:"test-only-placeholder"}});
  const req={nextUrl:new URL(`https://${hostname}/api/audit`),headers:new Headers({cookie}),json:async()=>({email:"qa@example.com",brand_name:"QA test",category_interest:"Standing Desks",measurement:{measurement_version:"journey_v1",entry_element:"home_hero_audit",landing_path:"/",campaign:{utm_source:"youtube"},email:"private@example.com"}})};
  const response=await exports.POST(req);return {status:response.status,body:await response.json(),queries,emails};
}
test("QA request is saved as test with sanitized context and no notification",async()=>{const r=await route({cookie:"recoscope_audience=qa"});assert.equal(r.body.ok,true);assert.equal(r.emails.length,0);assert.equal(r.queries[1].values.at(-1),"test");const m=JSON.parse(r.queries[1].values.at(-2));assert.equal(m.entry_element,"home_hero_audit");assert.equal(m.audience_type,"qa");assert.ok(!JSON.stringify(m).includes("private@example.com"));});
test("visitor request is recorded but remains unreviewed and keeps normal notification",async()=>{const r=await route();assert.equal(r.body.ok,true);assert.equal(r.queries[1].values.at(-1),"unreviewed");assert.equal(r.emails.length,1);});
test("duplicate request does not create a second submission",async()=>{const r=await route({duplicate:true});assert.equal(r.body.duplicate,true);assert.equal(r.queries.length,1);assert.equal(r.emails.length,0);});
test("failed persistence cannot report a successful request",async()=>{const r=await route({failInsert:true});assert.equal(r.status,500);assert.equal(r.body.ok,undefined);assert.equal(r.emails.length,0);});
test("preview requests are always test-labelled even without a browser marker",async()=>{const r=await route({hostname:"recoscope-preview.vercel.app"});assert.equal(r.body.ok,true);assert.equal(r.queries[1].values.at(-1),"test");assert.equal(r.emails.length,0);});
