## PR: Proposed change to .trivyignore

This repository includes an automated security scan (Trivy). Changes to `.trivyignore` must be accompanied by a clear justification and remediation plan.

Please fill the sections below before submitting the PR.

### Summary of change
- Which CVE(s) are being added/removed from `.trivyignore`?

### Justification (required)
- Why is this CVE safe to ignore in our context?
- Is it a false positive, or is there a compensating control in place?
- Provide links to evidence (package metadata, upstream issue, vendor advisory).

### Mitigation plan and timeline (required)
- How will this be fixed long-term? (e.g., upgrade base image, patch dependency)
- Expected ETA for remediation:

### Impact assessment (required)
- Which services/components are affected?
- Any runtime exposure risk to customers?

### Approval checklist
- [ ] I have read infra/TRIVY_IGNORE.md and followed the policy
- [ ] I have added rationale and linked issues/tickets
- [ ] I agree to re-evaluate and remove the ignore entry when a fix is available

### Reviewer suggestions / Owners
- Please request review from infra/code‑owners or security team.

**Note:** PRs that modify `.trivyignore` without filling this template may be closed until the required information is provided.
