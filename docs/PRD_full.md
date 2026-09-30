# מערכת ניהול תפעול, בקרה ועבודת שטח — PRD / אפיון פונקציונלי / בסיס לאפיון טכני

גרסה: 1.0
תאריך: 2026-08-16
מחבר: צוות אפיון

## 1. תמצית ביצועית
מטרת המערכת: מערכת SaaS ארגונית (Web + Mobile) לניהול משימות, טפסים, נכסים, תחזוקה מונעת, תהליכי אישור ודיווח, עם יכולות Workflow/Automations ו‑Multi‑tenant.

קהל יעד: רשויות מקומיות, חברות תשתית, חברות Facility Management.

MVP: ליבת תפעול — Authentication/Users/RBAC, Tasks, Form Builder בסיסי + Form Versioning, Mobile עם Offline Sync, Assets, Automations בסיסיות, API + Audit, Multi‑tenant logical isolation.

---

## 2. היקף מוצר — מה כלול במערכת
- Authentication & Security (SSO, MFA, JWT)
- Organization & Site hierarchies
- Full RBAC with Scope (Own/Team/Unit/Org)
- Tasks engine (custom workflows, SLA, history)
- Recurrence engine
- Form Builder (v1) with conditional logic and scoring
- Form Versioning & immutable submissions
- Assets Management with QR
- Mobile Field App (offline, photos, GPS, signature)
- Automations / Workflow triggers
- Notifications (Push/In‑App/Email/SMS/Webhook)
- Dashboards & Report Builder (basic)
- Audit Trail
- REST API + Webhooks
- Multi‑tenant logical separation

---

## 3. מבנה ארגוני ותמיכה בהיררכיה
מערכת תומכת במבנה ארגוני היררכי (Org → Division → Department → Unit → Team → User) ומבנה אתר/נכסים (Region → Complex → Building → Floor → Area → Asset). יש לאפשר שיוך ישויות מרובות לישויות אלו.

---

## 4. Personas (קצרים)
- System Admin
- Ops Manager
- Site Supervisor
- Field Worker
- External Supplier
- Super Admin (Platform)

---

## 5. דרישות עיקריות לפי מודול (תקציר)
ראה הקובץ OpenAPI ו‑DB DDL המצורפים לפרטים טכניים.

- Authentication: SSO (SAML/OIDC), MFA, JWT, password policy
- Users & RBAC: Roles + permissions + scope
- Tasks: lifecycle, assignments, attachments, SLA, escalation
- Form Builder: schema json, conditional logic, versioning
- Automations: trigger → conditions → actions
- Assets: QR, history, maintenance schedule
- Mobile: offline queue, sync, conflict resolution
- Notifications: templating, channels
- Audit: immutable logs

---

## 6. תיאורי מסכים מרכזיים (קצר)
- Admin: Organization Settings, Users List, Roles Manager, Form Builder
- Ops: Tasks List (filters), Task Details, Dashboard Builder
- Mobile: My Tasks (Today/Late/Future/Completed), Task Detail, Fill Form, Asset Scan
- Supplier Portal: limited task view & update

בכל מסך רשום אילו כפתורים/ולידציות/מצבים נדרשים במסגרת הפיתוח (ראה PRD מפורט במקטעים הבאים).

---

## 7. DB — טבלת עיקריות ודיון עיצובי
הצעה לשימוש ב‑Postgres עם jsonb עבור schema גמיש (form schema, answers, metadata) ואינדקסים GIN; row‑level security (RLS) לשכבת הבידול per tenant. קובץ DDL מלא: `db/schema.sql`.

---

## 8. API — OpenAPI skeleton
קובץ: `docs/openapi.yaml` (כלול בפרויקט). API כולל endpoints ל: auth, users, roles, tasks, forms, assets, automations, webhooks, search.

---

## 9. Offline / Sync strategy (תקציר)
- Queue with local ids; revision/ETag per resource; conflict UI כאשר revision mismatch עבור תרחישים קריטיים; last‑writer‑wins להתנהגות פחות קריטית; דרישות הצפנה ושימור זמני רשת.

---

## 10. Security & Multi‑tenant
- TLS, encryption at rest (S3 + KMS), SSO/OIDC, MFA
- Tenant isolation: 추천: shared schema + tenant_id + RLS, או schema‑per‑tenant לפי דרישה רגולטורית
- Audit logs, retention policy, secrets management

---

## 11. Estimation (תקציר)
- Discovery: 4–6 שבועות
- MVP: ~36.5 person‑months (approx) → 4 חודשים בעבודה עם צוות מלא מומלץ
- v1/v2: נוספים לפי roadmap

---

## 12. Acceptance Criteria (MVP)
- End‑to‑end task flow: create form → recurring task → field submit offline → sync → manager sees closure; audit logs exist
- SSO/MFA or documented fallback
- Offline sync tested with 20 devices scenario
- API with tenant isolation

---

## 13. Deliverables added in this PR
- docs/PRD_full.md (זהו הקובץ)
- docs/openapi.yaml (OpenAPI skeleton)
- db/schema.sql (initial DB DDL)

---

## 14. Next steps
- Discovery workshop: שאלון טכני + בחירות טכנולוגיות
- Generate PDF from this Markdown if תרצה/י
- Prepare RFP / tender doc

