@echo off

if "%~1"=="" (
  echo Usage: %~n0 [dev|staging|prod]
  exit /b 1
)

if "%~1"=="dev" (
  set NODE_ENV=dev
) else if "%~1"=="staging" (
  set NODE_ENV=staging
) else if "%~1"=="prod" (
  set NODE_ENV=prod
) else (
  echo Invalid environment: %~1
  echo Usage: %~n0 [dev|staging|prod]
  exit /b 1
)

echo Environment set to %NODE_ENV%

:: Replace the placeholder '{{ENVIRONMENT}}' with the environment value and save it as 'environment.ts'
setlocal enabledelayedexpansion
(
  for /f "tokens=*" %%a in (environment.template.ts) do (
    set "line=%%a"
    echo !line:{{ENVIRONMENT}}=%NODE_ENV%!
  )
) > environment.ts
endlocal

:: Compile TypeScript code and check for errors
echo Compiling TypeScript code...
tsc
if %errorlevel% neq 0 (
  echo TypeScript compilation failed with error code %errorlevel%.
  exit /b %errorlevel%
)

echo finished
