@AGENTS.md

# 삭제 방지 규칙

- 파일이나 폴더를 삭제하기 전에 반드시 사용자에게 한글로 확인을 받을 것
- src/, messages/, public/ 폴더의 핵심 파일은 절대 삭제하지 말 것
- Supabase 테이블 DROP, 데이터 DELETE는 절대 실행하지 말 것
- git reset --hard, git clean -f 같은 파괴적 명령은 사용하지 말 것
- 대량 수정(10개 파일 이상) 시 사전에 목록을 보여주고 확인받을 것

# 작업 규칙

- 코드 변경 후 항상 커밋 + push까지 진행할 것 (사용자가 Vercel 웹에서 확인함)
- UI 수정 요청 시 바탕화면 img 폴더(`/mnt/c/Users/jbshi/Desktop/img/`)의 최신 스크린샷을 먼저 확인할 것

## 디자인 규칙
- UI 작업 시 반드시 ./DESIGN.md를 참조할 것
- DESIGN.md에 정의된 색상, 타이포그래피, 컴포넌트 스타일을 우선 적용
- 디자인 토큰을 Tailwind CSS 클래스 또는 CSS 변수로 변환해서 사용
