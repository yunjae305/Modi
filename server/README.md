# Modi 서버

Spring Boot 기반 소셜 로그인과 10억 모의투자 API입니다.

## 실행

Java 17 이상을 설치한 뒤 실행합니다.

```powershell
cd server
.\gradlew.bat bootRun
```

프론트엔드는 루트에서 실행합니다.

```powershell
npm.cmd install
npm.cmd run dev
```

## 기본 설정

서버 기본 주소는 `http://localhost:8080`이고 프론트 기본 주소는 `http://localhost:5173`입니다. OAuth 키가 없어도 게스트 로그인으로 10억 모의투자를 사용할 수 있습니다.

## OAuth 설정

루트의 `.env.example`을 `.env`로 복사한 뒤 값을 채웁니다. 서버는 `server` 폴더에서 실행해도 루트 `.env`를 읽습니다.

```bash
cp .env.example .env
```

Google 리디렉션 URI는 `http://localhost:8080/api/auth/oauth/google/callback`입니다.

Kakao 리디렉션 URI는 `http://localhost:8080/api/auth/oauth/kakao/callback`입니다.

## 데이터베이스

기본값은 로컬 H2 파일 DB입니다. MySQL을 쓰려면 다음 값을 지정합니다.

```powershell
$env:DATABASE_URL="jdbc:mysql://localhost:3306/modi?serverTimezone=Asia/Seoul&characterEncoding=UTF-8"
$env:DATABASE_USERNAME="modi"
$env:DATABASE_PASSWORD="..."
$env:DATABASE_DRIVER="com.mysql.cj.jdbc.Driver"
```
