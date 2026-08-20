// fallcorp · company.mjs — the org law of a konomified company.
//
// A konomified company is Simon's business offer made walkable: ~100 seats where agents hold
// the operational ninety and humans hold the ten doors. The LAW (lifted from the operator
// doctrine, where it is enforced by Ed25519 rather than HR): a seat is HUMAN if and only if it
// holds one of the four laws — money movement, legal signature, taste/judgment, or client-trust
// moments. Everything else is an agent seat, and every agent seat DECLARES ITS WIRE: the data,
// keys, or systems that must be plugged in before it runs. A wire declared is honesty; a wire
// hidden is the SaaS lie this company exists to kill.
//
// Pure and total. The page renders what this kernel accepts; the suite makes every rule
// falsifiable; the numbers on the page are DERIVED here, never typed.

export const HUMAN_LAWS = Object.freeze(['money', 'legal', 'taste', 'client-trust']);
export const HUMAN_CAP = 10;   // of 100 — the ten percent is a CAP, not a target

const str = (v) => typeof v === 'string' ? v : '';
const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v)) ? v : null;

/** One seat-type judged. Refusals speak — a bad org chart never half-loads. */
export function validSeat(s) {
  const o = obj(s);
  if (!o) return { ok: false, why: 'not a seat this company can hold' };
  if (!str(o.role).trim()) return { ok: false, why: 'a seat needs a role name' };
  if (!str(o.dept).trim()) return { ok: false, why: `"${str(o.role)}" floats outside every department` };
  if (!Number.isInteger(o.count) || o.count < 1) return { ok: false, why: `"${str(o.role)}" has no real headcount` };
  if (o.kind === 'human') {
    if (!HUMAN_LAWS.includes(o.law)) {
      return { ok: false, why: `"${str(o.role)}" is human but names no law — a human seat holds money, legal, taste, or client-trust, or it is an agent seat wearing a salary` };
    }
  } else if (o.kind === 'agent') {
    if ('law' in o && o.law !== undefined) {
      return { ok: false, why: `"${str(o.role)}" is an agent carrying the law "${str(o.law)}" — an agent cannot hold a door; doors are human by construction` };
    }
    if (!str(o.needs).trim()) {
      return { ok: false, why: `"${str(o.role)}" declares no wire — an agent seat states what data or keys it needs, or it is a promise, not a seat` };
    }
  } else {
    return { ok: false, why: `"${str(o.role)}" is neither agent nor human — there is no third kind of seat` };
  }
  return { ok: true, why: str(o.role) };
}

/**
 * The whole org judged: every seat valid, headcount exactly 100, humans at or under the cap,
 * and every human law actually present somewhere — a company with no one at the money door
 * has not automated finance, it has abandoned it.
 */
export function orgLaw(seats) {
  if (!Array.isArray(seats) || !seats.length) return { ok: false, why: 'no org chart — a company is seats or it is a name' };
  let total = 0, humans = 0;
  const lawsHeld = new Set();
  for (const s of seats) {
    const v = validSeat(s);
    if (!v.ok) return v;
    total += s.count;
    if (s.kind === 'human') { humans += s.count; lawsHeld.add(s.law); }
  }
  if (total !== 100) return { ok: false, why: `the chart holds ${total} seats — this company is exactly 100, derived not asserted` };
  if (humans > HUMAN_CAP) return { ok: false, why: `${humans} human seats is over the cap of ${HUMAN_CAP} — the ninety percent is the offer, and it is enforced here` };
  if (humans < 1) return { ok: false, why: 'zero human seats — the doors need hands; full autonomy is a lie this company refuses to tell' };
  for (const law of HUMAN_LAWS) {
    if (!lawsHeld.has(law)) return { ok: false, why: `no seat holds the ${law} door — automating a door away is abandoning it, not staffing it` };
  }
  return { ok: true, why: `${total} seats · ${total - humans} agents · ${humans} humans at the doors · all four laws held`, agents: total - humans, humans };
}

/** WIRED (a live estate tool stands behind the seat) or DECLARED (the wire is stated, waiting). */
export function wireStatus(seat) {
  const s = obj(seat) || {};
  if (str(s.tool) && str(s.url).startsWith('https://sjgant80-hub.github.io/')) {
    return { state: 'WIRED', say: `runs on ${s.tool} — live, click it` };
  }
  if (str(s.tool)) return { state: 'DECLARED', say: `runs on ${s.tool} — wire it: ${str(s.needs) || 'stated at the seat'}` };
  return { state: 'DECLARED', say: `the wire is declared, not hidden: ${str(s.needs) || 'no tool yet — an honest gap'}` };
}

/**
 * The money slide, derived: the SaaS stack a 100-person firm rents, summed from the researched
 * table, against the sovereign build. Every figure carries the cite rule — estimates are
 * knowledge-dated and must be re-cited before any sales use. Refuses garbage rather than
 * flattering it.
 */
export const CITE = 'prices are knowledge-dated estimates — re-cite every figure from the vendor page before any sales use';
export function costModel(stack) {
  if (!Array.isArray(stack) || !stack.length) return { ok: false, why: 'no cost table — a savings claim without a stack is an invented number' };
  let annualPence = 0;
  const lines = [];
  for (const c of stack) {
    const o = obj(c);
    if (!o || !str(o.category)) return { ok: false, why: 'a cost line without a category is noise' };
    if (!Number.isFinite(o.perUserMo) || o.perUserMo < 0) return { ok: false, why: `"${str(o.category)}" carries no real per-user price` };
    if (!Number.isInteger(o.seats) || o.seats < 0 || o.seats > 100) return { ok: false, why: `"${str(o.category)}" seats must be an integer 0..100` };
    const yearPence = Math.round(o.perUserMo * 100) * 12 * o.seats;
    annualPence += yearPence;
    lines.push({ category: o.category, vendor: str(o.typicalVendor), perUserMo: o.perUserMo, seats: o.seats, yearPence, basis: str(o.basis) });
  }
  return { ok: true, lines, annualPence, monthlyPence: Math.round(annualPence / 12), cite: CITE };
}

export default orgLaw;
