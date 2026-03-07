import { execSync } from 'child_process';

/**
 * Глобальная настройка для E2E тестов:
 * - Генерация Prisma-клиента
 * - Применение схемы БД
 */
export default async function globalSetup(): Promise<void> {
  console.log('[E2E Global Setup] Инициализация Prisma...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  execSync('npx prisma db push --skip-generate --accept-data-loss', { stdio: 'inherit' });
  console.log('[E2E Global Setup] БД готова.');
}
