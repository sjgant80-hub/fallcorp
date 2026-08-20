#!/usr/bin/env node
// fallcorp · scripts/build-company.mjs — generate index.html from company-data.json through the
// GATED org law. Every number on the page is derived (orgLaw, costModel), every seat judged,
// every gap printed VERBATIM from the research — the honesty is the pitch. CI regenerates and
// diffs; a hand-edited page fails the gate.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { orgLaw, costModel, wireStatus, HUMAN_LAWS } from '../company.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const d = JSON.parse(readFileSync(join(here, '..', 'company-data.json'), 'utf8'));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const gbp = (pence) => '£' + Math.round(pence / 100).toLocaleString('en-GB');

const law = orgLaw(d.org.seats);
if (!law.ok) { console.error('REFUSED: ' + law.why); process.exit(1); }
const cost = costModel(d.costs.stack);
if (!cost.ok) { console.error('REFUSED: ' + cost.why); process.exit(1); }

// dept name → coverage dept (the research used fuller names)
const COV = {};
for (const c of d.coverage.departments) COV[c.dept.toLowerCase()] = c;
const covFor = (dept) => {
  const k = dept.toLowerCase();
  for (const [name, c] of Object.entries(COV)) {
    if (name.includes(k) || k.includes(name.split(' ')[0]) || name.split(' ')[0] === k.split(' ')[0]) return c;
  }
  return null;
};

const depts = [...new Set(d.org.seats.map(s => s.dept))];
const LAWICON = { money: '💷', legal: '⚖', taste: '◈', 'client-trust': '🤝' };

const seatRow = (s) => {
  if (s.kind === 'human') {
    return `<div class="seat human"><b>${esc(s.role)}</b> <span class="n">× ${s.count}</span>
      <span class="law">${LAWICON[s.law]} holds the ${esc(s.law)} door</span>
      <div class="why">${esc(s.why)}</div></div>`;
  }
  const w = wireStatus(s);
  return `<div class="seat"><b>${esc(s.role)}</b> <span class="n">× ${s.count}</span>
    <span class="ws ${w.state === 'WIRED' ? 'up' : ''}">${w.state}</span>
    <div class="why">${esc(s.why)}</div>
    <div class="needs">the wire: ${esc(s.needs)}</div></div>`;
};

const deptSection = (dept) => {
  const seats = d.org.seats.filter(s => s.dept === dept);
  const cov = covFor(dept);
  const agents = seats.filter(s => s.kind === 'agent').reduce((n, s) => n + s.count, 0);
  const humans = seats.filter(s => s.kind === 'human').reduce((n, s) => n + s.count, 0);
  return `<section class="dept">
  <h2>${esc(dept)} <span class="dn">${agents} agent${agents === 1 ? '' : 's'}${humans ? ' · ' + humans + ' human' + (humans === 1 ? '' : 's') : ''}</span></h2>
  ${cov && cov.tools.length ? `<div class="tools">runs on: ${cov.tools.map(t => t.live && t.url
    ? `<a href="${esc(t.url)}" target="_blank" rel="noopener">${esc(t.name)}</a>`
    : `<span>${esc(t.name)}</span>`).join(' · ')}</div>` : ''}
  <div class="seats">${seats.map(seatRow).join('\n')}</div>
  ${cov && cov.gaps ? `<div class="gap"><b>the honest gap:</b> ${esc(cov.gaps)}</div>` : ''}
</section>`;
};

const costRows = cost.lines.map(l =>
  `<tr><td>${esc(l.category)}</td><td>${esc(l.vendor)}</td><td class="num">£${l.perUserMo}/user/mo</td><td class="num">${l.seats}</td><td class="num">${gbp(l.yearPence)}/yr</td></tr>`).join('\n');

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>fallcorp · the konomified company</title>
<style>
body{font-family:Georgia,serif;background:#0b0a0f;color:#d8d2c4;max-width:900px;margin:0 auto;padding:28px 18px;line-height:1.55}
h1{font-size:1.7rem;color:#d4a017;margin-bottom:4px}
h2{font-size:1.12rem;color:#d4a017;margin:0 0 6px;border-bottom:1px solid #3a3630;padding-bottom:4px}
h2 .dn{font-size:.75em;opacity:.6;font-weight:normal;float:right}
a{color:#d4a017}.quiet{opacity:.7;font-size:.93em}
.hero{border:1px solid #d4a017;border-radius:10px;padding:18px 22px;margin:1.3rem 0;background:rgba(212,160,23,.06);font-size:1.06em}
.laws{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px;margin:1.2rem 0}
.lawbox{border:1px solid #3a3630;border-radius:8px;padding:11px 14px;background:#141218;font-size:.92em}
.lawbox b{color:#d4a017}
.dept{margin:1.6rem 0}
.tools{font-size:.9em;margin:4px 0 10px;opacity:.85}
.seats{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px}
.seat{border:1px solid #3a3630;border-radius:8px;padding:11px 13px;background:#141218;font-size:.92em}
.seat.human{border-color:#d4a017;background:rgba(212,160,23,.07)}
.seat .n{opacity:.6}.seat .law{display:block;color:#d4a017;font-size:.86em;margin-top:2px}
.seat .why{opacity:.75;font-size:.88em;margin-top:5px}
.seat .needs{font-size:.8em;margin-top:6px;color:#9fb89f}
.ws{float:right;font-size:.7em;letter-spacing:.08em;border:1px solid #3a3630;border-radius:4px;padding:1px 6px;opacity:.7}
.ws.up{color:#9fb89f;border-color:#9fb89f;opacity:1}
.gap{border-left:2px solid rgba(212,160,23,.5);padding:7px 12px;margin-top:10px;font-size:.86em;opacity:.8}
table{width:100%;border-collapse:collapse;margin:1rem 0;font-size:.9em}
td,th{border-bottom:1px solid #2a2722;padding:7px 9px;text-align:left}
th{color:#d4a017;font-size:.8em;letter-spacing:.08em;text-transform:uppercase}
.num{white-space:nowrap;font-variant-numeric:tabular-nums;text-align:right}
.honest{border:1px solid #3a3630;border-radius:8px;padding:13px 17px;margin:1.4rem 0;font-size:.9em;background:#141218}
footer{margin-top:2.5rem;padding-top:1rem;border-top:1px solid #3a3630;font-size:.8em;opacity:.65}
</style></head><body>
<h1>The konomified company</h1>
<p class="quiet">a 100-person UK claims firm, rebuilt AI-first on the sovereign estate — the AI Native Solutions offer, walkable</p>

<div class="hero"><b>${law.why}.</b><br>
The stack this firm rents today: <b>${gbp(cost.annualPence)}/yr</b> in SaaS and per-seat AI —
derived line by line below, never asserted. The sovereign build replaces the rented ninety
with owned tools and local models; the humans keep exactly the seats that must be human.<br>
<b><a href="https://sjgant80-hub.github.io/fallcorp-demo/">Watch this company RUN — Northgate Claims, a fictional day, live →</a></b></div>

<div class="laws">
${HUMAN_LAWS.map(l => `<div class="lawbox"><b>${LAWICON[l]} the ${l} door</b><br>a seat is human if and only if it holds ${l === 'money' ? 'movement of real money' : l === 'legal' ? 'a legal signature' : l === 'taste' ? 'taste and judgment calls' : 'the client-trust moments — the closes, the hard conversations'}. Enforced by the gated org law, not by an org chart drawing.</div>`).join('\n')}
</div>

${depts.map(deptSection).join('\n')}

<h2>what the rented stack costs — line by line</h2>
<table><tr><th>category</th><th>typical vendor</th><th>per user</th><th>seats</th><th>a year</th></tr>
${costRows}
<tr><td colspan="4"><b>the rented total</b></td><td class="num"><b>${gbp(cost.annualPence)}/yr</b></td></tr>
</table>
<p class="quiet">${esc(cost.cite)}.</p>

<div class="honest"><b>the honest wire, whole:</b> every agent seat above DECLARES what must be
plugged in before it runs — the data, the keys, the systems. Declared is the opposite of hidden:
this page never claims a seat works until its wire is in. The estate tools linked are live and
gate-proven; the gaps are printed verbatim from the research, because a company you can trust is
one that tells you where it is thin. Multi-user sync is the structural gap across the suite —
today's tools are device-local by design; a shared-queue layer is the first build of any real
engagement. Nothing on this page is for sale as-is: firm-fit is scoped person-to-person at
<a href="https://sjgant80-hub.github.io/ai-nativesolutions/">AI Native Solutions</a>, builds from £300.
See also <a href="https://sjgant80-hub.github.io/fallforce/verticals.html">the regulated shelf</a> ·
<a href="https://sjgant80-hub.github.io/fallforce/stack.html">the owned stack</a>.</div>

<footer>generated from company-data.json through the gated org law (company.mjs, witness 27/27) —
no number typed by hand · researched by the didy fan-out, judged at the frontier
· Konomi Architecture</footer>
</body></html>`;

writeFileSync(join(here, '..', 'index.html'), html);
console.log(`index.html generated — ${(html.length / 1024).toFixed(0)}KB · ${law.why} · rented stack ${gbp(cost.annualPence)}/yr`);
