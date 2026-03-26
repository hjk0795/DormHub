# Review Checklist

## Purpose
Use this checklist when reviewing multilingual DormHub changes so we catch product, UX, and operational regressions beyond text translation.

## Mandatory checks for language additions or updates
- Verify language routing from the home page to every linked student-facing page.
- Verify modals and embedded documents open in the same selected language.
- Compare localized pages against the source page for structural parity, not just text parity.
- Check that images, icons, illustrations, captions, badges, and visual callouts are still present after localization.
- Check that DOM-replacement scripts do not remove media blocks, buttons, numbering, or accessibility labels.
- Check table-of-contents labels, close buttons, aria-labels, and scroll hints in every supported language.
- Check mobile rendering for text overflow, clipped buttons, broken spacing, and missing media.
- Check that emergency vs non-emergency guidance still appears in translated flows where applicable.

## Page-by-page review scope
- Home / onboarding
- Dorm acknowledgement
- Dorm rules
- Recycling guide
- Password policy
- Any linked external or embedded guidance surfaced in the user flow

## Asset parity check
- Count whether the localized page keeps the same number of major images/cards as the source page.
- If a page rewrites HTML with JavaScript, inspect the replacement markup for missing `<img>`, media wrappers, or figure captions.
- If a page uses `innerHTML`, `PAGE_COPY`, or similar DOM replacement, verify preserved non-text blocks by selector, including wrappers such as `.card-images`, labels such as `.korean-sign`, and not just direct `<img>` nodes.
- Do not say "no major issues" for a localized instructional page until image/container parity has been checked against the source page.
- Treat missing photos on instructional pages as a release-blocking issue when the source page includes them.

## Operational review lens
- Ask whether a first-time foreign resident can complete the flow without staff help.
- Ask whether the change reduces or increases avoidable staff questions.
- Ask whether structured data capture or escalation clarity regressed.

## Review output reminder
- Report what works.
- Report confusing or weak points.
- Report missing cases or bugs.
- Report operational risk.
- Recommend fixes in priority order.
