# PhishSheriff — Human Risk Score Platform (Prototype)

A working prototype of the **Human Risk Dashboard** described in the PhishSheriff
architecture deck — the *MEASURE* pillar of the Human Risk Management platform. It
gives security teams **a unified view of every human risk element and the risk each
person carries**, correlating signals from across the PhishSheriff product suite into
a single Human Risk Score.

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

Awareness / Signals / Settings are stubbed as blueprint placeholders.

---

## Design

Matches the live PhishSheriff console: light canvas, dark navy icon rail, blue
`Phish`+`Sheriff` wordmark, impersonation banner, and the red/amber/green/grey risk
semantics used across the product.
