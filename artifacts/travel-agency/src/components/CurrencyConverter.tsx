import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, X, RefreshCw } from "lucide-react";

const CURRENCIES = [
  { code: "DZD", symbol: "د.ج", name: "الدينار الجزائري", rate: 1 },
  { code: "EUR", symbol: "€", name: "اليورو", rate: 145.5 },
  { code: "USD", symbol: "$", name: "الدولار الأمريكي", rate: 134.2 },
  { code: "SAR", symbol: "ر.س", name: "الريال السعودي", rate: 35.8 },
];

export function CurrencyConverter() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("100");
  const [fromCurrency, setFromCurrency] = useState("EUR");
  const [toCurrency, setToCurrency] = useState("DZD");

  const from = CURRENCIES.find(c => c.code === fromCurrency)!;
  const to = CURRENCIES.find(c => c.code === toCurrency)!;

  const result = ((parseFloat(amount) || 0) * from.rate / to.rate).toFixed(2);

  const swap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-muted/60 hover:bg-primary/10 transition-colors border border-border/40 text-xs font-semibold"
        title="محوّل العملات"
      >
        <DollarSign className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">عملة</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full mt-2 bg-card border border-border/50 rounded-2xl shadow-2xl z-50 w-80 p-5 ltr:right-0 rtl:left-0"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">محوّل العملات</h3>
                <button onClick={() => setOpen(false)} className="p-1 rounded-full hover:bg-muted">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">المبلغ</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full h-11 rounded-xl bg-muted/50 border border-input px-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                    min="0"
                    dir="ltr"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">من</label>
                    <select
                      value={fromCurrency}
                      onChange={(e) => setFromCurrency(e.target.value)}
                      className="w-full h-11 rounded-xl bg-muted/50 border border-input px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {CURRENCIES.map(c => (
                        <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
                      ))}
                    </select>
                  </div>

                  <button onClick={swap} className="mt-5 p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors">
                    <RefreshCw className="w-4 h-4 text-primary" />
                  </button>

                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">إلى</label>
                    <select
                      value={toCurrency}
                      onChange={(e) => setToCurrency(e.target.value)}
                      className="w-full h-11 rounded-xl bg-muted/50 border border-input px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {CURRENCIES.map(c => (
                        <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{amount} {from.symbol} =</p>
                  <p className="text-2xl font-bold text-primary">{result} {to.symbol}</p>
                  <p className="text-xs text-muted-foreground mt-1">{to.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {CURRENCIES.filter(c => c.code !== "DZD").map(c => (
                    <div key={c.code} className="bg-muted/50 rounded-xl p-3 text-center">
                      <p className="text-xs text-muted-foreground">{c.code}</p>
                      <p className="font-bold text-sm">{c.rate.toFixed(1)} <span className="text-xs text-muted-foreground">د.ج</span></p>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground text-center">* أسعار تقريبية للاسترشاد فقط</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
