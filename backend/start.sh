#!/bin/sh
echo "Starting TravelNest..."
echo "Running Prisma migrations..."
npx prisma migrate deploy --schema=src/prisma/schema.prisma
echo "Running Prisma seed..."
npx ts-node --transpile-only src/prisma/seed.ts || echo "Seed failed, continuing..."
echo "Starting server..."
node dist/server.js
