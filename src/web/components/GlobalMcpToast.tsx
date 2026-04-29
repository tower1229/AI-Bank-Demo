import { Transition } from "@headlessui/react";
import { MessageSquareDot, X } from "lucide-react";
import { useEffect, useRef, useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import type { AuditLogEntry } from "../../bank/service";
import { fetchJson } from "../lib/api";

export function GlobalMcpToast() {
  const [toast, setToast] = useState<AuditLogEntry | null>(null);
  const lastSeenIdRef = useRef<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Initial fetch to get the current latest ID so we don't pop up old events on reload
    fetchJson<AuditLogEntry[]>("/api/audit-logs")
      .then((logs) => {
        if (logs.length > 0) {
          lastSeenIdRef.current = logs[0].id;
        }
      })
      .catch(() => {});

    const interval = setInterval(async () => {
      try {
        const logs = await fetchJson<AuditLogEntry[]>("/api/audit-logs");
        if (logs.length > 0) {
          const latest = logs[0];

          if (lastSeenIdRef.current !== null && latest.id !== lastSeenIdRef.current) {
            // New log detected!
            if (latest.source === "telegram_openclaw" && latest.status === "success") {
              setToast(latest);
              // Auto hide after 8 seconds
              setTimeout(() => {
                setToast((current) => (current?.id === latest.id ? null : current));
              }, 8000);
            }
          }
          lastSeenIdRef.current = latest.id;
        }
      } catch (err) {
        // Silently fail polling
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    if (!toast) return;
    const action = toast.action;
    setToast(null);

    if (action === "create_onboarding_application" || action === "approve_onboarding_application") {
      navigate("/client-lifecycle");
    } else if (action === "create_transfer") {
      navigate("/payments");
    } else if (action === "purchase_product") {
      navigate("/investment-orders");
    } else {
      navigate("/audit-log");
    }
  };

  return (
    <div className="fixed top-6 right-6 z-50 pointer-events-none w-full max-w-sm">
      <Transition
        show={toast !== null}
        as={Fragment}
        enter="transform ease-out duration-300 transition"
        enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enterTo="translate-y-0 opacity-100 sm:translate-x-0"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div
          className="pointer-events-auto bg-white border border-slate-200 shadow-2xl rounded-xl p-4 cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
          onClick={handleClick}
        >
          {/* Accent border top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <div className="mt-0.5 flex-shrink-0 bg-blue-50 text-blue-600 rounded-full p-2 border border-blue-100">
                <MessageSquareDot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Telegram MCP Action</h4>
                <p className="text-sm text-slate-600 mt-1 line-clamp-2 leading-snug">
                  {toast?.resultMessage}
                </p>
                <p className="text-xs text-blue-600 mt-2 font-medium flex items-center gap-1 group">
                  Click to view details
                  <span className="transform group-hover:translate-x-1 transition-transform">&rarr;</span>
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setToast(null);
              }}
              className="text-slate-400 hover:text-slate-600 p-1 -mr-2 -mt-2 rounded-md hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Transition>
    </div>
  );
}
