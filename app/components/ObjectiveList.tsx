import { useRef, useState } from "react";
import { useFetcher } from "react-router";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import { formatDateTime } from "~/lib/datetime";
import { cn } from "~/lib/utils";

interface Objective {
  id: string;
  title: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}

interface ObjectiveListProps {
  objectives: Objective[];
}

function ObjectiveCard({ obj }: { obj: Objective }) {
  const completeFetcher = useFetcher();
  const deleteFetcher = useFetcher();
  const [flashing, setFlashing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isCompleted = obj.completedAt != null;
  const isChecked = isCompleted || flashing;

  function handleComplete() {
    if (isCompleted || flashing || completeFetcher.state !== "idle") return;
    setFlashing(true);
    completeFetcher.submit({ id: obj.id }, { method: "PATCH" });
    setTimeout(() => setFlashing(false), 3000);
  }

  function handleDeleteClick() {
    if (confirming) {
      if (confirmTimer.current) clearTimeout(confirmTimer.current);
      deleteFetcher.submit({ id: obj.id }, { method: "DELETE" });
    } else {
      setConfirming(true);
      confirmTimer.current = setTimeout(() => setConfirming(false), 3000);
    }
  }

  return (
    <Card
      className={cn(
        "h-full",
        flashing && "transition-colors duration-500 bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700"
      )}
    >
      <CardHeader>
        <div className="flex items-start gap-3">
          <button
            onClick={handleComplete}
            disabled={isCompleted}
            aria-label={isChecked ? "Completed" : "Mark as complete"}
            style={{ transition: "opacity 3s ease, background-color 0.2s, border-color 0.2s", opacity: isChecked ? 0.3 : 1 }}
            className={cn(
              "mt-0.5 flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center",
              isChecked
                ? "bg-green-500 border-green-500 text-white"
                : "border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500"
            )}
          >
            {isChecked && (
              <svg
                viewBox="0 0 12 12"
                fill="none"
                className="w-3.5 h-3.5"
                aria-hidden="true"
              >
                <path
                  d="M2 6l3 3 5-5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>

          <div className="min-w-0 flex-1">
            <CardTitle
              className={cn(
                "line-clamp-2",
                isCompleted && !flashing && "text-gray-400 dark:text-gray-500"
              )}
            >
              {obj.title}
            </CardTitle>
            <CardDescription>
              {formatDateTime(new Date(obj.createdAt))}
            </CardDescription>
          </div>

          <DeleteButton
            confirming={confirming}
            isDeleting={deleteFetcher.state !== "idle"}
            onClick={handleDeleteClick}
          />
        </div>
      </CardHeader>

      {obj.description && (
        <CardContent>
          <p
            className={cn(
              "text-sm line-clamp-4 whitespace-pre-wrap",
              isCompleted && !flashing
                ? "text-gray-400 dark:text-gray-500"
                : "text-gray-600 dark:text-gray-400"
            )}
          >
            {obj.description}
          </p>
        </CardContent>
      )}
    </Card>
  );
}

function DeleteButton({
  confirming,
  isDeleting,
  onClick,
}: {
  confirming: boolean;
  isDeleting: boolean;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  return (
    <button
      onClick={onClick}
      disabled={isDeleting}
      aria-label={t("objectives.list.delete")}
      className={cn(
        "flex-shrink-0 flex items-center gap-1 rounded px-1.5 py-0.5 text-xs transition-colors",
        confirming
          ? "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400"
          : "text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
      )}
    >
      <Trash2 className="w-3.5 h-3.5" />
      {confirming && <span>{t("objectives.list.confirmDelete")}</span>}
    </button>
  );
}

export function ObjectiveList({ objectives }: ObjectiveListProps) {
  const { t } = useTranslation();

  if (objectives.length === 0) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <p className="text-gray-400 dark:text-gray-500 text-sm">
          {t("objectives.list.empty")}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        {t("objectives.list.heading")}
      </h2>

      <ul
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        aria-label={t("objectives.list.heading")}
      >
        {objectives.map((obj, index) => (
          <li
            key={obj.id}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <ObjectiveCard obj={obj} />
          </li>
        ))}
      </ul>
    </div>
  );
}
