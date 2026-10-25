# 내 소장도서관 v5.2 캐릭터 표지 101종 확장 테스트

v5.2 확장 APK는 v4.9.3, v5.1, v5.1.1과 다른 Android application ID(`com.momstell.myweblibrary.v52test`)를 사용하므로 앱 데이터를 건드리지 않고 함께 설치할 수 있습니다. 표지 스튜디오와 웹앱 파일은 APK 안에 담아 테스트 브랜치 버전으로 실행합니다.

## 빌드

```sh
gradle -p android-wrapper assembleDebug
```

빌드 전 `preBuild` 작업이 루트의 앱 페이지, 패치 스크립트, 101개 표지 자산을 Android assets로 복사합니다. 테스트 APK는 GitHub Actions의 `cover-studio-v5.2-101-character-covers-debug` 아티팩트로 생성됩니다.

## 표지 스튜디오

- 실제 이미지가 들어간 WebP 캐릭터 표지 101종: 남자 40, 여자 30, 커플·가족 31
- 핵심 추천 표지 12종 빠른 보기
- 분위기와 장르·테마·의상 필터, 표지명 검색
- 내 이미지 등록 유지
- 제목과 작가명을 합성한 미리보기 및 책장 저장
- 샘플 작품 6권으로 첫 실행 화면 확인

v4.9.3의 application ID와 소스 파일은 이 테스트 브랜치에서 변경하지 않습니다.
