@echo off
chcp 65001 > nul
title Attack on Titan Archive Server
echo ============================================================
echo   موسوعة وأرشيف هجوم العمالقة الشامل - Attack on Titan Archive
echo   جاري فتح الموقع في المتصفح وتشغيل الخادم المحلي...
echo   الرابط: http://localhost:8000
echo   (أبقِ هذه النافذة مفتوحة أثناء تصفحك للموقع)
echo ============================================================
start http://localhost:8000
python -m http.server 8000
pause
