import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const MIN_YEAR = 2024;
const MIN_MONTH_INDEX = 10; // Noviembre (0-indexed)

export default function MonthPicker({ startDate, endDate, onDateChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selecting, setSelecting] = useState('start'); 
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const dropdownRef = useRef(null);

  // Obtenemos la fecha límite actual (Hoy)
  const currentDate = new Date();
  const MAX_YEAR = currentDate.getFullYear();
  const MAX_MONTH_INDEX = currentDate.getMonth();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDisplay = (dateString) => {
    if (!dateString) return 'Seleccionar';
    const [year, month] = dateString.split('-');
    return `${MONTHS[parseInt(month) - 1]} ${year}`;
  };

  const handleMonthSelect = (monthIndex) => {
    const selectedDate = `${viewYear}-${String(monthIndex + 1).padStart(2, '0')}`;
    
    // Doble validación de seguridad (Mínimo y Máximo)
    if (viewYear === MIN_YEAR && monthIndex < MIN_MONTH_INDEX) return;
    if (viewYear === MAX_YEAR && monthIndex > MAX_MONTH_INDEX) return;

    if (selecting === 'start') {
      if (endDate && selectedDate > endDate) {
        onDateChange(selectedDate, '');
      } else {
        onDateChange(selectedDate, endDate);
      }
      setSelecting('end');
    } else {
      if (startDate && selectedDate < startDate) {
        onDateChange(selectedDate, '');
        setSelecting('end');
      } else {
        onDateChange(startDate, selectedDate);
        setIsOpen(false); 
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-lg px-4 py-2 text-sm transition-all shadow-inner group"
      >
        <Calendar size={16} className="text-blue-500 group-hover:text-blue-400 transition-colors" />
        <div className="flex items-center gap-2">
          <span className="text-slate-200 font-medium">{formatDisplay(startDate)}</span>
          <span className="text-slate-600">-</span>
          <span className="text-slate-200 font-medium">{endDate ? formatDisplay(endDate) : 'Presente'}</span>
        </div>
        <ChevronDown size={14} className={`text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 left-0 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4 z-50 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-4">
              <button 
                onClick={() => setViewYear(prev => Math.max(MIN_YEAR, prev - 1))} 
                disabled={viewYear <= MIN_YEAR}
                className={`p-1 rounded transition-colors ${viewYear <= MIN_YEAR ? 'text-slate-700 cursor-not-allowed' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-slate-200 font-medium tracking-wider">{viewYear}</span>
              <button 
                onClick={() => setViewYear(prev => Math.min(MAX_YEAR, prev + 1))} 
                disabled={viewYear >= MAX_YEAR}
                className={`p-1 rounded transition-colors ${viewYear >= MAX_YEAR ? 'text-slate-700 cursor-not-allowed' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="flex gap-2 mb-4 bg-slate-950 p-1 rounded-lg">
              <button 
                onClick={() => setSelecting('start')}
                className={`flex-1 text-xs py-1.5 rounded-md transition-all ${selecting === 'start' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Desde
              </button>
              <button 
                onClick={() => setSelecting('end')}
                className={`flex-1 text-xs py-1.5 rounded-md transition-all ${selecting === 'end' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Hasta
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {MONTHS.map((month, index) => {
                const currentIterDate = `${viewYear}-${String(index + 1).padStart(2, '0')}`;
                
                // Lógica de deshabilitado (No antes de Nov 2024, no después del mes actual)
                const isBeforeMin = viewYear === MIN_YEAR && index < MIN_MONTH_INDEX;
                const isAfterMax = viewYear > MAX_YEAR || (viewYear === MAX_YEAR && index > MAX_MONTH_INDEX);
                const isDisabled = isBeforeMin || isAfterMax;

                const isSelectedStart = currentIterDate === startDate;
                const isSelectedEnd = currentIterDate === endDate;
                const isInRange = startDate && endDate && currentIterDate > startDate && currentIterDate < endDate;

                return (
                  <button
                    key={month}
                    disabled={isDisabled}
                    onClick={() => handleMonthSelect(index)}
                    className={`
                      py-2 text-sm rounded-lg transition-all border
                      ${isDisabled ? 'opacity-20 cursor-not-allowed border-transparent text-slate-500' : ''}
                      ${isSelectedStart || isSelectedEnd ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]' : ''}
                      ${isInRange ? 'bg-blue-900/40 border-blue-900/50 text-blue-200' : ''}
                      ${!isSelectedStart && !isSelectedEnd && !isInRange && !isDisabled ? 'bg-slate-800/50 border-transparent text-slate-300 hover:border-slate-600 hover:bg-slate-800' : ''}
                    `}
                  >
                    {month}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}