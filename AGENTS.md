# DormHub Agent Notes

## Purpose
- Treat this GitHub repo as the primary handoff surface for future agent work.
- Make the repository state easy for another agent to resume without hidden context.

## Checkpoint Workflow
- Do not wait until the very end of a long session to sync work.
- When a meaningful milestone is reached, create a commit and push to `main`.
- Good checkpoint moments include:
- after a user-visible feature is completed
- after a risky refactor is stabilized
- after deployment-related changes are verified
- before stopping with partially completed but coherent progress
- Avoid noisy micro-commits for every tiny edit. Prefer solid milestone commits.

## Security Defaults
- Always treat security as a default requirement, even if the user does not restate it.
- Before committing or pushing, quickly check for:
- API keys, tokens, passwords, private keys, secrets
- `.env` files or credential dumps
- accidental debug output containing auth headers or tokens
- unnecessary personal or operational data in public files
- Keep ignored files such as local deployment metadata and OS files out of Git.
- If a value must be public for product reasons, keep it intentional and minimal.

## Collaboration Expectations
- Prefer clear commit messages that explain the milestone.
- If Git transport behaves unexpectedly, use a safe workaround and leave the repo in a clean, resumable state.
- Preserve the user's existing work and avoid destructive Git commands unless explicitly requested.
