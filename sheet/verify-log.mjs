#!/usr/bin/env node
/**
 * Score sheet CSVs against numbers the workout log already wrote.
 * Run from repo root: node sheet/verify-log.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const logPath =
  process.env.WORKOUT_LOG ||
  path.resolve(root, "../Dharma/body/workout-log.md");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else q = false;
      } else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some((x) => x !== "")) rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  const h = rows[0];
  return rows.slice(1).map((r) => {
    const o = {};
    h.forEach((k, i) => (o[k] = r[i] ?? ""));
    return o;
  });
}

function load(name) {
  return parseCsv(fs.readFileSync(path.join(here, name), "utf8"));
}

function num(v) {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const sets = load("sets.csv");
const sessions = load("sessions.csv");
const hits = load("hits.csv");
const status = load("muscle_status.csv");
const md = fs.readFileSync(logPath, "utf8");

const checks = [];
function check(id, ok, detail, expected, got) {
  checks.push({
    id,
    ok: Boolean(ok),
    detail,
    expected: expected == null ? "" : String(expected),
    got: got == null ? "" : String(got),
  });
}

function csvReps(date, logName) {
  return sets
    .filter((s) => s.date === date && s.log_name === logName && s.reps !== "")
    .reduce((a, s) => a + Number(s.reps), 0);
}

function csvSessionReps(date) {
  const row = sessions.find((s) => s.date === date);
  return row ? Number(row.total_reps) : null;
}

const statedSessions = [];
const headerRe = /^## (\d{4}-\d{2}-\d{2})\s+—\s+(\S+)/gm;
const headers = [...md.matchAll(headerRe)].map((m) => ({
  date: m[1],
  index: m.index,
}));
for (let i = 0; i < headers.length; i++) {
  const chunk = md.slice(
    headers[i].index,
    i + 1 < headers.length ? headers[i + 1].index : md.length
  );
  const total =
    chunk.match(/Session total (\d+)/i) ||
    chunk.match(/Session volume ~(\d+)/i);
  if (total) statedSessions.push({ date: headers[i].date, stated: Number(total[1]) });
}

for (const s of statedSessions) {
  const got = csvSessionReps(s.date);
  check(
    `session-total-${s.date}`,
    got === s.stated,
    `${s.date} session total`,
    s.stated,
    got
  );
}

const liftCases = [
  ["2026-08-13", "Incline dumbbell bench press", 27],
  ["2026-08-13", "Push-ups", 36],
  ["2026-08-13", "Dips", 26],
  ["2026-08-13", "Shoulder press (single-arm)", 31],
  ["2026-08-13", "TRX tricep extensions", 33],
  ["2026-08-10", "Chin-ups", 23],
  ["2026-08-10", "TRX face pulls", 50],
  ["2026-08-10", "Curtain openers (TRX Y flies)", 30],
  ["2026-08-10", "Dumbbell upright rows", 25],
  ["2026-08-10", "Alternating dumbbell curls", 29],
  ["2026-08-08", "Incline dumbbell bench press", 24],
  ["2026-08-08", "Push-ups", 29],
  ["2026-08-08", "Dips", 23],
  ["2026-08-08", "Shoulder press (single-arm)", 30],
  ["2026-08-08", "TRX tricep extensions", 33],
  ["2026-08-05", "Chin-ups", 25],
  ["2026-08-05", "TRX rows", 56],
  ["2026-08-02", "Dumbbell deadlifts", 39],
  ["2026-08-02", "Stiff-legged deadlifts", 30],
  ["2026-08-02", "TRX squats", 55],
  ["2026-08-02", "Glute bridges", 90],
  ["2026-08-01", "Incline dumbbell bench press", 29],
  ["2026-08-01", "Push-ups", 32],
  ["2026-08-01", "Dips", 33],
  ["2026-08-01", "Shoulder press (single-arm)", 24],
  ["2026-08-01", "TRX tricep extensions", 36],
  ["2026-07-28", "Dumbbell deadlifts", 35],
  ["2026-07-23", "Dumbbell deadlifts", 37],
  ["2026-07-23", "Box step-ups", 10],
  ["2026-07-19", "Incline dumbbell bench press", 28],
  ["2026-07-19", "Dips", 0],
  ["2026-07-13", "Incline dumbbell bench press", 26],
];

for (const [date, name, stated] of liftCases) {
  const got = csvReps(date, name);
  check(`lift-${date}-${name}`, got === stated, `${date} ${name}`, stated, got);
}

function volumeHand(date, logName) {
  const rows = sets.filter(
    (s) => s.date === date && s.log_name === logName && s.reps !== ""
  );
  return rows.reduce((a, s) => a + Number(s.reps) * Number(s.weight_lb), 0);
}

function volumeDoubled(date, logName) {
  const rows = sets.filter(
    (s) => s.date === date && s.log_name === logName && s.reps !== ""
  );
  return rows.reduce((a, s) => {
    const w = Number(s.weight_lb);
    const factor = s.per_hand === "yes" ? 2 : 1;
    return a + Number(s.reps) * w * factor;
  }, 0);
}

const v2800 = volumeHand("2026-07-28", "Dumbbell deadlifts");
const v2590 = volumeHand("2026-07-23", "Dumbbell deadlifts");
check(
  "log-volume-2800",
  v2800 === 2800,
  "07-28 DL volume = reps × lb/hand (log: 2800)",
  2800,
  v2800
);
check(
  "log-volume-2590",
  v2590 === 2590,
  "07-23 DL volume = reps × lb/hand (log: 2590/hand)",
  2590,
  v2590
);
check(
  "do-not-double-hands",
  volumeDoubled("2026-07-28", "Dumbbell deadlifts") === 5600 && v2800 === 2800,
  "doubling per-hand would invent 5600; log wrote 2800",
  "2800 not 5600",
  `hand=${v2800} doubled=${volumeDoubled("2026-07-28", "Dumbbell deadlifts")}`
);

const sh810 = volumeHand("2026-07-26", "Shoulder press (single-arm)");
const sh875 = volumeHand("2026-07-19", "Shoulder press (single-arm)");
check("shoulder-810", sh810 === 810, "07-26 shoulder volume (log: 810)", 810, sh810);
check("shoulder-875", sh875 === 875, "07-19 shoulder volume (log: 875)", 875, sh875);

function epley(w, r) {
  return w * (1 + r / 30);
}
function brzycki(w, r) {
  return w / (1.0278 - 0.0278 * r);
}
check(
  "1rm-epley-10x30",
  Math.round(epley(30, 10)) === 40,
  "Epley 10×30 lb = 40 (log: est. 1RM 40)",
  40,
  Math.round(epley(30, 10))
);
check(
  "1rm-brzycki-12x25",
  Math.round(brzycki(25, 12)) === 36,
  "Brzycki 12×25 lb = 36 (log: est. 1RM 36). Epley gives 35.",
  36,
  `brzycki=${brzycki(25, 12).toFixed(2)} epley=${epley(25, 12).toFixed(2)}`
);

const inc28 = csvReps("2026-07-19", "Incline dumbbell bench press");
const inc26 = csvReps("2026-07-13", "Incline dumbbell bench press");
const pct19 = ((inc28 - inc26) / inc26) * 100;
check(
  "incline-7.7pct",
  Math.abs(pct19 - 7.7) < 0.05,
  "07-19 incline +7.7% is reps at the same 60 lb, not load",
  "7.7%",
  pct19.toFixed(2) + "%"
);

const inc27 = csvReps("2026-07-03", "Incline dumbbell bench press");
check(
  "incline-12.5pct-identity",
  inc27 === 27 && Math.abs((27 - 24) / 24 - 0.125) < 1e-9,
  "07-03 incline is 27 reps. (27-24)/24 = 12.5%. Log compared to 06-26 9/9/6, which is not in this file.",
  "27 reps, 12.5% vs 24",
  inc27
);

const bss = sets.filter(
  (s) => s.date === "2026-08-09" && /sprinter/i.test(s.log_name)
);
const bssReps = bss.reduce((a, s) => a + Number(s.reps), 0);
check(
  "per-leg-not-doubled",
  bssReps === 26 && bss.every((s) => s.laterality === "per_leg"),
  "08-09 sprinter BSS logged 6,12,8 /leg. Sheet keeps 26, flags per_leg. Do not *2 into the total.",
  "26 per_leg",
  bssReps + " " + bss[0]?.laterality
);

const skippedDips = sets.filter(
  (s) => s.date === "2026-07-19" && s.log_name === "Dips"
);
check(
  "skipped-dips",
  skippedDips.length === 1 &&
    skippedDips[0].skipped === "yes" &&
    skippedDips[0].reps === "" &&
    !hits.some((h) => h.date === "2026-07-19" && /dip/i.test(h.exercise)),
  "07-19 dips skipped: no reps, no muscle hits",
  "skipped, 0 hits",
  `rows=${skippedDips.length} hits=${hits.filter((h) => h.date === "2026-07-19" && /dip/i.test(h.exercise)).length}`
);

const calf0802 = sets.filter(
  (s) => s.date === "2026-08-02" && /calf/i.test(s.log_name)
);
check(
  "untracked-calves-not-3-reps",
  calf0802.length === 1 &&
    calf0802[0].untracked === "yes" &&
    calf0802[0].reps === "",
  "08-02 '3 sets to exhaustion' is untracked, not a set of 3",
  "untracked blank reps",
  JSON.stringify({ reps: calf0802[0]?.reps, untracked: calf0802[0]?.untracked })
);

const chinPec = hits.filter(
  (h) => /chin/i.test(h.exercise) && h.muscle === "Pectoralis"
);
check(
  "chin-up-no-pecs",
  chinPec.length === 0,
  "chin-ups never debit Pectoralis",
  0,
  chinPec.length
);

const pecMuscles = [
  ...new Set(hits.filter((h) => h.muscle === "Pectoralis").map((h) => h.exercise)),
];
check(
  "pec-only-presses",
  pecMuscles.every((n) => /bench|push-up|dips/i.test(n)) &&
    !pecMuscles.some((n) => /chin|renegade|row|pull/i.test(n)),
  "pec hits are presses only",
  "bench/push-up/dips",
  pecMuscles.join("; ")
);

function daysBetween(a, b) {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
}
const asOf = "2026-08-14";
for (const [muscle, last] of [
  ["Pectoralis", "2026-08-13"],
  ["Lats", "2026-08-10"],
  ["Calves", "2026-08-02"],
]) {
  const row = status.find((s) => s.muscle === muscle);
  const expect = daysBetween(last, asOf);
  check(
    `days-since-${muscle}`,
    Number(row.days_since) === expect && row.last_trained === last,
    `${muscle} last ${last} → ${expect} days before ${asOf}`,
    expect,
    `${row.last_trained} / ${row.days_since}`
  );
}

const perHand0813 = sets.filter(
  (s) => s.date === "2026-08-13" && /incline/i.test(s.log_name)
);
check(
  "per-hand-flag",
  perHand0813.every((s) => s.per_hand === "yes" && s.weight_lb === "60"),
  "08-13 incline is 60 lb/hand, not 120",
  "60 yes",
  [...new Set(perHand0813.map((s) => `${s.weight_lb} ${s.per_hand}`))].join()
);

const varying = sets.filter(
  (s) => s.date === "2026-06-20" && /shoulder/i.test(s.log_name)
);
check(
  "varying-load-2025-25",
  varying.length === 3 && varying[0].weight_lb === "20/25/25",
  "06-20 shoulder @ 20/25/25 is one load string, not three weights on three sets (parser limit)",
  "20/25/25 on each set",
  varying.map((s) => s.weight_lb).join(",")
);

const pass = checks.filter((c) => c.ok).length;
const fail = checks.filter((c) => !c.ok).length;
const out = {
  as_of: asOf,
  log: logPath,
  pass,
  fail,
  checks,
};
fs.writeFileSync(path.join(here, "verify.json"), JSON.stringify(out, null, 2));
console.log(`${pass} passed, ${fail} failed → sheet/verify.json`);
for (const c of checks.filter((c) => !c.ok)) {
  console.log(`FAIL ${c.id}: expected ${c.expected} got ${c.got} (${c.detail})`);
}
