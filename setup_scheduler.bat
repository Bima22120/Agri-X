@echo off
REM AgriX Windows Task Scheduler Setup Script
REM Run this once as Administrator to register the daily collection task.

SET TASK_NAME=AgriX_DailyDataCollection
SET PYTHON_EXE=python
SET SCRIPT_PATH=f:\AgriX\system\collect_daily.py
SET WORK_DIR=f:\AgriX\system

echo [*] Registering AgriX daily collection task...
echo     Task Name : %TASK_NAME%
echo     Schedule  : Daily at 09:00 WIB (UTC+7 = 02:00 UTC)
echo     Script    : %SCRIPT_PATH%
echo.

REM Delete existing task if any
schtasks /delete /tn "%TASK_NAME%" /f 2>nul

REM Create new scheduled task
REM 09:00 WIB = 02:00 UTC (StartTime in local machine timezone)
schtasks /create ^
  /tn "%TASK_NAME%" ^
  /tr "\"%PYTHON_EXE%\" \"%SCRIPT_PATH%\"" ^
  /sc DAILY ^
  /st 09:00 ^
  /rl HIGHEST ^
  /f ^
  /ru SYSTEM

IF %ERRORLEVEL% EQU 0 (
    echo [OK] Task registered successfully.
    echo.
    echo To verify: schtasks /query /tn "%TASK_NAME%" /v /fo LIST
    echo To run now: schtasks /run /tn "%TASK_NAME%"
) ELSE (
    echo [ERROR] Failed to register task. Run this script as Administrator.
)

pause
