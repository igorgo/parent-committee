@SETLOCAL
@SET PATHEXT=%PATHEXT:;.JS;=;%
npm update && node  "%~dp0\node_modules\bower\bin\bower" update