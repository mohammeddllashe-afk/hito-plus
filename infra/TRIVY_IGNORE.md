# Trivy ignore policy for hito-plus

This document explains how to manage the Trivy ignore file used by CI to suppress known / accepted vulnerabilities.

Location
- Root ignore file: `.trivyignore`

Purpose
- When Trivy reports CVEs that are known false positives, non-exploitable in our context, or accepted for a specific business reason, list them in `.trivyignore` so CI can pass while tracking the accepted exceptions.

Format
- Each line should contain the CVE identifier. An optional comment starting with `#` should explain the reason and reference an issue/PR or mitigation plan. Example:

  CVE-2021-44228  # false positive: log4j not used by runtime; related issue #123

- Blank lines and lines starting with `#` are ignored.

Procedure to add an ignore entry
1. Open a PR adding the CVE to `.trivyignore`.
2. In the PR description, explain why this CVE is safe to ignore and link to any ticket or remediation plan.
3. After review and approval, merge the PR.
4. Periodically re-evaluate ignored CVEs and remove them when fixed upstream.

Running Trivy locally using the ignore file
- Install Trivy (https://aquasecurity.github.io/trivy/v0.38.0/getting-started/installation/)
- Example run:
  trivy image --severity CRITICAL,HIGH --ignorefile .trivyignore <image-name>

CI integration
- The GitHub Actions workflow `.github/workflows/deploy.yml` passes the ignore file to the Trivy action. Update the ignore file there if the filename or path changes.

Security notes
- Use `.trivyignore` sparingly — prefer to fix issues upstream or update base images.
- Keep clear justification and ownership for every ignored CVE.
