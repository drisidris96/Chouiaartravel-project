#!/bin/bash
# ============================================================
#  CHOUIAAR TRAVEL AGENCY — سكريبت الإعداد على VPS
#  يعمل على: Ubuntu 20.04 / 22.04 / Debian 11+
# ============================================================
set -e

echo "==> تثبيت Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "==> تثبيت pnpm..."
npm install -g pnpm

echo "==> تثبيت PostgreSQL..."
sudo apt-get install -y postgresql postgresql-contrib

echo "==> إنشاء قاعدة البيانات..."
sudo -u postgres psql -c "CREATE DATABASE chouiaar_travel;" || echo "قاعدة البيانات موجودة"
sudo -u postgres psql -c "CREATE USER chouiaar WITH PASSWORD 'chouiaar2026';" || echo "المستخدم موجود"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE chouiaar_travel TO chouiaar;"

echo "==> استيراد قاعدة البيانات..."
sudo -u postgres psql -d chouiaar_travel -f database/chouiaar_full_db.sql

echo "==> نسخ ملف البيئة..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "تم إنشاء .env — عدّل القيم قبل التشغيل!"
fi

echo "==> تثبيت المكتبات..."
pnpm install --frozen-lockfile

echo "==> بناء المشروع..."
pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/travel-agency run build

echo ""
echo "==============================="
echo " الإعداد اكتمل بنجاح!"
echo " شغّل: pnpm --filter @workspace/api-server run start"
echo " ثم افتح: http://YOUR_VPS_IP:8080"
echo " لوحة التحكم: http://YOUR_VPS_IP:8080/admin/login"
echo "==============================="
