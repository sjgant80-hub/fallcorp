# ◊ FallCorp

> **The bundled sovereign SMB stack. 17 organs in one shell. Shared identity. Konomi SSO. MIT.**
> Replace your £36k/year SaaS bill with one tab.

[**Live shell →**](https://sjgant80-hub.github.io/fallcorp/) · [Source](https://github.com/sjgant80-hub/fallcorp) · [Estate](https://ai-nativesolutions.com)

## What it is

FallCorp is a single-file HTML shell that bundles 17 sovereign organs into a unified workspace:

- Sidebar nav, all organs grouped by category (Sales, Marketing, Finance, Ops, HR, Compliance, Strategy)
- Ctrl+K command palette, jump to any organ by name
- Shared Konomi identity, one Ed25519 keypair across every organ (your fork is your SSO)
- Brand config, company name and accent colour persisted locally, propagates across organs
- fall-signal BroadcastChannel bus, contacts upserted in one organ ripple to the others
- No backend, no telemetry, no cloud, everything runs in your browser

## The bundled 17

| Category | Organ | Replaces |
|---|---|---|
| Sales · CRM | FallCRM | HubSpot / Salesforce |
| Sales · Scheduling | FallSlot | Calendly / Acuity |
| Sales · Forms | FallForm | Typeform / JotForm |
| Marketing · Email | FallList | Mailchimp / Klaviyo |
| Marketing · LinkedIn | FallPost | Buffer / Hootsuite |
| Marketing · Carousel | FallCarousel | Canva / Adobe Express |
| Marketing · Pods | FallGuild | Lempod / Podawaa |
| Marketing · Audio | AudioFabric | Descript / Riverside |
| Finance · Invoicing | FallInvoice | Stripe Billing / Chargebee |
| Finance · AP | FallAP | Bill.com / Tipalti |
| Finance · Cashflow | FallFlow | Float / Agicap |
| Ops · Meetings | FallScribe | Granola / Otter |
| HR · ATS | FallHire | BambooHR / Greenhouse |
| Compliance · AI Act | fall-euaiact | OneTrust AI / Credo |
| Legal · UK | GroundLevel | LegalZoom / Rocket Lawyer |
| Strategy | OPERATOR | McKinsey Solutions |
| Personal · AI | Botler | Mem / Rewind |
| Rights · Subs | FallBack | Rocket Money / Truebill |
| Audit | FallStack | this stack |

## Brand it

The sidebar logo and topbar title read from a local config. Click Brand in the top-right, set your company name and tagline, save, the shell rebrands for your team.

## Identity is shared

Click Identity in the top-right, the shell mints (or imports) a Konomi Ed25519 keypair, this is your unified identity across every organ that loads in the shell. Private key non-extractable. Public key acts as your fork address.

## Architecture

- Single HTML file (~900 LOC)
- IndexedDB for keys, brand, contacts, signal log
- BroadcastChannel `fall-signal` for cross-organ events
- Organs load as iframes (where the organ allows it) or open in new tab via the topbar button
- nas-shim + audit-shim baked

## Run locally

```bash
git clone https://github.com/sjgant80-hub/fallcorp.git
cd fallcorp
# open index.html in any modern browser, works from file://
```

## Sister tools

- [FallStack](https://sjgant80-hub.github.io/fallstack/) - audit your current SaaS bill against the bundled stack
- [Full estate](https://sjgant80-hub.github.io/fall-registry/) - 140+ tools

## Licence

MIT. Forever. Fork it. Brand it. Ship it.

> For the people. Not the few.

*prime 1327 · MianoCube lineage*
