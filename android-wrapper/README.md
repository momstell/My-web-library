# 내 소장도서관 Android v3.0

현재 GitHub Pages 서재를 그대로 사용하면서, 원 서비스 열기 버튼만 Android 네이티브 Intent로 처리하는 개인용 앱입니다.

## 동작
1. 작품 URL을 해당 플랫폼 앱에 직접 전달
2. 작품 딥링크가 지원되지 않으면 해당 앱 자체 실행
3. 앱이 설치되지 않았으면 Google Play 설치 페이지 이동

지원 패키지:
- 리디: com.initialcoms.ridi
- 네이버 시리즈: com.nhn.android.nbooks
- 카카오페이지: com.kakao.page
- 미스터블루: com.mrblue.mrblue

앱의 데이터와 로그인은 기존 웹앱/Supabase를 그대로 사용합니다.
