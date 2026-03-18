import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const schemaPath = join(__dirname, "schema.prisma");

let schemaContent: string;

beforeAll(() => {
  schemaContent = readFileSync(schemaPath, "utf-8");
});

describe("Prisma Schema - Datasource", () => {
  it("should use postgresql provider", () => {
    expect(schemaContent).toMatch(/datasource\s+db\s*\{/);
    expect(schemaContent).toMatch(/provider\s*=\s*"postgresql"/);
  });

  it("should use DATABASE_URL env variable", () => {
    expect(schemaContent).toMatch(/url\s*=\s*env\("DATABASE_URL"\)/);
  });
});

describe("Prisma Schema - Generator", () => {
  it("should have prisma-client-js generator", () => {
    expect(schemaContent).toMatch(/generator\s+client\s*\{/);
    expect(schemaContent).toMatch(/provider\s*=\s*"prisma-client-js"/);
  });
});

describe("Prisma Schema - Enums", () => {
  it("should define NotificationChannel enum with correct values", () => {
    expect(schemaContent).toMatch(/enum\s+NotificationChannel\s*\{/);
    const enumMatch = schemaContent.match(
      /enum\s+NotificationChannel\s*\{([^}]+)\}/
    );
    expect(enumMatch).not.toBeNull();
    const values = enumMatch![1].trim().split(/\s+/);
    expect(values).toContain("EMAIL");
    expect(values).toContain("PUSH");
    expect(values).toContain("SMS");
  });

  it("should define NotificationStatus enum with correct values", () => {
    expect(schemaContent).toMatch(/enum\s+NotificationStatus\s*\{/);
    const enumMatch = schemaContent.match(
      /enum\s+NotificationStatus\s*\{([^}]+)\}/
    );
    expect(enumMatch).not.toBeNull();
    const values = enumMatch![1].trim().split(/\s+/);
    expect(values).toContain("PENDING");
    expect(values).toContain("SENT");
    expect(values).toContain("DELIVERED");
    expect(values).toContain("FAILED");
  });

  it("should define NotificationPriority enum with correct values", () => {
    expect(schemaContent).toMatch(/enum\s+NotificationPriority\s*\{/);
    const enumMatch = schemaContent.match(
      /enum\s+NotificationPriority\s*\{([^}]+)\}/
    );
    expect(enumMatch).not.toBeNull();
    const values = enumMatch![1].trim().split(/\s+/);
    expect(values).toContain("LOW");
    expect(values).toContain("NORMAL");
    expect(values).toContain("HIGH");
    expect(values).toContain("URGENT");
  });
});

describe("Prisma Schema - User model", () => {
  it("should define User model", () => {
    expect(schemaContent).toMatch(/model\s+User\s*\{/);
  });

  it("should have UUID id field", () => {
    const modelMatch = schemaContent.match(/model\s+User\s*\{([^}]+)\}/);
    expect(modelMatch).not.toBeNull();
    const body = modelMatch![1];
    expect(body).toMatch(/id\s+String\s+@id\s+@default\(uuid\(\)\)/);
  });

  it("should have unique email field", () => {
    const modelMatch = schemaContent.match(/model\s+User\s*\{([^}]+)\}/);
    expect(modelMatch).not.toBeNull();
    const body = modelMatch![1];
    expect(body).toMatch(/email\s+String\s+@unique/);
  });

  it("should have name field", () => {
    const modelMatch = schemaContent.match(/model\s+User\s*\{([^}]+)\}/);
    expect(modelMatch).not.toBeNull();
    const body = modelMatch![1];
    expect(body).toMatch(/name\s+String/);
  });

  it("should have createdAt and updatedAt fields", () => {
    const modelMatch = schemaContent.match(/model\s+User\s*\{([^}]+)\}/);
    expect(modelMatch).not.toBeNull();
    const body = modelMatch![1];
    expect(body).toMatch(/createdAt\s+DateTime\s+@default\(now\(\)\)/);
    expect(body).toMatch(/updatedAt\s+DateTime\s+@updatedAt/);
  });

  it("should have relations to other models", () => {
    const modelMatch = schemaContent.match(/model\s+User\s*\{([^}]+)\}/);
    expect(modelMatch).not.toBeNull();
    const body = modelMatch![1];
    expect(body).toMatch(/pushSubscriptions\s+PushSubscription\[\]/);
    expect(body).toMatch(/notificationPrefs\s+NotificationPref\[\]/);
    expect(body).toMatch(/notifications\s+Notification\[\]/);
  });
});

describe("Prisma Schema - PushSubscription model", () => {
  it("should define PushSubscription model", () => {
    expect(schemaContent).toMatch(/model\s+PushSubscription\s*\{/);
  });

  it("should have UUID id and required fields", () => {
    const modelMatch = schemaContent.match(
      /model\s+PushSubscription\s*\{([^}]+)\}/
    );
    expect(modelMatch).not.toBeNull();
    const body = modelMatch![1];
    expect(body).toMatch(/id\s+String\s+@id\s+@default\(uuid\(\)\)/);
    expect(body).toMatch(/endpoint\s+String\s+@unique/);
    expect(body).toMatch(/p256dh\s+String/);
    expect(body).toMatch(/auth\s+String/);
  });

  it("should have userId foreign key with relation", () => {
    const modelMatch = schemaContent.match(
      /model\s+PushSubscription\s*\{([^}]+)\}/
    );
    expect(modelMatch).not.toBeNull();
    const body = modelMatch![1];
    expect(body).toMatch(/userId\s+String/);
    expect(body).toMatch(
      /user\s+User\s+@relation\(fields:\s*\[userId\],\s*references:\s*\[id\]\)/
    );
  });

  it("should have index on userId", () => {
    const modelMatch = schemaContent.match(
      /model\s+PushSubscription\s*\{([^}]+)\}/
    );
    expect(modelMatch).not.toBeNull();
    const body = modelMatch![1];
    expect(body).toMatch(/@@index\(\[userId\]\)/);
  });
});

describe("Prisma Schema - NotificationPref model", () => {
  it("should define NotificationPref model", () => {
    expect(schemaContent).toMatch(/model\s+NotificationPref\s*\{/);
  });

  it("should have UUID id and required fields", () => {
    const modelMatch = schemaContent.match(
      /model\s+NotificationPref\s*\{([^}]+)\}/
    );
    expect(modelMatch).not.toBeNull();
    const body = modelMatch![1];
    expect(body).toMatch(/id\s+String\s+@id\s+@default\(uuid\(\)\)/);
    expect(body).toMatch(/channel\s+NotificationChannel/);
    expect(body).toMatch(/enabled\s+Boolean\s+@default\(true\)/);
  });

  it("should have userId foreign key with relation", () => {
    const modelMatch = schemaContent.match(
      /model\s+NotificationPref\s*\{([^}]+)\}/
    );
    expect(modelMatch).not.toBeNull();
    const body = modelMatch![1];
    expect(body).toMatch(/userId\s+String/);
    expect(body).toMatch(
      /user\s+User\s+@relation\(fields:\s*\[userId\],\s*references:\s*\[id\]\)/
    );
  });

  it("should have unique constraint on userId and channel", () => {
    const modelMatch = schemaContent.match(
      /model\s+NotificationPref\s*\{([^}]+)\}/
    );
    expect(modelMatch).not.toBeNull();
    const body = modelMatch![1];
    expect(body).toMatch(/@@unique\(\[userId,\s*channel\]\)/);
  });
});

describe("Prisma Schema - Notification model", () => {
  it("should define Notification model", () => {
    expect(schemaContent).toMatch(/model\s+Notification\s*\{/);
  });

  it("should have UUID id and required fields", () => {
    const modelMatch = schemaContent.match(
      /model\s+Notification\s*\{([^}]+)\}/
    );
    expect(modelMatch).not.toBeNull();
    const body = modelMatch![1];
    expect(body).toMatch(/id\s+String\s+@id\s+@default\(uuid\(\)\)/);
    expect(body).toMatch(/channel\s+NotificationChannel/);
    expect(body).toMatch(/status\s+NotificationStatus\s+@default\(PENDING\)/);
    expect(body).toMatch(/priority\s+NotificationPriority\s+@default\(NORMAL\)/);
    expect(body).toMatch(/title\s+String/);
    expect(body).toMatch(/body\s+String/);
  });

  it("should have userId foreign key with relation", () => {
    const modelMatch = schemaContent.match(
      /model\s+Notification\s*\{([^}]+)\}/
    );
    expect(modelMatch).not.toBeNull();
    const body = modelMatch![1];
    expect(body).toMatch(/userId\s+String/);
    expect(body).toMatch(
      /user\s+User\s+@relation\(fields:\s*\[userId\],\s*references:\s*\[id\]\)/
    );
  });

  it("should have createdAt and sentAt fields", () => {
    const modelMatch = schemaContent.match(
      /model\s+Notification\s*\{([^}]+)\}/
    );
    expect(modelMatch).not.toBeNull();
    const body = modelMatch![1];
    expect(body).toMatch(/createdAt\s+DateTime\s+@default\(now\(\)\)/);
    expect(body).toMatch(/sentAt\s+DateTime\?/);
  });

  it("should have indexes on userId and status", () => {
    const modelMatch = schemaContent.match(
      /model\s+Notification\s*\{([^}]+)\}/
    );
    expect(modelMatch).not.toBeNull();
    const body = modelMatch![1];
    expect(body).toMatch(/@@index\(\[userId\]\)/);
    expect(body).toMatch(/@@index\(\[status\]\)/);
  });
});

describe("Prisma Schema - prisma validate", () => {
  it("should pass prisma format/validate", () => {
    const result = execSync("npx prisma validate", {
      cwd: join(__dirname, ".."),
      encoding: "utf-8",
      env: {
        ...process.env,
        DATABASE_URL: "postgresql://localhost:5432/test",
      },
    });
    expect(result).toMatch(/schema\.prisma/i);
  });
});
