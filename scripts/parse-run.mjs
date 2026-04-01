#!/usr/bin/env node

/**
 * RecoScope — Benchmark Run Data Ingestion Script
 *
 * Reads raw AI model responses, extracts brand mentions via Claude API,
 * and generates ready-to-execute SQL for Neon.
 *
 * Usage:
 *   node scripts/parse-run.mjs \
 *     --input ./data/w14-lawn-fertilizer.txt \
 *     --run-id 6 \
 *     --category "Lawn Fertilizer"
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const VALID_MODELS = new Set(["chatgpt", "claude", "gemini", "perplexity"]);
const EXPECTED_SECTIONS = 12; // 4 models × 3 prompts
const MODEL_ID = "claude-sonnet-4-20250514";

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace(/^--/, "");
    const val = args[i + 1];
    if (key && val) parsed[key] = val;
  }

  if (!parsed.input || !parsed["run-id"] || !parsed.category) {
    console.error(
      "Usage: node scripts/parse-run.mjs --input <file> --run-id <id> --category <name>",
    );
    process.exit(1);
  }

  return {
    inputPath: resolve(parsed.input),
    runId: parseInt(parsed["run-id"], 10),
    category: parsed.category,
  };
}

// ---------------------------------------------------------------------------
// Load API key from env or .env.local
// ---------------------------------------------------------------------------

function loadApiKey() {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;

  // Try .env.local
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const envPath = resolve(__dirname, "..", ".env.local");
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const match = line.match(/^ANTHROPIC_API_KEY=(.+)$/);
      if (match) return match[1].trim();
    }
  }

  console.error("Error: ANTHROPIC_API_KEY not found in environment or .env.local");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Parse input file
// ---------------------------------------------------------------------------

function parseInputFile(filePath) {
  const raw = readFileSync(filePath, "utf-8");

  // Split by --- delimiters, filter empty/comment blocks
  const blocks = raw.split(/^---$/m).filter((b) => b.trim() && !b.trim().startsWith("#"));

  // Pair headers with response bodies
  const sections = [];
  for (let i = 0; i < blocks.length; i += 2) {
    const header = blocks[i]?.trim();
    const body = blocks[i + 1]?.trim();
    if (!header || !body) continue;

    const modelMatch = header.match(/^MODEL:\s*(.+)$/m);
    const promptMatch = header.match(/^PROMPT:\s*(\d+)$/m);
    const promptTextMatch = header.match(/^PROMPT_TEXT:\s*(.+)$/m);

    if (!modelMatch || !promptMatch || !promptTextMatch) {
      console.warn(`Warning: Skipping malformed section header:\n${header.slice(0, 100)}...`);
      continue;
    }

    const model = modelMatch[1].trim().toLowerCase();
    if (!VALID_MODELS.has(model)) {
      console.error(`Error: Invalid model name "${model}". Must be one of: ${[...VALID_MODELS].join(", ")}`);
      process.exit(1);
    }

    sections.push({
      model,
      promptNumber: parseInt(promptMatch[1], 10),
      promptText: promptTextMatch[1].trim(),
      response: body,
    });
  }

  if (sections.length !== EXPECTED_SECTIONS) {
    console.error(
      `Error: Expected ${EXPECTED_SECTIONS} sections, found ${sections.length}. ` +
        `Check input file format.`,
    );
    process.exit(1);
  }

  return sections;
}

// ---------------------------------------------------------------------------
// Model name normalization (display names)
// ---------------------------------------------------------------------------

const MODEL_DISPLAY = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  perplexity: "Perplexity",
};

// ---------------------------------------------------------------------------
// API call with retry
// ---------------------------------------------------------------------------

async function callClaude(client, systemPrompt, userContent) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await client.messages.create({
        model: MODEL_ID,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: userContent }],
      });
      const text = response.content[0]?.type === "text" ? response.content[0].text : "";
      return text.trim();
    } catch (err) {
      if (attempt === 0) {
        console.warn(`API call failed, retrying... (${err.message})`);
        await new Promise((r) => setTimeout(r, 2000));
      } else {
        throw err;
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Extract brands from a single response
// ---------------------------------------------------------------------------

async function extractBrands(client, section) {
  const systemPrompt = `You are a data extraction tool for RecoScope. Given an AI model response about product recommendations, extract every brand mentioned. For each brand mention return:
- brand_name_raw: exactly as written in the response
- brand_name_normalized: cleaned/standardized name (e.g., "Scotts Turf Builder" not "Scotts Turf Builder Starter Food for New Grass")
- mention_rank: position order (1 = first mentioned)
- is_top_3: true if rank 1-3
- is_first: true if rank 1

Respond ONLY with a JSON array, no markdown fences, no preamble.`;

  const userContent = `Model: ${section.model}\nPrompt: ${section.promptText}\n\nResponse:\n${section.response}`;

  const raw = await callClaude(client, systemPrompt, userContent);

  // Strip markdown fences if present despite instructions
  const cleaned = raw.replace(/^```json?\n?/, "").replace(/\n?```$/, "");

  try {
    return JSON.parse(cleaned);
  } catch {
    console.error(`Failed to parse brand extraction JSON for ${section.model} prompt ${section.promptNumber}`);
    console.error("Raw response:", raw.slice(0, 500));
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Generate editorial analysis
// ---------------------------------------------------------------------------

async function generateInsights(client, category, allBrands) {
  // Aggregate brand counts
  const counts = new Map();
  for (const { brands } of allBrands) {
    for (const b of brands) {
      counts.set(b.brand_name_normalized, (counts.get(b.brand_name_normalized) || 0) + 1);
    }
  }
  const sorted = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => `${name}: ${count} mentions`);

  const systemPrompt = `You are writing editorial analysis for a RecoScope benchmark report on ${category}. Write clear, direct prose. Avoid filler words like "notably", "interestingly", "importantly". Use short sentences.

Given the brand mention data below, return a JSON object with:
- key_takeaway: 1-2 sentences, the most important finding
- audit_angle: 1 sentence about what this means for brands trying to improve AI visibility
- common_traits: 2-4 sentences about what the top brands have in common (newline-separated if multiple points)
- cross_agent_differences: 2-4 sentences about where AI models disagree (newline-separated)
- market_gaps: 2-4 sentences about opportunities for brands not appearing in results (newline-separated)
- top_brands_summary: 1-2 sentences summarizing the overall brand ranking

Respond ONLY with JSON, no markdown fences.`;

  const userContent = `Category: ${category}\n\nBrand mention summary:\n${sorted.join("\n")}`;

  const raw = await callClaude(client, systemPrompt, userContent);
  const cleaned = raw.replace(/^```json?\n?/, "").replace(/\n?```$/, "");

  try {
    return JSON.parse(cleaned);
  } catch {
    console.error("Failed to parse insights JSON");
    console.error("Raw response:", raw.slice(0, 500));
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// SQL generation
// ---------------------------------------------------------------------------

function esc(str) {
  if (str == null) return "NULL";
  return `'${String(str).replace(/'/g, "''")}'`;
}

function generateSQL(runId, sections, allBrands, insights) {
  const lines = [];
  lines.push(`-- RecoScope benchmark data for run_id = ${runId}`);
  lines.push(`-- Generated ${new Date().toISOString()}\n`);

  // agent_responses
  lines.push("-- agent_responses");
  for (const s of sections) {
    const agent = MODEL_DISPLAY[s.model] || s.model;
    lines.push(
      `INSERT INTO agent_responses (run_id, agent_name, prompt_number, prompt_text, raw_response) VALUES (${runId}, ${esc(agent)}, ${s.promptNumber}, ${esc(s.promptText)}, ${esc(s.response)});`,
    );
  }

  lines.push("");

  // brand_mentions
  lines.push("-- brand_mentions");
  for (const { section, brands } of allBrands) {
    const agent = MODEL_DISPLAY[section.model] || section.model;
    for (const b of brands) {
      lines.push(
        `INSERT INTO brand_mentions (run_id, agent_name, prompt_number, brand_name_raw, brand_name_normalized, mention_rank, is_top_3, is_first, mentioned) VALUES (${runId}, ${esc(agent)}, ${section.promptNumber}, ${esc(b.brand_name_raw)}, ${esc(b.brand_name_normalized)}, ${b.mention_rank}, ${b.is_top_3 ? "true" : "false"}, ${b.is_first ? "true" : "false"}, true);`,
      );
    }
  }

  lines.push("");

  // run_insights
  lines.push("-- run_insights");
  lines.push(
    `INSERT INTO run_insights (run_id, key_takeaway, audit_angle, common_traits, cross_agent_differences, market_gaps, top_brands_summary) VALUES (${runId}, ${esc(insights.key_takeaway)}, ${esc(insights.audit_angle)}, ${esc(insights.common_traits)}, ${esc(insights.cross_agent_differences)}, ${esc(insights.market_gaps)}, ${esc(insights.top_brands_summary)});`,
  );

  lines.push("");

  // Publish the run
  lines.push("-- Publish run");
  lines.push(`UPDATE runs SET status = 'published' WHERE id = ${runId};`);

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { inputPath, runId, category } = parseArgs();
  const categorySlug = category.toLowerCase().replace(/\s+/g, "-");

  console.log(`RecoScope Data Ingestion`);
  console.log(`  Input:    ${inputPath}`);
  console.log(`  Run ID:   ${runId}`);
  console.log(`  Category: ${category}\n`);

  // Parse input
  console.log("Parsing responses...");
  const sections = parseInputFile(inputPath);
  console.log(`  Found ${sections.length} response sections\n`);

  // Init API client
  const apiKey = loadApiKey();
  const client = new Anthropic({ apiKey });

  // Extract brands
  console.log("Extracting brands...");
  const allBrands = [];
  for (const section of sections) {
    const agent = MODEL_DISPLAY[section.model];
    process.stdout.write(`  ${agent} prompt ${section.promptNumber}... `);
    const brands = await extractBrands(client, section);
    console.log(`${brands.length} brands found`);
    allBrands.push({ section, brands });
  }
  console.log("");

  // Generate insights
  console.log("Generating editorial analysis...");
  const insights = await generateInsights(client, category, allBrands);
  console.log("  Done\n");

  // Generate SQL
  console.log("Generating SQL...");
  const sql = generateSQL(runId, sections, allBrands, insights);

  // Generate JSON backup
  const jsonData = {
    runId,
    category,
    generatedAt: new Date().toISOString(),
    sections: sections.map((s) => ({
      model: s.model,
      promptNumber: s.promptNumber,
      promptText: s.promptText,
    })),
    brands: allBrands.map(({ section, brands }) => ({
      model: section.model,
      promptNumber: section.promptNumber,
      brands,
    })),
    insights,
  };

  // Write output
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const dataDir = resolve(__dirname, "..", "data");

  const sqlPath = resolve(dataDir, `run-${runId}-${categorySlug}.sql`);
  const jsonPath = resolve(dataDir, `run-${runId}-${categorySlug}.json`);

  writeFileSync(sqlPath, sql, "utf-8");
  writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), "utf-8");

  console.log(`  SQL:  ${sqlPath}`);
  console.log(`  JSON: ${jsonPath}`);
  console.log("\nDone. Paste the SQL into Neon SQL Editor to publish the run.");
}

main().catch((err) => {
  console.error("\nFatal error:", err.message);
  process.exit(1);
});
