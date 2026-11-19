# WON길

**금융 문의를 이해하고, 정책에 근거해 가장 적절한 상담 경로를 안내합니다.**

사용자의 자연어 문의를 분석한 뒤, 정책 데이터와 고객 상황을 검증하여 상담 채널과 업무 경로를 추천하는 AI 금융 상담 서비스입니다.

> 현재는 프로토타입입니다. 실제 금융거래·상담 연결·예약을 실행하지 않으며, 테스트 가능한 시나리오가 제한되어 있습니다.

## Tech Stack

| 구분 | 기술 |
| --- | --- |
| Frontend | TypeScript, React 19, Vite, Vitest, ESLint |
| Backend | Java 21, Spring Boot 4.1, Spring Web MVC, Spring Data JPA, Bean Validation |
| AI & Data | Spring AI 2.0 (OpenAI), MySQL, 정책 JSON 데이터 |

## 구조

```
won-way/
├── frontend/   # 상담 채팅·추천 결과 화면 (React + Vite)
└── backend/    # 상담 API, 정책 조회, 채널 평가 (Spring Boot)
```

- [frontend](frontend/README.md): 화면 실행 방법과 테스트 시나리오
- [backend](backend/README.md): API 명세, 세션 대화, 정책 DB 적재 방법

## 동작 방식

1. 사용자가 자연어로 금융 문의를 입력합니다.
2. AI가 문의에서 의도와 조건 변경분을 원문 근거와 함께 추출합니다.
3. 서버가 근거를 검증하고 이전 조건과 병합한 뒤, 정책을 조회합니다.
4. 부족한 조건은 추가 질문으로 확인합니다.
5. 챗봇·전화·이메일 등 채널을 평가해 적합한 상담 경로를 추천합니다.

## 빠른 시작

백엔드를 먼저 실행한 뒤 프런트엔드를 실행합니다. DB·모델 연결 정보는 실행 환경에서 직접 제공해야 하며, 비밀값은 Git에 포함하지 않습니다.

```sh
# 1. backend (Windows PowerShell)
cd backend
.\gradlew.bat bootRun
```

```sh
# 2. frontend
cd frontend
npm ci
npm run dev -- --port 5173
```

브라우저에서 <http://127.0.0.1:5173> 에 접속합니다. 자세한 설정(`.env.local` 등)은 각 폴더의 README를 참고하세요.
