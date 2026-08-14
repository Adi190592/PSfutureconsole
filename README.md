# PhishSheriff — Human Risk Score Platform (Prototype)

A working prototype of the **Human Risk Dashboard** described in the PhishSheriff
architecture deck — the *MEASURE* pillar of the Human Risk Management platform. It
gives security teams **a unified view of every human risk element and the risk each
person carries**, correlating signals from across the PhishSheriff product suite into
a single Human Risk Score.

> **Prototype scope.** This is the **console / UX layer**. All data — connected
> integrations, signals/day, coverage, the live incident stream, telemetry — is
> **simulated in-app** (`src/lib/live.ts`, `src/store/integrations.tsx`). Nothing
> yet calls Proofpoint, Purview, CyberArk, etc. Making the integrations *functional*
> requires a backend per connector: OAuth/API credentials, an in-tenant collector,
> vendor API/SIEM parsers, a normalization pipeline, and a datastore. The live hooks
> are structured so a WebSocket/SSE + collector backend can drop in without changing
> the components.

---

## Run it

```bash
npm install
npm run dev        # http://localhost:5175
# or a production build:
npm run build && npm run preview
```

Stack: **Vite + React + TypeScript + Tailwind + Recharts** (the same stack as the live
PhishSheriff console). All data is mock/seeded — no backend required.

---

## The risk model

Each person's **Human Risk Score (0–100)** is a weighted blend of **7 human risk
elements**, one per PhishSheriff product (from the *AI Risk Analyst* architecture):

| Element | Source product | Weight |
|---|---|---|
| Phishing Susceptibility | Email Threat Center | 22% |
| Credential Hygiene | Password Health | 16% |
| Awareness Engagement | Security Awareness | 14% |
| Data Handling | Data Leak Prevention | 14% |
| Browsing Risk | Browser Security | 13% |
| Identity Risk | Identity Risk | 13% |
| AI & Behavior | User Behavior Analytics | 8% |

Score → level thresholds (shared everywhere): **High ≥ 70 · Medium 50–69 · Low 25–49 ·
Secure < 25**.

The model lives in [`src/lib/riskModel.ts`](src/lib/riskModel.ts); the seeded population
and per-person risk stories in [`src/data/people.ts`](src/data/people.ts); org-level
rollups in [`src/data/analytics.ts`](src/data/analytics.ts).

---

## What's in the prototype

- **Human Risk Dashboard** (`/`) — org Human Risk Score, risk distribution, 12-month
  trend, risk-by-element, top high-risk people, department vulnerability, and AI
  Risk Analyst focus areas.
- **People · Risk Register** (`/people`) — every human ranked by risk, with top driver,
  level, and trend; searchable and filterable by level/department.
- **Human Risk Story** (`/people/:id`) — the per-person narrative from the deck:
  score change, key risk drivers, a *What Happened* signal timeline with impact points,
  an AI explanation + confidence, prioritized recommended actions, and peer / org /
  business impact context. (Open **John Doe** for the deck's reference story.)
- **Risk Elements** (`/elements`, `/elements/:key`) — each element's org contribution,
  workforce distribution, and highest-exposure people.
- **Live Operations · SOC** (`/live`) — a single pane over the entire workforce: live-ticking
  signal telemetry, incidents-by-severity, an incident queue with vendor logos and status
  (Open / Investigating / Auto-resolved), incidents-by-source, and a **Workforce Risk Matrix**
  (every employee as a risk-colored tile). SOAR playbooks auto-resolve a share of incidents.
- **Integrations** (`/integrations`) — connect the security tools already in your
  environment. A guided 6-step **connect wizard** for **Email Gateway, DLP, UBA, PIM, PAM**
  (plus native sensors), each showing supported vendors, deployment method, status, signals/day,
  coverage, and which risk element it feeds. Connections are made live in-session.

### Integrations feed the score

PhishSheriff **integrates** these tools — it does not build them. Each connector deploys a
lightweight collector **inside the customer environment**, reads the vendor's API/SIEM stream,
normalizes the signal, and feeds the matching risk element:

| Tool | Feeds element | Example vendors |
|---|---|---|
| Email Gateway (SEG) | Phishing Susceptibility | Proofpoint, Mimecast, Defender for O365 |
| DLP | Data Handling | Microsoft Purview, Forcepoint, Symantec |
| UBA / UEBA | AI & Behavior | Exabeam, Securonix, Sentinel UEBA |
| PIM | Identity Risk | Microsoft Entra PIM, CyberArk, Saviynt |
| PAM | Identity / Credential | CyberArk, BeyondTrust, Delinea |

The live telemetry is simulated by hooks in `src/lib/live.ts` — swap them for a WebSocket/SSE
client to move from prototype to production without touching the components.

Settings is stubbed as a blueprint placeholder.

---

## Design

Matches the live PhishSheriff console: light canvas, dark navy icon rail, blue
`Phish`+`Sheriff` wordmark, impersonation banner, and the red/amber/green/grey risk
semantics used across the product.
