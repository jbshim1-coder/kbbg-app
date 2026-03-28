@AGENTS.md

# 삭제 방지 규칙

- 파일이나 폴더를 삭제하기 전에 반드시 사용자에게 한글로 확인을 받을 것
- src/, messages/, public/ 폴더의 핵심 파일은 절대 삭제하지 말 것
- Supabase 테이블 DROP, 데이터 DELETE는 절대 실행하지 말 것
- git reset --hard, git clean -f 같은 파괴적 명령은 사용하지 말 것
- 대량 수정(10개 파일 이상) 시 사전에 목록을 보여주고 확인받을 것
