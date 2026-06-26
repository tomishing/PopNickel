import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import AppLayout from "../components/AppLayout";
import { useCategories } from "../hooks/useCategories";
import { useCreateExpense } from "../hooks/useExpenses";

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  );
}

export default function AddExpensePage() {
  const navigate = useNavigate();
  const { data: categories = [] } = useCategories();
  const createExpense = useCreateExpense();

  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!categoryId) return;
    await createExpense.mutateAsync({
      amount: parseFloat(amount),
      category_id: categoryId,
      description,
      date,
    });
    navigate("/", { replace: true });
  }

  return (
    <AppLayout>
      {/* M3 Small Top App Bar */}
      <div className="flex items-center gap-1 px-2 h-14 bg-m3-surface">
        <button onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center
                     text-m3-on-surface hover:bg-m3-surface-container active:bg-m3-surface-container-high">
          <BackIcon />
        </button>
        <h1 className="text-lg font-medium text-m3-on-surface ml-1">Add Expense</h1>
      </div>

      <form onSubmit={(e) => { void handleSubmit(e); }} className="px-4 space-y-5 pb-6">
        {/* Amount — hero input */}
        <div className="bg-m3-primary-container rounded-xl3 px-6 py-6 flex flex-col items-center">
          <p className="text-xs font-medium text-m3-on-primary-container opacity-60 uppercase tracking-widest mb-3">
            Amount (CAD)
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-light text-m3-on-primary-container opacity-60">CA$</span>
            <input
              type="number" inputMode="decimal" step="0.01" min="0.01" required
              placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)}
              className="text-5xl font-light bg-transparent text-m3-on-primary-container
                         outline-none w-44 placeholder-[#1E1578]/30 text-center tabular-nums"
            />
          </div>
        </div>

        {/* Category — M3 filter chips */}
        <div>
          <p className="text-xs font-medium text-m3-on-surface-variant uppercase tracking-widest mb-3">
            Category
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const active = categoryId === cat.id;
              return (
                <button key={cat.id} type="button" onClick={() => setCategoryId(cat.id)}
                  className={`flex items-center gap-1.5 h-8 px-3 rounded-full text-sm font-medium
                               border transition-all active:scale-95
                               ${active
                                 ? "bg-m3-primary-container border-m3-primary text-m3-on-primary-container"
                                 : "bg-m3-surface border-m3-outline-variant text-m3-on-surface-variant"
                               }`}>
                  {active && (
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-m3-primary flex-shrink-0">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  )}
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Description — M3 Filled text field */}
        <div className="relative bg-m3-surface-container rounded-t-md border-b-2
                        border-m3-outline focus-within:border-m3-primary transition-colors px-4 pt-5 pb-2">
          <label className="absolute top-1.5 left-4 text-xs font-medium text-m3-on-surface-variant">
            Description
          </label>
          <input type="text" required placeholder="What did you buy?"
            value={description} onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-transparent text-sm text-m3-on-surface outline-none
                       placeholder-m3-outline" />
        </div>

        {/* Date — M3 Filled text field */}
        <div className="relative bg-m3-surface-container rounded-t-md border-b-2
                        border-m3-outline focus-within:border-m3-primary transition-colors px-4 pt-5 pb-2">
          <label className="absolute top-1.5 left-4 text-xs font-medium text-m3-on-surface-variant">
            Date
          </label>
          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)}
            className="w-full bg-transparent text-sm text-m3-on-surface outline-none" />
        </div>

        {createExpense.error && (
          <p className="text-xs text-red-700 bg-red-50 rounded-xl px-4 py-3">
            Something went wrong. Please try again.
          </p>
        )}

        {/* M3 Filled button */}
        <button type="submit" disabled={createExpense.isPending || !categoryId}
          className="w-full py-3.5 bg-m3-primary text-m3-on-primary font-medium text-sm
                     rounded-full shadow-sm transition-all active:opacity-80 disabled:opacity-40">
          {createExpense.isPending ? "Saving…" : "Add Expense"}
        </button>
      </form>
    </AppLayout>
  );
}
