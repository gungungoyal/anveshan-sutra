# Project Expectations MVP Plan

## Objective
Implement a strict 7-field CSR Project Expectations page that captures only structured inputs (no free text), saves successfully, marks setup complete, and redirects to `/dashboard`.

## Scope (MVP)
In-scope:
- Single page: `Define Your Project Expectations`
- Exactly 7 required fields
- Allowed controls only: dropdowns + one yes/no toggle
- Single primary action: `Save & Continue`
- On submit: persist data, set `projectSetupCompleted = true`, redirect `/dashboard`

Out-of-scope (explicitly excluded):
- Budget
- KPI uploads
- Text descriptions
- File attachments
- Custom comments

## Current Codebase Status (already present)
- Page exists at `src/app/project/setup/page.tsx` with 7 required controlled inputs.
- Persistence helper exists at `src/lib/services/projectExpectations.ts` using Supabase `project_expectations` table.
- CSR setup guard exists at `src/hooks/useCsrProjectSetupGuard.ts`, currently validating localStorage key `csr_project_setup_<userId>` with required fields.

## Gap Analysis Against Requested Behavior
1. Page text and CTA mismatch:
- Current title/subtitle are close but not exact.
- CTA currently shows `Save Project Expectations` instead of `Save & Continue`.

2. Explicit completion flag missing:
- Requirement says set `projectSetupCompleted = true` on save.
- Current flow persists DB row and redirects but does not set this exact flag.

3. Toggle semantics:
- Current on-ground presence uses dropdown values `yes/no`.
- Requirement asks for a toggle (`Yes/No`).

4. Guard-source mismatch risk:
- Guard currently relies on localStorage object with all fields.
- If submit flow changes but localStorage isn’t updated consistently, redirect loops are possible.

5. Minor content quality issue:
- Some labels/options show mojibake characters (`ƒ?`) and need cleanup to standard `-`/`–`.

## Implementation Plan

### Phase 1: Align UI contract
Tasks:
1. Update page copy in `src/app/project/setup/page.tsx`:
- Title: `Define Your Project Expectations`
- Subtitle: `This helps us evaluate NGOs realistically.`

2. Keep exactly these 7 fields and option sets:
- Beneficiary Range: `100–500`, `500–2,000`, `2,000–10,000`, `10,000+`
- Timeline: `3–6 months`, `6–12 months`, `12–24 months`, `24+ months`
- Geography Type: `Urban`, `Rural`, `Tribal`, `Remote`
- Geography Spread: `Single district`, `Multi-district`, `Multi-state`
- Reporting Intensity: `Simple`, `Moderate`, `Heavy`
- On-Ground Presence Required: `Yes/No` toggle
- Program Nature: `Education`, `Health`, `Livelihood`, `Environment`, `Mixed`

3. Rename submit button text to `Save & Continue`.

Acceptance criteria:
- No extra fields present.
- No free-text inputs/textarea/file upload.
- On-ground presence uses toggle UI, not free text.

### Phase 2: Save and completion state
Tasks:
1. Keep existing DB upsert via `upsertProjectExpectation(...)`.
2. On successful submit, set completion state in localStorage:
- `projectSetupCompleted = true`
- Preserve/update `csr_project_setup_<userId>` with all 7 values (for existing guard compatibility).

3. Redirect to `/dashboard` immediately after successful save (or after a short success toast if preferred).

Acceptance criteria:
- DB row upserted for authenticated CSR user.
- `localStorage.getItem('projectSetupCompleted') === 'true'`.
- `localStorage.getItem('csr_project_setup_<userId>')` contains all 7 fields.
- User lands on `/dashboard` after save.

### Phase 3: Guard consistency hardening
Tasks:
1. Update `useCsrProjectSetupGuard` to accept either:
- `projectSetupCompleted === true` and valid setup payload, or
- existing valid `csr_project_setup_<userId>` payload.

2. Keep required field validation strict (all 7 required non-empty).

Acceptance criteria:
- CSR users with completed setup are not redirected away from dashboard/explore/org pages.
- CSR users without completion are redirected to `/project/setup`.
- No redirect loop when setup is completed.

### Phase 4: Validation and QA
Tasks:
1. Manual test matrix:
- Fresh CSR user: can’t access guarded pages before setup.
- Complete form and submit: redirected to dashboard; guard passes.
- Reload browser: guard still passes.
- Remove one field from localStorage payload: guard redirects back to setup.

2. Run checks:
- `pnpm typecheck`
- `pnpm test` (if existing tests cover related hooks/components)

Acceptance criteria:
- No TypeScript errors.
- Existing tests pass; no regression in CSR navigation flow.

## File-level Task List
1. `src/app/project/setup/page.tsx`
- Normalize labels/options and exact copy.
- Replace on-ground dropdown with yes/no toggle component.
- Ensure submit stores completion flag + setup payload locally after successful upsert.
- CTA label update to `Save & Continue`.

2. `src/hooks/useCsrProjectSetupGuard.ts`
- Add support for `projectSetupCompleted` while retaining 7-field validation.
- Keep redirect behavior only for CSR role.

3. Optional: `src/lib/services/projectExpectations.ts`
- No schema changes required for MVP; keep as-is unless enum normalization is needed.

## Data Contract (MVP)
Payload keys (canonical):
- `beneficiaryRange`
- `timelineMonths`
- `geographyType`
- `geographySpread`
- `reportingIntensity`
- `onGroundPresence`
- `programNature`

Completion flag:
- `projectSetupCompleted: "true"` in localStorage.

## Risks and Mitigations
1. Risk: Option value mismatch between UI and analytics/matching pipeline.
- Mitigation: Keep canonical values stable (`100-500`, `6-12`, etc.) and only improve labels for display.

2. Risk: LocalStorage-only completion can be tampered client-side.
- Mitigation: Continue DB upsert and consider DB-backed completion check in next phase.

3. Risk: Existing mojibake characters cause inconsistent UX.
- Mitigation: normalize all labels in same PR.

## Delivery Sequence
1. Update `project/setup` page UI + submit behavior.
2. Update guard for completion flag compatibility.
3. Run typecheck/tests.
4. Manual smoke test of CSR flow.

## Definition of Done
- The page matches requested layout and field constraints.
- Exactly 7 required structured fields, no free text.
- Submit persists data, sets `projectSetupCompleted = true`, redirects `/dashboard`.
- CSR guard behavior is consistent post-save and after reload.
- Typecheck passes.
