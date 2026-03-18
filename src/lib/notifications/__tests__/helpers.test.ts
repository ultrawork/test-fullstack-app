import { describe, it, expect } from "vitest";
import { isWithinQuietHours, shouldDeliverNow } from "../helpers";
import { NotificationPriority } from "../types";
import type { QuietHours } from "../types";

describe("isWithinQuietHours", () => {
  it("returns true when current hour is within range (start < end)", () => {
    const qh: QuietHours = { start: 22, end: 8 };
    // 23 is between 22..8 (wraps midnight)
    expect(isWithinQuietHours(qh, 23)).toBe(true);
  });

  it("returns true at exactly the start hour", () => {
    const qh: QuietHours = { start: 22, end: 8 };
    expect(isWithinQuietHours(qh, 22)).toBe(true);
  });

  it("returns false at exactly the end hour", () => {
    const qh: QuietHours = { start: 22, end: 8 };
    expect(isWithinQuietHours(qh, 8)).toBe(false);
  });

  it("returns true for hours wrapping past midnight", () => {
    const qh: QuietHours = { start: 23, end: 6 };
    expect(isWithinQuietHours(qh, 0)).toBe(true);
    expect(isWithinQuietHours(qh, 3)).toBe(true);
    expect(isWithinQuietHours(qh, 5)).toBe(true);
  });

  it("returns false for hours outside wrap-around range", () => {
    const qh: QuietHours = { start: 23, end: 6 };
    expect(isWithinQuietHours(qh, 6)).toBe(false);
    expect(isWithinQuietHours(qh, 12)).toBe(false);
    expect(isWithinQuietHours(qh, 22)).toBe(false);
  });

  it("handles non-wrapping range (start < end)", () => {
    const qh: QuietHours = { start: 1, end: 5 };
    expect(isWithinQuietHours(qh, 1)).toBe(true);
    expect(isWithinQuietHours(qh, 3)).toBe(true);
    expect(isWithinQuietHours(qh, 4)).toBe(true);
    expect(isWithinQuietHours(qh, 5)).toBe(false);
    expect(isWithinQuietHours(qh, 0)).toBe(false);
    expect(isWithinQuietHours(qh, 6)).toBe(false);
  });

  it("returns false when start equals end (no quiet hours)", () => {
    const qh: QuietHours = { start: 10, end: 10 };
    expect(isWithinQuietHours(qh, 10)).toBe(false);
    expect(isWithinQuietHours(qh, 5)).toBe(false);
    expect(isWithinQuietHours(qh, 15)).toBe(false);
  });

  it("handles midnight boundary: start=0, end=6", () => {
    const qh: QuietHours = { start: 0, end: 6 };
    expect(isWithinQuietHours(qh, 0)).toBe(true);
    expect(isWithinQuietHours(qh, 3)).toBe(true);
    expect(isWithinQuietHours(qh, 6)).toBe(false);
    expect(isWithinQuietHours(qh, 23)).toBe(false);
  });
});

describe("shouldDeliverNow", () => {
  const quietHours: QuietHours = { start: 22, end: 7 };

  it("delivers urgent notifications even during quiet hours", () => {
    expect(
      shouldDeliverNow(NotificationPriority.URGENT, quietHours, 23),
    ).toBe(true);
    expect(shouldDeliverNow(NotificationPriority.URGENT, quietHours, 3)).toBe(
      true,
    );
  });

  it("blocks non-urgent notifications during quiet hours", () => {
    expect(shouldDeliverNow(NotificationPriority.LOW, quietHours, 23)).toBe(
      false,
    );
    expect(
      shouldDeliverNow(NotificationPriority.MEDIUM, quietHours, 0),
    ).toBe(false);
    expect(shouldDeliverNow(NotificationPriority.HIGH, quietHours, 5)).toBe(
      false,
    );
  });

  it("delivers non-urgent notifications outside quiet hours", () => {
    expect(shouldDeliverNow(NotificationPriority.LOW, quietHours, 10)).toBe(
      true,
    );
    expect(
      shouldDeliverNow(NotificationPriority.MEDIUM, quietHours, 15),
    ).toBe(true);
    expect(shouldDeliverNow(NotificationPriority.HIGH, quietHours, 20)).toBe(
      true,
    );
  });

  it("delivers any priority when quietHours is null", () => {
    expect(shouldDeliverNow(NotificationPriority.LOW, null, 23)).toBe(true);
    expect(shouldDeliverNow(NotificationPriority.MEDIUM, null, 3)).toBe(true);
    expect(shouldDeliverNow(NotificationPriority.HIGH, null, 12)).toBe(true);
    expect(shouldDeliverNow(NotificationPriority.URGENT, null, 0)).toBe(true);
  });

  it("delivers at the boundary (end hour) since it is outside quiet hours", () => {
    expect(shouldDeliverNow(NotificationPriority.LOW, quietHours, 7)).toBe(
      true,
    );
  });

  it("blocks at the start hour since it is inside quiet hours", () => {
    expect(shouldDeliverNow(NotificationPriority.LOW, quietHours, 22)).toBe(
      false,
    );
  });
});
