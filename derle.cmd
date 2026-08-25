@echo off
chcp 65001 >nul
setlocal
title Notex - APK derleme

rem  Notex'i APK olarak derler. Cift tiklanabilir.
rem
rem  Gradle'i asistan oturumunun kabugundan calistirmak mumkun degil (loopback
rem  soketi acamiyor), o yuzden derleme her zaman kullanicinin kendi
rem  terminalinden gecer. Bu dosya o adimlari tek yere topluyor.
rem
rem  Ek Gradle secenekleri dogrudan aktariliyor, ornegin:
rem      derle.cmd -PreactNativeArchitectures=arm64-v8a
rem      derle.cmd -x lintVitalAnalyzeRelease

cd /d "%~dp0"

echo.
echo === Notex APK derlemesi ===
echo.

rem --- JDK: Android Studio'nunki yeterli ---
if not defined JAVA_HOME set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
if not exist "%JAVA_HOME%\bin\java.exe" (
  echo HATA: JDK bulunamadi.
  echo   Aranan yer: %JAVA_HOME%
  echo   Android Studio baska bir yerdeyse JAVA_HOME'u elle ayarla.
  goto :son
)
echo JDK   : %JAVA_HOME%

rem --- native klasor: yoksa uret ---
if not exist "android\gradlew.bat" (
  echo android klasoru yok, prebuild calisiyor...
  call npx expo prebuild -p android
  if errorlevel 1 goto :son
)

rem --- local.properties: prebuild her zaman uretmiyor ---
rem  Java properties dosyasinda ters bolu kacis karakteridir: "C:\Users" yazarsan
rem  yol "C:Users" olarak okunur ve derleme "Invalid file path" ile duser.
rem  Bu yuzden egik bolu ile yaziliyor.
if not exist "android\local.properties" (
  powershell -NoProfile -Command "'sdk.dir=' + ($env:LOCALAPPDATA + '\Android\Sdk').Replace('\','/') | Set-Content -Encoding ascii 'android\local.properties'"
  echo local.properties yazildi.
)

echo.
echo Derleme basladi. Ilk sefer birkac dakika surer.
echo.

cd android
call gradlew.bat assembleRelease %*
set "ERR=%ERRORLEVEL%"
cd ..

echo.
if not "%ERR%"=="0" (
  echo Derleme BASARISIZ. Gradle cikis kodu: %ERR%
  echo   Lint araya girip kestiyse: derle.cmd -x lintVitalAnalyzeRelease
  goto :son
)

set "APK=%CD%\android\app\build\outputs\apk\release\app-release.apk"
if not exist "%APK%" (
  echo Gradle basarili dedi ama APK bulunamadi:
  echo   %APK%
  goto :son
)

echo Derleme tamam.
echo   %APK%
for %%F in ("%APK%") do echo   Boyut: %%~zF bayt
echo.
echo Telefona kopyalayip kurmak yeterli; surum kodu degismediyse
echo notlarin ve gizli desenin korunur.
echo.

choice /c EH /n /m "Klasoru acayim mi? (E/H): "
if errorlevel 2 goto :son
explorer /select,"%APK%"

:son
echo.
pause
endlocal
