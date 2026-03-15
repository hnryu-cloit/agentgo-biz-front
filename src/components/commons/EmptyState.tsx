import type React from "react";
import { Inbox } from "lucide-react";

type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-[#d5deec] bg-[#f4f7ff] py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#eef3ff]">
        {icon ?? <Inbox className="h-6 w-6 text-primary" />}
      </div>
      <p className="mt-4 text-base font-semibold text-[#34415b]">{title}</p>
      {description && <p className="mt-1.5 max-w-xs text-sm text-[var(--subtle-foreground)]">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
