#!/usr/bin/env node
// Sends a personalized WhatsApp message + picture to every contact in an Excel sheet,
// one by one, from your WhatsApp Business number via the official WhatsApp Cloud API.
//
//   node send.mjs --dry-run            read the sheet and show what would be sent
//   node send.mjs --to 2010XXXXXXXX    send a single test message to one number
//   node send.mjs --limit 20           send to the first 20 pending contacts only
//   node send.mjs                      send to everyone not already in sent-log.csv

import fs from "node:fs";
import path from "node:path";
import ExcelJS from "exceljs";

const here = path.dirname(new URL(import.meta.url).pathname);
const envFile = path.join(here, ".env");
if (fs.existsSync(envFile)) process.loadEnvFile(envFile);

const args = parseArgs(process.argv.slice(2));
const cfg = {
  token: process.env.WA_TOKEN,
  phoneNumberId: process.env.WA_PHONE_NUMBER_ID,
  apiVersion: process.env.WA_API_VERSION || "v23.0",
  mode: (process.env.MODE || "template").toLowerCase(),
  templateName: process.env.WA_TEMPLATE_NAME || "personal_greeting",
  templateLang: process.env.WA_TEMPLATE_LANG || "ar",
  caption: process.env.CAPTION || "أهلاً {name} 👋",
  fallbackName: process.env.FALLBACK_NAME || "عميلنا العزيز",
  excelPath: path.resolve(here, args.file || process.env.EXCEL_PATH || "contacts.xlsx"),
  imagePath: path.resolve(here, args.image || process.env.IMAGE_PATH || "image.jpg"),
  countryCode: (process.env.DEFAULT_COUNTRY_CODE || "20").replace(/\D/g, ""),
  delayMs: Number(process.env.DELAY_MS || 1500),
  logPath: path.join(here, "sent-log.csv"),
};

const NAME_HEADERS = ["name", "full name", "first name", "contact", "الاسم", "اسم", "الإسم"];
const PHONE_HEADERS = ["phone", "phone number", "mobile", "number", "no", "no.", "whatsapp", "tel", "الرقم", "رقم", "الموبايل", "موبايل", "الهاتف", "رقم الهاتف", "واتساب"];

main().catch((err) => {
  console.error(`\n✖ ${err.message}`);
  process.exit(1);
});

async function main() {
  if (!["template", "session"].includes(cfg.mode)) throw new Error(`MODE must be "template" or "session", got "${cfg.mode}"`);

  let contacts;
  if (args.to) {
    const phone = normalizePhone(args.to);
    if (!phone) throw new Error(`Invalid --to number: ${args.to}`);
    contacts = [{ row: 0, name: args.name || cfg.fallbackName, phone }];
  } else {
    contacts = await readContacts(cfg.excelPath);
  }

  const alreadySent = args.to ? new Set() : readSentLog(cfg.logPath);
  let pending = contacts.filter((c) => !alreadySent.has(c.phone));
  if (args.limit) pending = pending.slice(0, args.limit);

  console.log(`Contacts in sheet: ${contacts.length} | already sent: ${contacts.length - contacts.filter((c) => !alreadySent.has(c.phone)).length} | to send now: ${pending.length}`);
  console.log(`Mode: ${cfg.mode}${cfg.mode === "template" ? ` (template "${cfg.templateName}", lang ${cfg.templateLang})` : ""}`);

  if (args.dryRun) {
    for (const c of pending) console.log(`  → +${c.phone}  ${c.name}  | ${previewText(c.name)}`);
    console.log("\nDry run only — nothing was sent.");
    return;
  }

  if (!cfg.token || !cfg.phoneNumberId) throw new Error("WA_TOKEN and WA_PHONE_NUMBER_ID must be set in .env");
  if (!fs.existsSync(cfg.imagePath)) throw new Error(`Image not found: ${cfg.imagePath}`);
  if (pending.length === 0) return console.log("Nothing to send.");

  console.log(`Uploading image ${path.basename(cfg.imagePath)} ...`);
  const mediaId = await uploadImage(cfg.imagePath);
  console.log(`Image uploaded (media id ${mediaId}). Sending...\n`);

  let ok = 0;
  let failed = 0;
  for (const [i, c] of pending.entries()) {
    const label = `[${i + 1}/${pending.length}] +${c.phone} ${c.name}`;
    try {
      const messageId = await sendMessage(c, mediaId);
      appendLog(c, "sent", messageId);
      console.log(`✔ ${label}`);
      ok++;
    } catch (err) {
      appendLog(c, "failed", err.message);
      console.log(`✖ ${label} — ${err.message}`);
      failed++;
      if (err.fatal) {
        console.error("\nStopping: this error will affect every message. Fix it and re-run (sent contacts are skipped).");
        break;
      }
    }
    if (i < pending.length - 1) await sleep(cfg.delayMs);
  }

  console.log(`\nDone. Sent: ${ok}, failed: ${failed}. Details in ${path.relative(process.cwd(), cfg.logPath)}`);
  if (failed) console.log("Re-running the script retries only the contacts that were not sent.");
}

// ---------- Excel ----------

async function readContacts(file) {
  if (!fs.existsSync(file)) throw new Error(`Excel file not found: ${file}`);
  const wb = new ExcelJS.Workbook();
  if (file.toLowerCase().endsWith(".csv")) await wb.csv.readFile(file);
  else await wb.xlsx.readFile(file);
  const ws = wb.worksheets[0];
  if (!ws) throw new Error("The Excel file has no sheets");

  // Find the header row (first row that has a name or phone header); fall back to A = name, B = phone.
  let headerRow = 0;
  let nameCol = 1;
  let phoneCol = 2;
  for (let r = 1; r <= Math.min(ws.rowCount, 10); r++) {
    const cells = ws.getRow(r).values.map((v) => cellText(v).toLowerCase());
    const n = cells.findIndex((v) => NAME_HEADERS.includes(v));
    const p = cells.findIndex((v) => PHONE_HEADERS.includes(v));
    if (n > 0 || p > 0) {
      headerRow = r;
      if (n > 0) nameCol = n;
      if (p > 0) phoneCol = p;
      break;
    }
  }

  const contacts = [];
  const seen = new Set();
  const skipped = [];
  ws.eachRow((row, r) => {
    if (r <= headerRow) return;
    const rawName = cellText(row.getCell(nameCol).value);
    const rawPhone = cellText(row.getCell(phoneCol).value);
    if (!rawName && !rawPhone) return;
    const phone = normalizePhone(rawPhone);
    if (!phone) return skipped.push(`row ${r}: invalid number "${rawPhone}"`);
    if (seen.has(phone)) return skipped.push(`row ${r}: duplicate number +${phone}`);
    seen.add(phone);
    contacts.push({ row: r, name: rawName || cfg.fallbackName, phone });
  });

  if (skipped.length) console.log(`Skipped ${skipped.length} row(s):\n  ${skipped.join("\n  ")}`);
  return contacts;
}

function cellText(v) {
  if (v == null) return "";
  if (typeof v === "object") {
    if (Array.isArray(v.richText)) return v.richText.map((t) => t.text).join("").trim();
    if ("text" in v) return String(v.text).trim();
    if ("result" in v) return String(v.result ?? "").trim();
  }
  return String(v).trim();
}

// Returns the number in international format without "+" (e.g. 201012345678), or null.
function normalizePhone(raw) {
  let d = String(raw).replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0")) d = cfg.countryCode + d.slice(1); // 01012345678 -> 201012345678
  else if (cfg.countryCode === "20" && /^1\d{9}$/.test(d)) d = "20" + d; // leading 0 lost in Excel
  if (d.startsWith("20") && d.length !== 12) return null; // Egyptian mobiles: 20 + 10 digits
  return d.length >= 8 && d.length <= 15 ? d : null;
}

// ---------- WhatsApp Cloud API ----------

async function uploadImage(file) {
  const ext = path.extname(file).toLowerCase();
  const type = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png" }[ext];
  if (!type) throw new Error("Image must be .jpg, .jpeg or .png");
  if (fs.statSync(file).size > 5 * 1024 * 1024) throw new Error("Image must be 5 MB or smaller");

  const form = new FormData();
  form.append("messaging_product", "whatsapp");
  form.append("type", type);
  form.append("file", new Blob([fs.readFileSync(file)], { type }), path.basename(file));
  const res = await api(`${cfg.phoneNumberId}/media`, form);
  return res.id;
}

async function sendMessage(contact, mediaId) {
  const body = { messaging_product: "whatsapp", recipient_type: "individual", to: contact.phone };
  if (cfg.mode === "template") {
    body.type = "template";
    body.template = {
      name: cfg.templateName,
      language: { code: cfg.templateLang },
      components: [
        { type: "header", parameters: [{ type: "image", image: { id: mediaId } }] },
        { type: "body", parameters: [{ type: "text", text: contact.name }] },
      ],
    };
  } else {
    body.type = "image";
    body.image = { id: mediaId, caption: previewText(contact.name) };
  }

  for (let attempt = 1; ; attempt++) {
    try {
      const res = await api(`${cfg.phoneNumberId}/messages`, JSON.stringify(body));
      return res.messages?.[0]?.id ?? "";
    } catch (err) {
      if (!err.retryable || attempt >= 4) throw err;
      const wait = 2000 * 2 ** attempt;
      console.log(`  …rate limited / temporary error, retrying in ${wait / 1000}s`);
      await sleep(wait);
    }
  }
}

async function api(endpoint, body) {
  const headers = { Authorization: `Bearer ${cfg.token}` };
  if (typeof body === "string") headers["Content-Type"] = "application/json";
  const res = await fetch(`https://graph.facebook.com/${cfg.apiVersion}/${endpoint}`, { method: "POST", headers, body });
  const json = await res.json().catch(() => ({}));
  if (res.ok && !json.error) return json;

  const e = json.error || {};
  const code = e.code;
  const detail = e.error_data?.details || e.message || `HTTP ${res.status}`;
  const err = new Error(`${code ?? res.status}: ${detail}${hint(code)}`);
  err.retryable = res.status === 429 || res.status >= 500 || [4, 80007, 130429, 131016, 131056].includes(code);
  err.fatal = [0, 10, 190, 132000, 132001, 132005, 132007, 132012, 131031, 133010].includes(code) || res.status === 401;
  throw err;
}

function hint(code) {
  return (
    {
      190: " (access token is invalid or expired — create a permanent System User token)",
      131030: " (test mode: add this number to the allowed recipients list, or go live)",
      131047: " (more than 24h since they last messaged you — use MODE=template)",
      131026: " (number is not on WhatsApp or can't receive this message)",
      132001: " (template name/language not found — check WA_TEMPLATE_NAME and WA_TEMPLATE_LANG)",
      132000: " (template parameter count mismatch — template needs an IMAGE header and exactly one {{1}} in the body)",
      132012: " (template format mismatch — header must be IMAGE, body must contain {{1}})",
      133010: " (phone number not registered with the Cloud API yet)",
      131031: " (business account is restricted or locked)",
    }[code] || ""
  );
}

// ---------- helpers ----------

function previewText(name) {
  return cfg.mode === "template" ? `[template ${cfg.templateName}] {{1}} = ${name}` : cfg.caption.replaceAll("{name}", name);
}

function readSentLog(file) {
  const sent = new Set();
  if (!fs.existsSync(file)) return sent;
  for (const line of fs.readFileSync(file, "utf8").split("\n").slice(1)) {
    const [, phone, , status] = parseCsvLine(line);
    if (status === "sent") sent.add(phone);
  }
  return sent;
}

function appendLog(c, status, detail) {
  if (!fs.existsSync(cfg.logPath)) fs.writeFileSync(cfg.logPath, "﻿time,phone,name,status,detail\n");
  const row = [new Date().toISOString(), c.phone, c.name, status, detail].map(csvCell).join(",");
  fs.appendFileSync(cfg.logPath, row + "\n");
}

function csvCell(v) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') (cur += '"'), i++;
      else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") out.push(cur), (cur = "");
    else cur += ch;
  }
  out.push(cur);
  return out;
}

function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k === "--dry-run") a.dryRun = true;
    else if (k === "--to") a.to = argv[++i];
    else if (k === "--name") a.name = argv[++i];
    else if (k === "--limit") a.limit = Number(argv[++i]);
    else if (k === "--file") a.file = argv[++i];
    else if (k === "--image") a.image = argv[++i];
    else if (k === "--help" || k === "-h") {
      console.log("Usage: node send.mjs [--dry-run] [--to NUMBER [--name NAME]] [--limit N] [--file contacts.xlsx] [--image image.jpg]");
      process.exit(0);
    } else throw new Error(`Unknown option: ${k}`);
  }
  return a;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
