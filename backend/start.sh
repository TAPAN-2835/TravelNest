#!/bin/bash
echo "Starting TravelNest..."
echo "Running Prisma migrations..."
npx prisma migrate deploy
echo "Running Prisma seed..."
npx ts-node src/prisma/seed.ts
echo "Starting server..."
node dist/server.js
