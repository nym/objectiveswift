import { describe, it, expect } from "vitest";
import { createObjectiveSchema, deleteObjectiveSchema, completeObjectiveSchema } from "./objectives";

describe("createObjectiveSchema", () => {
  it("accepts a valid title and optional description", () => {
    const result = createObjectiveSchema.safeParse({
      title: "Learn TypeScript",
      description: "Focus on generics and advanced types",
    });

    expect(result.success).toBe(true);
  });

  it("accepts a title with no description", () => {
    const result = createObjectiveSchema.safeParse({
      title: "Read every day",
    });

    expect(result.success).toBe(true);
  });

  it("accepts a null description", () => {
    const result = createObjectiveSchema.safeParse({
      title: "Run 5k",
      description: null,
    });

    expect(result.success).toBe(true);
  });

  it("rejects an empty title", () => {
    const result = createObjectiveSchema.safeParse({
      title: "",
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.title).toBeDefined();
  });

  it("rejects a title that exceeds 255 characters", () => {
    const result = createObjectiveSchema.safeParse({
      title: "a".repeat(256),
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.title).toBeDefined();
  });

  it("accepts a title of exactly 255 characters", () => {
    const result = createObjectiveSchema.safeParse({
      title: "a".repeat(255),
    });

    expect(result.success).toBe(true);
  });

  it("accepts a very long description (no length limit)", () => {
    const result = createObjectiveSchema.safeParse({
      title: "My objective",
      description: "x".repeat(10_000),
    });

    expect(result.success).toBe(true);
  });
});

describe("deleteObjectiveSchema", () => {
  it("accepts a non-empty id", () => {
    const result = deleteObjectiveSchema.safeParse({ id: "some-id" });

    expect(result.success).toBe(true);
  });

  it("rejects an empty id", () => {
    const result = deleteObjectiveSchema.safeParse({ id: "" });

    expect(result.success).toBe(false);
    expect(result.error?.issues.some((i) => i.path.includes("id"))).toBe(true);
  });

  it("rejects a missing id", () => {
    const result = deleteObjectiveSchema.safeParse({});

    expect(result.success).toBe(false);
    expect(result.error?.issues.some((i) => i.path.includes("id"))).toBe(true);
  });

  it("rejects a null id (as returned by FormData.get for missing fields)", () => {
    const result = deleteObjectiveSchema.safeParse({ id: null });

    expect(result.success).toBe(false);
    expect(result.error?.issues.some((i) => i.path.includes("id"))).toBe(true);
  });
});

describe("completeObjectiveSchema", () => {
  it("accepts a non-empty id", () => {
    const result = completeObjectiveSchema.safeParse({ id: "some-id" });

    expect(result.success).toBe(true);
  });

  it("rejects an empty id", () => {
    const result = completeObjectiveSchema.safeParse({ id: "" });

    expect(result.success).toBe(false);
    expect(result.error?.issues.some((i) => i.path.includes("id"))).toBe(true);
  });

  it("rejects a missing id", () => {
    const result = completeObjectiveSchema.safeParse({});

    expect(result.success).toBe(false);
    expect(result.error?.issues.some((i) => i.path.includes("id"))).toBe(true);
  });

  it("rejects a null id (as returned by FormData.get for missing fields)", () => {
    const result = completeObjectiveSchema.safeParse({ id: null });

    expect(result.success).toBe(false);
    expect(result.error?.issues.some((i) => i.path.includes("id"))).toBe(true);
  });
});
