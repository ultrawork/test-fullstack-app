import { execSync } from "child_process";
import { writeFileSync } from "fs";
import { resolve } from "path";
import { createServer } from "net";

/**
 * Глобальная подготовка тестового окружения:
 * 1. Поиск свободного порта для PostgreSQL
 * 2. Создание .env файла с настройками БД
 * 3. Запуск PostgreSQL через Docker Compose
 * 4. Ожидание готовности БД
 * 5. Установка зависимостей и генерация Prisma Client
 * 6. Применение схемы Prisma
 */
export default async function globalSetup(): Promise<void> {
  const projectRoot = resolve(__dirname, "../..");

  // Находим свободный порт для PostgreSQL
  const pgPort = await findFreePort(5432);

  // Создаём .env с правильным портом
  const envPath = resolve(projectRoot, ".env");
  const envContent = [
    `DATABASE_URL="postgresql://user:password@localhost:${pgPort}/notes_db"`,
    `JWT_SECRET="test-jwt-secret-at-least-32-chars-long-for-e2e"`,
    `JWT_REFRESH_SECRET="test-jwt-refresh-secret-at-least-32-chars-long-for-e2e"`,
  ].join("\n") + "\n";
  writeFileSync(envPath, envContent);
  console.log(`[global-setup] Создан .env (PostgreSQL порт: ${pgPort})`);

  // Останавливаем предыдущий контейнер если есть
  try {
    execSync("docker compose down", {
      stdio: "pipe",
      cwd: projectRoot,
      timeout: 15000,
    });
  } catch {
    // Игнорируем ошибки
  }

  console.log("[global-setup] Запуск PostgreSQL...");

  // Запускаем PostgreSQL с нужным портом
  execSync(`POSTGRES_PORT=${pgPort} docker compose up -d`, {
    stdio: "inherit",
    cwd: projectRoot,
    timeout: 60000,
  });

  // Ждём готовности PostgreSQL
  let retries = 30;
  while (retries > 0) {
    try {
      execSync(
        "docker compose exec -T postgres pg_isready -U user -d notes_db",
        { stdio: "pipe", cwd: projectRoot, timeout: 5000 },
      );
      break;
    } catch {
      retries--;
      if (retries === 0) {
        throw new Error("PostgreSQL не запустился за отведённое время");
      }
      execSync("sleep 1");
    }
  }

  console.log("[global-setup] PostgreSQL готов. Применяю схему Prisma...");

  // Генерируем Prisma Client
  execSync("npx prisma generate", {
    stdio: "inherit",
    cwd: projectRoot,
    timeout: 30000,
  });

  // Применяем схему (force-reset для чистой БД)
  execSync("npx prisma db push --force-reset", {
    stdio: "inherit",
    cwd: projectRoot,
    timeout: 30000,
  });

  console.log("[global-setup] Тестовое окружение готово.");
}

/**
 * Находит свободный порт начиная с startPort.
 */
function findFreePort(startPort: number): Promise<number> {
  return new Promise((resolve) => {
    function tryPort(port: number): void {
      const server = createServer();
      server.listen(port, "0.0.0.0", () => {
        server.close(() => resolve(port));
      });
      server.on("error", () => {
        tryPort(port + 1);
      });
    }
    tryPort(startPort);
  });
}
