# DECISIONS.md

## Purpose
This file is mainly maintained by the Builder.

It records approved or materially implemented decisions so that the same decisions do not need to be repeatedly re-debated.

## Rules
- Record only approved or materially implemented decisions
- Do not record speculative ideas or unapproved proposals
- Do not record minor implementation details
- Keep entries short, practical, and reusable
- Focus on product, workflow, data, or scope decisions

## Standing Decisions
- Planner proposes up to 3 tasks; user selects 1
- Builder implements only the approved task
- Reviewer reviews only the added or changed feature scope
- Prefer the smallest high-impact next step
- Avoid large feature expansion unless clearly justified
- Preserve useful operational data where relevant
- Build for current usefulness and future productization
- Builder runs smoke test before handing any preview link to Reviewer
- General screens follow: Builder smoke test → Builder sharable preview → Reviewer manual review
- Sensitive screens follow: Builder protected/appropriate smoke test → Builder review-safe preview prepared as a separate safe artifact → Reviewer manual review through a sharable link to that review-safe deployment
- Reviewer-facing access uses a sharable link for a specific deployment; do not loosen project-wide preview protection just to share review access
- Builder smoke tests on protected previews may use automation bypass or equivalent protected-access methods; do not reuse that path as the normal Reviewer link
- Production deployments must go to `https://dorm-hub.vercel.app/`, and Builder should smoke test the latest preview before production deployment
- `https://dormhub-red.vercel.app/` is not the active production target and should not be used when the user requests production deployment

## Change Log

### 2026-03-23
- Decision: 외부 리뷰는 live preview를 직접 공개하지 않고, review-safe 모드 + 별도 review-safe 배포로 제공한다.
- Reason: 실제 제출 링크, 실제 문의 경로, 운영용 확인 흐름을 노출하지 않으면서도 학생 화면과 주요 흐름은 그대로 리뷰 가능하게 하기 위해서다.
- Impact: Reviewer는 안전한 외부 링크로 UI/흐름을 검토할 수 있고, 실운영 연결은 분리된 상태로 유지된다.

### 2026-03-23
- Decision: 사용자가 프로덕션 배포를 요청하면 `dorm-hub.vercel.app`을 대상으로 하고, 배포 전 최신 프리뷰 smoke test를 먼저 진행한다.
- Reason: 현재 로컬 Vercel 연결은 다른 프로젝트를 가리킬 수 있어 잘못된 프로덕션 도메인으로 배포될 위험이 있기 때문이다.
- Impact: 이후 프로덕션 배포는 실제 운영 도메인 기준으로 진행되고, 잘못된 도메인 배포를 줄일 수 있다.

### 2026-03-25
- Decision: 메인 페이지는 공개 정보와 로그인 필요 정보를 분리하고, 방/후속조치/개인 안내가 필요한 항목은 Google 로그인 진입 화면 뒤로 보낸다.
- Reason: 자주 찾는 안내는 바로 열리게 하면서도 방 단위 처리와 1:1 후속 안내가 필요한 항목은 식별이 가능한 채널로 분리하기 위해서다.
- Impact: 공개 정보 접근 마찰은 줄이고, 시설 문의·방 공지·Wi-Fi·출입 정보 같은 민감 항목은 로그인 필요 상태로 일관되게 안내할 수 있다.

### 2026-03-26
- Decision: 메인 페이지의 로그인 필요 항목은 검사 일정, 개인/호실 공지, 시설 수리 요청, 수리 일정·후속 안내로 한정하고, 나머지 공용 안내는 공개 영역에 유지한다.
- Reason: 현재 운영상 꼭 식별이 필요한 흐름만 로그인 대상으로 좁혀야 첫 방문 학생의 혼란과 접근 마찰을 줄일 수 있기 때문이다.
- Impact: 메인 페이지의 공개 정보와 개인화 기능 구분이 더 명확해지고, 로그인 유도가 필요한 카드도 최소 범위로 유지된다.

### 2026-03-26
- Decision: 메인 진입은 Google 로그인 이후에만 허용하고, 기존 로컬 체크인 정보가 있으면 로그인한 Google 이메일과 함께 서버에 다시 연결한 뒤 메인으로 보낸다.
- Reason: 기기별 localStorage만으로 체크인 여부를 판단하면 브라우저나 기기가 바뀔 때 반복 확인이 생기므로, 이메일 식별과 체크인 기록을 같은 서버 기록으로 묶어야 하기 때문이다.
- Impact: 메인 접근 전 흐름이 로그인 → 체크인 확인으로 통일되고, 기존 로컬 체크인 사용자는 같은 기기에서 다시 전체 체크인을 하지 않아도 서버 기록으로 연결할 수 있다.
