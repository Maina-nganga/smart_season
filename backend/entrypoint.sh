#!/bin/sh
set -e

echo "==> Waiting for MySQL to be ready..."
until python3 -c "
import pymysql, os
try:
    conn = pymysql.connect(
        host=os.environ.get('DB_HOST','localhost'),
        port=int(os.environ.get('DB_PORT','3306')),
        user=os.environ.get('DB_USER','root'),
        password=os.environ.get('DB_PASSWORD',''),
        database=os.environ.get('DB_NAME','smartseason'),
    )
    conn.close()
except Exception:
    exit(1)
" 2>/dev/null; do
    echo "   MySQL not ready yet, retrying in 3s..."
    sleep 3
done

echo "==> Setting up database tables and seeding..."
python3 db_setup.py --seed

echo "==> Starting Gunicorn..."
exec gunicorn \
    --bind 0.0.0.0:5000 \
    --workers 4 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    run:app
