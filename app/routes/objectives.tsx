import { useTranslation } from "react-i18next";
import { z } from "zod";

import { database } from "~/database/context";
import { objectives, objectiveChanges } from "~/database/schema";
import { desc, eq } from "drizzle-orm";
import i18n from "~/i18n";
import type { Route } from "./+types/objectives";
import { CreateObjectiveForm } from "~/components/CreateObjectiveForm";
import { ObjectiveList } from "~/components/ObjectiveList";
import { ThemeToggle } from "~/components/ThemeToggle";

// Identical shape today; kept separate so each can evolve independently.
export const deleteObjectiveSchema = z.object({
  id: z.string().min(1),
});

export const completeObjectiveSchema = z.object({
  id: z.string().min(1),
});

export const createObjectiveSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().nullable().optional(),
});

export type CreateObjectiveInput = z.infer<typeof createObjectiveSchema>;

const PAGE_SIZE = 10;

export function meta({}: Route.MetaArgs) {
  const t = i18n.t.bind(i18n);
  return [
    { title: `${t("objectives.title")} — ${t("common.appName")}` },
    { name: "description", content: t("objectives.metaDescription") },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const db = database();
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const offset = (page - 1) * PAGE_SIZE;

  const rows = await db
    .select()
    .from(objectives)
    .orderBy(desc(objectives.createdAt))
    .limit(PAGE_SIZE)
    .offset(offset);

  return { objectives: rows, page };
}

export async function action({ request }: Route.ActionArgs) {
  const db = database();

  if (request.method === "PATCH") {
    const formData = await request.formData();
    const parsed = completeObjectiveSchema.safeParse({ id: formData.get("id") });
    if (!parsed.success) {
      return Response.json({ errors: { id: ["Invalid objective ID"] } }, { status: 400 });
    }

    const [updated] = await db
      .update(objectives)
      .set({ completedAt: new Date() })
      .where(eq(objectives.id, parsed.data.id))
      .returning();

    if (!updated) {
      return Response.json({ error: "Objective not found" }, { status: 404 });
    }

    await db.insert(objectiveChanges).values({
      objectiveId: updated.id,
      changeType: "completed",
    });

    return Response.json({ objective: updated });
  }

  if (request.method === "DELETE") {
    const formData = await request.formData();
    const parsed = deleteObjectiveSchema.safeParse({ id: formData.get("id") });
    if (!parsed.success) {
      return Response.json({ errors: { id: ["Invalid objective ID"] } }, { status: 400 });
    }

    await db.delete(objectives).where(eq(objectives.id, parsed.data.id));

    return Response.json({ deleted: true });
  }

  if (request.method === "POST") {
    const formData = await request.formData();
    const raw = {
      title: formData.get("title"),
      description: formData.get("description") || null,
    };

    const parsed = createObjectiveSchema.safeParse(raw);
    if (!parsed.success) {
      return Response.json(
        { errors: parsed.error.issues.reduce<Record<string, string[]>>((acc, issue) => {
          const key = String(issue.path[0] ?? "_");
          (acc[key] ??= []).push(issue.message);
          return acc;
        }, {}) },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(objectives)
      .values({
        title: parsed.data.title,
        description: parsed.data.description ?? null,
      })
      .returning();

    await db.insert(objectiveChanges).values({
      objectiveId: created.id,
      changeType: "created",
    });

    return Response.json({ objective: created }, { status: 201 });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
}

export default function ObjectivesPage({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-[#50dfc6] dark:bg-gray-950">
      <header className="border-b border-[#3dcbb3] dark:border-gray-800 bg-[#50dfc6] dark:bg-gray-900 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {t("objectives.title")}
        </h1>
        <ThemeToggle />
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        <section aria-label={t("objectives.createSection")}>
          <CreateObjectiveForm />
        </section>

        <section aria-label={t("objectives.listSection")}>
          <ObjectiveList objectives={loaderData.objectives} />
        </section>
      </div>
    </main>
  );
}
