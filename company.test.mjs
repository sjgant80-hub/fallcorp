// fallcorp · company.test.mjs — the org law, every rule falsifiable.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HUMAN_LAWS, HUMAN_CAP, validSeat, orgLaw, wireStatus, costModel, CITE } from './company.mjs';

const agentSeat = (role, count, extra) => ({ role, dept: 'ops', kind: 'agent', count, needs: 'case feed + templates', ...extra });
const humanSeat = (role, count, law) => ({ role, dept: 'leadership', kind: 'human', count, law });

const LEGAL_ORG = () => [
  agentSeat('intake didy', 30), agentSeat('case didy', 40), agentSeat('drafting didy', 21),
  humanSeat('finance director', 2, 'money'), humanSeat('compliance officer', 2, 'legal'),
  humanSeat('md', 1, 'taste'), humanSeat('client partners', 4, 'client-trust'),
];

test('THE FOUR LAWS ARE THE ONLY DOORS — and both directions of the seat rule hold', () => {
  assert.deepEqual([...HUMAN_LAWS], ['money', 'legal', 'taste', 'client-trust']);
  assert.match(validSeat({ role: 'cfo', dept: 'fin', kind: 'human', count: 1 }).why, /agent seat wearing a salary/);
  assert.match(validSeat({ role: 'bot', dept: 'ops', kind: 'agent', count: 1, needs: 'x', law: 'money' }).why, /an agent cannot hold a door/);
  assert.match(validSeat(agentSeat('bot', 1, { needs: '  ' })).why, /a promise, not a seat/);
  assert.match(validSeat({ role: 'ghost', dept: 'ops', kind: 'contractor', count: 1 }).why, /no third kind of seat/);
  assert.equal(validSeat(humanSeat('fd', 1, 'money')).ok, true);
});

test('ORGLAW: exactly 100, humans capped, every door held — each violation speaks', () => {
  const ok = orgLaw(LEGAL_ORG());
  assert.equal(ok.ok, true, ok.why);
  assert.equal(ok.agents, 91);
  assert.equal(ok.humans, 9);
  assert.match(ok.why, /91 agents · 9 humans at the doors · all four laws held/);

  const ninetyNine = LEGAL_ORG(); ninetyNine[0].count = 29;
  assert.match(orgLaw(ninetyNine).why, /holds 99 seats — this company is exactly 100/);

  const overCap = LEGAL_ORG(); overCap[6] = humanSeat('client partners', 6, 'client-trust'); overCap[2].count = 19;
  assert.match(orgLaw(overCap).why, /11 human seats is over the cap of 10/);

  const doorless = LEGAL_ORG().filter(s => s.law !== 'legal'); doorless[2].count = 23;
  assert.match(orgLaw(doorless).why, /no seat holds the legal door — automating a door away is abandoning it/);

  const robot = LEGAL_ORG().map(s => s.kind === 'human' ? agentSeat(s.role, s.count) : s);
  assert.match(orgLaw(robot).why, /zero human seats — .* full autonomy is a lie this company refuses to tell/);

  assert.match(orgLaw([]).why, /a company is seats or it is a name/);
});

test('THE CAP IS TEN EXACTLY — ten humans stand, eleven fall', () => {
  const ten = LEGAL_ORG(); ten[6] = humanSeat('client partners', 5, 'client-trust'); ten[2].count = 20;
  const v = orgLaw(ten);
  assert.equal(v.ok, true, v.why);
  assert.equal(v.humans, HUMAN_CAP);
});

test('WIRESTATUS: a live estate url is WIRED, everything else is DECLARED with the wire said', () => {
  assert.equal(wireStatus({ tool: 'fallclaim', url: 'https://sjgant80-hub.github.io/fallclaim/' }).state, 'WIRED');
  const d = wireStatus({ tool: 'fallclaim', url: 'https://evil.example/fallclaim', needs: 'case export' });
  assert.equal(d.state, 'DECLARED', 'a foreign url is not a live estate tool');
  assert.match(d.say, /wire it: case export/);
  assert.match(wireStatus({ needs: 'ATS csv' }).say, /declared, not hidden: ATS csv/);
  assert.match(wireStatus({}).say, /an honest gap/);
});

test('COSTMODEL DERIVES TO THE PENNY AND CARRIES THE CITE RULE — garbage refused, never flattered', () => {
  const m = costModel([
    { category: 'case management', typicalVendor: 'Leap-class', perUserMo: 120, seats: 60, basis: 'knowledge-cutoff' },
    { category: 'comms suite', typicalVendor: 'M365-class', perUserMo: 20.5, seats: 100, basis: 'knowledge-cutoff' },
  ]);
  assert.equal(m.ok, true);
  assert.equal(m.lines[0].yearPence, 120 * 100 * 12 * 60);
  assert.equal(m.lines[1].yearPence, 2050 * 12 * 100);
  assert.equal(m.annualPence, 8640000 + 2460000);
  assert.equal(m.monthlyPence, Math.round(m.annualPence / 12));
  assert.equal(m.cite, CITE);
  assert.match(m.cite, /re-cite every figure/);
  assert.match(costModel([]).why, /a savings claim without a stack is an invented number/);
  assert.match(costModel([{ category: 'x', perUserMo: NaN, seats: 5 }]).why, /no real per-user price/);
  assert.match(costModel([{ category: 'x', perUserMo: 5, seats: 101 }]).why, /seats must be an integer 0..100/);
});

// ─── round two: the gate found eight gaps — each dies here ───

test('ONE HUMAN IS NOT ZERO — a one-human org fails on the doors it cannot hold, never as empty', () => {
  const one = [agentSeat('intake didy', 60), agentSeat('case didy', 39), humanSeat('md', 1, 'money')];
  const v = orgLaw(one);
  assert.equal(v.ok, false);
  assert.match(v.why, /no seat holds the legal door/, 'one human passes the headcount floor and fails honestly on coverage: ' + v.why);
});

test('FREE TIERS AND UNUSED CATEGORIES ARE REAL COST LINES — zero is a price and a seat count', () => {
  const m = costModel([{ category: 'free tool', typicalVendor: 'oss', perUserMo: 0, seats: 0, basis: 'free' }]);
  assert.equal(m.ok, true);
  assert.equal(m.lines[0].yearPence, 0);
  assert.match(costModel([{ category: 'x', perUserMo: 5, seats: 2.5 }]).why, /0\.\.100/, 'fractional seats are not seats');
});

test('FRACTIONAL AND ZERO HEADCOUNTS ARE REFUSED — a half-person is not a hire', () => {
  assert.match(validSeat(agentSeat('half', 1, { count: 0 })).why, /no real headcount/);
  assert.match(validSeat(agentSeat('half', 1, { count: 1.5 })).why, /no real headcount/);
});

test('AN EXPLICITLY-UNDEFINED LAW ON AN AGENT IS TOLERATED — only a NAMED law is a held door', () => {
  const v = validSeat({ role: 'bot', dept: 'ops', kind: 'agent', count: 1, needs: 'x', law: undefined });
  assert.equal(v.ok, true, 'undefined is absence, not a door: ' + v.why);
});

test('A FUNCTION IS NOT A SEAT — the impostor refuses as not-a-seat', () => {
  const impostor = Object.assign(function seat() {}, { role: 'cfo', dept: 'fin', kind: 'human', count: 1, law: 'money' });
  assert.match(validSeat(impostor).why, /not a seat this company can hold/);
});

test('FUZZ: total on garbage', () => {
  validSeat(null); validSeat(7); validSeat(function seat() {});
  orgLaw(null); orgLaw('x'); orgLaw([null]);
  wireStatus(null); wireStatus(7); costModel(null); costModel('x'); costModel([null]);
  assert.match(orgLaw([null]).why, /not a seat/);
  assert.ok(true);
});
