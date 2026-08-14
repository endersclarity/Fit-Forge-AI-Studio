#!/usr/bin/env node
/**
 * Project Dharma workout-log.md into CSVs. The markdown file stays the only log.
 * Run from repo root: node sheet/from-log.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const logPath =
  process.env.WORKOUT_LOG ||
  path.resolve(root, "../Dharma/body/workout-log.md");
const exercisesPath = path.join(here, "exercises.csv");

const MUSCLES = [
  "Pectoralis",
  "Triceps",
  "Deltoids",
  "Lats",
  "Biceps",
  "Rhomboids",
  "Trapezius",
  "Forearms",
  "Quadriceps",
  "Glutes",
  "Hamstrings",
  "Calves",
  "Core",
];

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
  const header = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const o = {};
    header.forEach((h, i) => (o[h] = r[i] ?? ""));
    return o;
  });
}

function csvCell(v) {
  const s = v == null ? "" : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function writeCsv(file, header, rows) {
  const lines = [
    header.join(","),
    ...rows.map((r) => header.map((h) => csvCell(r[h])).join(",")),
  ];
  fs.writeFileSync(file, lines.join("\n") + "\n", "utf8");
}

function splitList(s) {
  return (s || "")
    .split(";")
    .map((x) => x.trim())
    .filter(Boolean);
}

function loadExercises() {
  const rows = parseCsv(fs.readFileSync(exercisesPath, "utf8"));
  const byAlias = new Map();
  for (const ex of rows) {
    const names = [ex.name, ...splitList(ex.aliases.replace(/\|/g, ";"))];
    for (const n of names) {
      const key = n.toLowerCase().trim();
      if (key) byAlias.set(key, ex);
    }
  }
  return { rows, byAlias };
}

function lookupExercise(name, byAlias) {
  const raw = name.trim();
  const key = raw.toLowerCase();
  if (byAlias.has(key)) return byAlias.get(key);
  const stripped = key.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
  if (byAlias.has(stripped)) return byAlias.get(stripped);
  for (const [alias, ex] of byAlias) {
    if (key.startsWith(alias) || alias.startsWith(key)) return ex;
  }
  return null;
}

const SKIP_PREFIXES = [
  "session total",
  "note:",
  "next time:",
  "next targets:",
  "rest vs",
  "open question",
  "also raised:",
  "called it",
  "evidence",
  "shoulders felt",
  "tempo:",
  "two swaps",
  "new exercise:",
  "rest intervals",
  "progression rule",
  "backfilled",
];

function isExerciseLine(text) {
  const t = text.trim().toLowerCase();
  if (SKIP_PREFIXES.some((p) => t.startsWith(p))) return false;
  if (t.startsWith("|")) return false;
  if (/^\*\*/.test(text.trim()) && !text.includes(":")) return false;
  return /^.+:\s+/.test(text);
}

function parseWeight(rest) {
  const m = rest.match(
    /@\s*([\d.]+)(?:\s*\/\s*([\d.]+)\s*\/\s*([\d.]+))?\s*lb(?:\/hand| per arm| on pelvis)?/i
  );
  if (!m) return { weight_lb: "", per_hand: "", weight_raw: "" };
  const perHand = /\/hand|per arm/i.test(m[0]);
  if (m[2] && m[3]) {
    return {
      weight_lb: `${m[1]}/${m[2]}/${m[3]}`,
      per_hand: "yes",
      weight_raw: m[0],
    };
  }
  return {
    weight_lb: m[1],
    per_hand: perHand ? "yes" : "",
    weight_raw: m[0],
  };
}

function parseSets(rest) {
  const skipped = /\bskipped\b/i.test(rest);
  const untracked = /exhaustion|enough \(reps uncounted\)|uncounted|untracked|~?\d+\s*mile/i.test(
    rest
  );
  const laterality = /\/leg/i.test(rest) ? "per_leg" : "";
  if (untracked || skipped) {
    return { reps: [], skipped, untracked: untracked && !skipped, laterality };
  }
  const beforeAt = rest.split(/\s+@\s+/)[0];
  const beforeEm = beforeAt.split(/\s+—\s+/)[0].split(/\s+-\s+/)[0];
  const commaChunk = beforeEm.match(/^[\d,\s\/leg]+/i);
  if (commaChunk) {
    const setNums = [...commaChunk[0].matchAll(/\d+/g)].map((x) => Number(x[0]));
    if (setNums.length) {
      return {
        reps: setNums,
        skipped,
        untracked: false,
        laterality,
      };
    }
  }
  return { reps: [], skipped, untracked: true, laterality };
}

function parseLog(md) {
  const sessions = [];
  let cur = null;
  for (const line of md.split(/\r?\n/)) {
    const header = line.match(/^## (\d{4}-\d{2}-\d{2})\s+—\s+(\S+)/);
    if (header) {
      cur = {
        date: header[1],
        split: header[2].replace(/[()]/g, ""),
        notes: [],
      };
      sessions.push(cur);
      continue;
    }
    if (!cur) continue;
    const bullet = line.match(/^- (.+)$/);
    if (!bullet) {
      if (line.trim() && !line.startsWith("#") && !line.startsWith(">")) {
        cur.notes.push(line.trim());
      }
      continue;
    }
    const body = bullet[1].trim();
    if (!isExerciseLine(body)) {
      cur.notes.push(body);
      continue;
    }
    const colon = body.indexOf(":");
    const name = body.slice(0, colon).trim();
    const rest = body.slice(colon + 1).trim();
    if (!cur.lifts) cur.lifts = [];
    cur.lifts.push({ name, rest });
  }
  return sessions;
}

function todayIso() {
  const d = new Date();
  const z = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

function daysBetween(a, b) {
  const ms = Date.parse(b) - Date.parse(a);
  return Math.round(ms / 86400000);
}

const { rows: exercises, byAlias } = loadExercises();
if (!fs.existsSync(logPath)) {
  console.error(`workout log not found: ${logPath}`);
  process.exit(1);
}
const sessions = parseLog(fs.readFileSync(logPath, "utf8"));

const setRows = [];
const sessionRows = [];
const hitRows = [];
const unmatched = [];
let seq = 0;

for (const s of sessions) {
  let totalReps = 0;
  let liftCount = 0;
  for (const lift of s.lifts || []) {
    const ex = lookupExercise(lift.name, byAlias);
    if (!ex) unmatched.push({ date: s.date, name: lift.name });
    const { reps, skipped, untracked, laterality } = parseSets(lift.rest);
    const w = parseWeight(lift.rest);
    liftCount++;

    function debit(setNo, repCount) {
      if (!ex || skipped) return;
      seq += 1;
      for (const muscle of splitList(ex.primary)) {
        hitRows.push({
          date: s.date,
          split: s.split,
          exercise_id: ex.id,
          exercise: ex.name,
          set: setNo,
          reps: repCount,
          weight_lb: w.weight_lb,
          muscle,
          role: "primary",
          seq,
        });
      }
      for (const muscle of splitList(ex.secondary)) {
        hitRows.push({
          date: s.date,
          split: s.split,
          exercise_id: ex.id,
          exercise: ex.name,
          set: setNo,
          reps: repCount,
          weight_lb: w.weight_lb,
          muscle,
          role: "secondary",
          seq,
        });
      }
    }

    if (!reps.length) {
      setRows.push({
        date: s.date,
        split: s.split,
        exercise_id: ex?.id || "",
        exercise: ex?.name || lift.name,
        log_name: lift.name,
        set: "",
        reps: "",
        weight_lb: w.weight_lb,
        per_hand: w.per_hand,
        laterality,
        skipped: skipped ? "yes" : "",
        untracked: untracked ? "yes" : "",
        raw: lift.rest,
      });
      if (untracked && !skipped) debit("", "");
      continue;
    }
    reps.forEach((r, i) => {
      totalReps += r;
      setRows.push({
        date: s.date,
        split: s.split,
        exercise_id: ex?.id || "",
        exercise: ex?.name || lift.name,
        log_name: lift.name,
        set: i + 1,
        reps: r,
        weight_lb: w.weight_lb,
        per_hand: w.per_hand,
        laterality,
        skipped: "",
        untracked: "",
        raw: lift.rest,
      });
      debit(i + 1, r);
    });
  }
  sessionRows.push({
    date: s.date,
    split: s.split,
    lifts: liftCount,
    sets: setRows.filter((r) => r.date === s.date && r.reps !== "").length,
    total_reps: totalReps,
    notes: (s.notes || []).join(" ").slice(0, 400),
  });
}

const asOf = todayIso();
const statusRows = MUSCLES.map((muscle) => {
  const hits = hitRows.filter((h) => h.muscle === muscle);
  if (!hits.length) {
    return {
      muscle,
      last_trained: "",
      days_since: "",
      last_role: "",
      last_exercise: "",
      sessions_7d: 0,
      primary_sets_7d: 0,
    };
  }
  hits.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return Number(b.seq) - Number(a.seq);
  });
  const last = hits[0];
  const last7 = hits.filter((h) => daysBetween(h.date, asOf) <= 7);
  const sessions7 = new Set(last7.map((h) => h.date)).size;
  const primary7 = last7.filter((h) => h.role === "primary").length;
  return {
    muscle,
    last_trained: last.date,
    days_since: daysBetween(last.date, asOf),
    last_role: last.role,
    last_exercise: last.exercise,
    sessions_7d: sessions7,
    primary_sets_7d: primary7,
  };
});

writeCsv(
  path.join(here, "sessions.csv"),
  ["date", "split", "lifts", "sets", "total_reps", "notes"],
  sessionRows
);
writeCsv(
  path.join(here, "sets.csv"),
  [
    "date",
    "split",
    "exercise_id",
    "exercise",
    "log_name",
    "set",
    "reps",
    "weight_lb",
    "per_hand",
    "laterality",
    "skipped",
    "untracked",
    "raw",
  ],
  setRows
);
writeCsv(
  path.join(here, "hits.csv"),
  [
    "date",
    "split",
    "exercise_id",
    "exercise",
    "set",
    "reps",
    "weight_lb",
    "muscle",
    "role",
  ],
  hitRows
);
writeCsv(
  path.join(here, "muscle_status.csv"),
  [
    "muscle",
    "last_trained",
    "days_since",
    "last_role",
    "last_exercise",
    "sessions_7d",
    "primary_sets_7d",
  ],
  statusRows
);
writeCsv(
  path.join(here, "meta.csv"),
  ["key", "value"],
  [
    { key: "canonical_log", value: logPath },
    { key: "role", value: "projection. do not log here. write in workout-log.md then rerun from-log.mjs" },
    { key: "as_of", value: asOf },
    { key: "sessions", value: sessionRows.length },
    { key: "sets", value: setRows.length },
    { key: "unmatched_lifts", value: unmatched.length },
  ]
);

if (unmatched.length) {
  writeCsv(
    path.join(here, "unmatched.csv"),
    ["date", "name"],
    unmatched
  );
  console.error(`unmatched lifts: ${unmatched.length} -> sheet/unmatched.csv`);
} else if (fs.existsSync(path.join(here, "unmatched.csv"))) {
  fs.unlinkSync(path.join(here, "unmatched.csv"));
}

console.log(
  `wrote ${sessionRows.length} sessions, ${setRows.length} set rows, ${hitRows.length} muscle hits from ${logPath}`
);
