@echo off

REM Test single example: email and phone number already exist separately in DB
curl -X POST http://localhost:3000/identify ^
-H "Content-Type: application/json" ^
-d "{\"email\":\"wendy@example.com\",\"phoneNumber\":\"1234567890\"}"
echo.
echo Request sent. Check output.txt for the response.
pause
