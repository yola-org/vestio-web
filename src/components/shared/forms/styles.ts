/** Shared visual tokens for native controls and React Select. */
export const controlHeight = 48
export const controlBaseClass =
  "min-w-0 w-full rounded-xl border bg-white text-sm font-medium text-primary outline-none transition disabled:cursor-not-allowed disabled:bg-primary/5 disabled:opacity-50 placeholder:text-primary/45"
export const controlClass = `${controlBaseClass} border-primary/15 hover:border-primary/25 focus:border-deep-accent focus:ring-2 focus:ring-deep-accent/10 aria-invalid:border-red-500 aria-invalid:focus:border-red-500 aria-invalid:focus:ring-red-500/10`
export const inputClass = `${controlClass} px-3 py-3`
export const labelClass = "block text-sm font-bold text-primary"
export const checkboxClass =
  "size-4 shrink-0 rounded border-primary/20 accent-deep-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep-accent disabled:cursor-not-allowed disabled:opacity-50"
