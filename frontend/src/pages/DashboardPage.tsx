import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import AppLayout from "../components/AppLayout";
import { useAuthStore } from "../store/authStore";
import { useFilterStore } from "../store/filterStore";
import { useMe } from "../hooks/useAuth";
import { useExpenses, useExpenseSummary } from "../hooks/useExpenses";
import { useCategories } from "../hooks/useCategories";
import { formatCurrency } from "../utils/formatters";
import type { Expense } from "../types";

function ChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function MonthPicker() {
  const { currentMonth, setCurrentMonth } = useFilterStore();
  function shift(delta: number) {
    const [y, m] = currentMonth.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setCurrentMonth(format(d, "yyyy-MM"));
  }
  const label = format(new Date(currentMonth + "-02"), "MMMM yyyy");
  return (
    <div className="flex items-center justify-between px-4 py-2">
      <button onClick={() => shift(-1)}
        className="w-10 h-10 rounded-full flex items-center justify-center
                   text-m3-on-surface-variant hover:bg-m3-surface-container active:bg-m3-surface-container-high">
        <ChevronLeft />
      </button>
      <span className="text-sm font-medium text-m3-on-surface">{label}</span>
      <button onClick={() => shift(1)}
        className="w-10 h-10 rounded-full flex items-center justify-center
                   text-m3-on-surface-variant hover:bg-m3-surface-container active:bg-m3-surface-container-high">
        <ChevronRight />
      </button>
    </div>
  );
}

function ExpenseRow({ expense, categories }: {
  expense: Expense;
  categories: { id: string; name: string; icon: string; color: string }[];
}) {
  const cat = categories.find((c) => c.id === expense.category_id);
  return (
    <div className="flex items-center gap-4 px-4 py-3 active:bg-m3-surface-container">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ backgroundColor: (cat?.color ?? "#6366f1") + "22" }}>
        {cat?.icon ?? "📦"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-m3-on-surface truncate">{expense.description}</p>
        <p className="text-xs text-m3-on-surface-variant mt-0.5">
          {cat?.name} · {format(new Date(expense.date), "MMM d")}
        </p>
      </div>
      <span className="text-sm font-medium text-m3-on-surface tabular-nums">
        {formatCurrency(expense.amount)}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const clearToken = useAuthStore((s) => s.clearToken);
  const { data: user } = useMe();
  const { currentMonth } = useFilterStore();

  const { data: expenses = [], isLoading } = useExpenses(currentMonth);
  const { data: summary = [] } = useExpenseSummary(currentMonth);
  const { data: categories = [] } = useCategories();

  const monthTotal = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <AppLayout>
      {/* M3 Large Top App Bar */}
      <div className="bg-m3-surface px-4 pt-2 pb-4">
        <div className="flex items-center justify-between h-12">
          <span className="text-xl font-medium text-m3-on-surface">PopNickel</span>
          <button onClick={() => { clearToken(); navigate("/login", { replace: true }); }}
            className="w-10 h-10 rounded-full bg-m3-primary flex items-center justify-center
                       text-m3-on-primary text-sm font-medium">
            {user?.full_name?.[0]?.toUpperCase() ?? "?"}
          </button>
        </div>
        <h1 className="text-3xl font-light text-m3-on-surface mt-1">
          {user ? `Hi, ${user.full_name.split(" ")[0]}` : "…"}
        </h1>
      </div>

      {/* Spending card — M3 Primary Container */}
      <div className="mx-4 mb-2 rounded-xl3 bg-m3-primary-container px-5 py-5">
        <MonthPicker />
        <div className="px-4 pb-2">
          <p className="text-xs font-medium text-m3-on-primary-container opacity-70 uppercase tracking-widest">
            Total spending
          </p>
          <p className="text-5xl font-light text-m3-on-primary-container mt-1 tabular-nums">
            {formatCurrency(monthTotal)}
          </p>
        </div>
      </div>

      {/* Category chips */}
      {summary.length > 0 && (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto">
          {summary.map((s) => {
            const cat = categories.find((c) => c.id === s.category_id);
            return (
              <div key={s.category_id}
                className="flex-shrink-0 bg-m3-surface-container rounded-xl px-3 py-2 border border-m3-outline-variant">
                <p className="text-xs text-m3-on-surface-variant">{cat?.icon} {s.category_name}</p>
                <p className="text-sm font-medium text-m3-on-surface mt-0.5 tabular-nums">
                  {formatCurrency(Number(s.total))}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Transactions */}
      <div className="mx-4 mb-3">
        <p className="text-xs font-medium text-m3-on-surface-variant uppercase tracking-widest py-2 px-0">
          Transactions
        </p>
        <div className="bg-m3-surface-container rounded-xl2 overflow-hidden">
          {isLoading && (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 rounded-full border-2 border-m3-primary border-t-transparent animate-spin" />
            </div>
          )}
          {!isLoading && expenses.length === 0 && (
            <div className="flex flex-col items-center py-12 px-4 text-center">
              <span className="text-5xl mb-3">🧾</span>
              <p className="text-sm font-medium text-m3-on-surface">No expenses yet</p>
              <p className="text-xs text-m3-on-surface-variant mt-1">Tap Add to record your first expense</p>
            </div>
          )}
          {expenses.map((e, i) => (
            <div key={e.id}>
              <ExpenseRow expense={e} categories={categories} />
              {i < expenses.length - 1 && (
                <div className="h-px bg-m3-outline-variant mx-4" />
              )}
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
