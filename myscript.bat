@echo off
REM Test deployed /identify endpoint

curl -X POST https://contactapp1-fpwu.onrender.com/identify ^
-H "Content-Type: application/json" ^
-d "{\"email\":\"bony@example.com\",\"phoneNumber\":\"1234567890\"}"

pause
