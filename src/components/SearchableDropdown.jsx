import { useEffect, useMemo, useState } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

export default function SearchableDropdown({
  options,
  valueKey = 'id',
  labelKey = 'fullName',
  display,
  placeholder,
  value,
  onChange,
  className,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const getLabel = (o) => {
    if (display) return String(display(o) || '');
    return String(o[labelKey] || '');
  };

  const selected = options.find((o) => String(o[valueKey]) === String(value)) || null;

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => {
      const haystack = [
        getLabel(o),
        o.branch,
        o.phone,
        o.documentId,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, searchTerm, display, labelKey]);

  useEffect(() => {
    if (isOpen) setHighlightIndex(-1);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) setSearchTerm('');
  }, [isOpen]);

  const selectOption = (option) => {
    setSearchTerm(getLabel(option));
    setIsOpen(false);
    onChange(option[valueKey]);
  };

  return (
    <div className="relative z-40">
      <div className="relative">
        <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={isOpen ? searchTerm : selected ? getLabel(selected) : ''}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder || 'ابحث...'}
          className={`input-field pr-10 ${className}`}
        />
        <button
          type="button"
          onClick={() => {
            setIsOpen((v) => !v);
            if (isOpen) setSearchTerm('');
          }}
          className="absolute left-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          aria-label="فتح/إغلاق القائمة"
        >
          {isOpen ? <X className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsOpen(false);
            }}
          />
          <ul className="absolute right-0 z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-1 shadow-2xl">
            {filtered.length === 0 && (
              <li className="px-3 py-3 text-center text-sm font-medium text-gray-400">
                لا توجد نتائج مطابقة
              </li>
            )}
            {filtered.map((option, i) => {
              const isActive = String(option[valueKey]) === String(value);
              return (
                <li key={option[valueKey]}>
                  <button
                    type="button"
                    onClick={() => selectOption(option)}
                    onMouseEnter={() => setHighlightIndex(i)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-right text-sm font-semibold transition ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800'
                        : highlightIndex === i
                          ? 'bg-gray-100 text-gray-800'
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="truncate">
                      {getLabel(option) || '—'}
                    </span>
                    <span className="shrink-0 text-[11px] font-bold text-gray-400">
                      {option.branch || ''}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}