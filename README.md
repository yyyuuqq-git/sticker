# 달 칭찬스티커 React 전환

기존 순수 HTML/CSS/JavaScript 앱을 React로 단계적으로 전환하는 중입니다.

- `backup-before-react-20261006/`: 전환 전 원본 백업
- `public/legacy/`: React 전환 기간 동안 동작을 유지하는 기존 앱 사본
- `src/`: 새 React 컴포넌트 위치

현재 React 앱은 기존 화면을 안전하게 표시하는 호환 단계입니다. 다음 작업에서 사이드바, 보드 화면, 모달 순으로 React 컴포넌트로 분리합니다.

## 실행 준비

Node.js와 npm을 설치한 뒤 아래 순서로 실행합니다.

```bash
npm install
npm run dev
```
