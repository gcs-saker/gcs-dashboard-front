# GCS SAKER 대시보드 목업

디자인 검수와 화면 전달을 위한 React + Vite 프론트엔드 목업입니다. 이 버전은 백엔드 API, 인증 서버, HLS, WebRTC, MediaMTX에 연결하지 않습니다.

## 빠른 시작

```bash
npm install
npm run dev
```

브라우저에서 Vite가 출력한 로컬 주소로 접속합니다. 별도의 계정, 데이터베이스, 스트리밍 서버는 필요하지 않습니다.

## 목업 동작

- 기본 접속 시 `operator01` 목업 사용자로 대시보드에 바로 진입합니다.
- 로그인과 회원가입 화면은 실제 서버 요청 없이 로컬 목업 응답으로 동작합니다.
- 스트림 목록, 서버 상태, 지도 좌표, 텔레메트리는 고정 목업 데이터를 사용합니다.
- 실시간 영상과 웹캠 송출 화면은 실제 HLS/WebRTC 연결 없이 디자인 검수용 목업 상태를 표시합니다.

## 사용 가능한 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 정적 프론트엔드 빌드 |
| `npm run typecheck` | TypeScript 타입 검사 |
| `npm test` | 테스트 실행 |
| `npm run test:coverage` | 커버리지 포함 테스트 실행 |
| `npm run audit` | 보안 취약점 감사 |

## Docker 정적 서빙

```bash
docker build -t gcs-dashboard-mock .
docker run -p 3000:3000 gcs-dashboard-mock
```

Docker 이미지는 빌드된 정적 프론트엔드만 Nginx로 서빙합니다.

## 기술 스택

- **React 19** + **TypeScript**
- **Vite 7**
- **React Router**
- **Recharts**
- **Leaflet**
- **Three.js / @react-three/fiber**
