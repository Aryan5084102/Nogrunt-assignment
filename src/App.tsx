"use client";
import { useState } from 'react';
import { Package, GripVertical, ChevronLeft, ChevronRight, CheckCircle2, Menu } from 'lucide-react';

const ITEMS_PER_PAGE = 8;
const TOTAL_ITEMS = 40;

const initialData = Array.from({ length: TOTAL_ITEMS }, (_, i) => ({
  id: `prod-${i}`,
  name: `Premium Product ${i + 1}`,
}));

export default function ProductManager() {
  const [products, setProducts] = useState(initialData);
  const [page, setPage] = useState(1);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const currentItems = products.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const onDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDropTargetIndex(index);
  };

  const handlePageHover = (newPage: number) => {
    if (draggedIndex !== null && newPage >= 1 && newPage <= 5) {
      setPage(newPage);
    }
  };

  const onDrop = (localIndex: number) => {
    if (draggedIndex === null) return;
    const globalTargetIndex = (page - 1) * ITEMS_PER_PAGE + localIndex;
    const itemName = products[draggedIndex].name;
    const newProducts = [...products];
    const [removed] = newProducts.splice(draggedIndex, 1);
    newProducts.splice(globalTargetIndex, 0, removed);
    setProducts(newProducts);
    setDraggedIndex(null);
    setDropTargetIndex(null);
    setToast(`Moved ${itemName} to Page ${page}`);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Toast - Responsive positioning */}
        {toast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 md:left-auto md:right-5 md:translate-x-0 bg-[#3bdf7f] text-black px-4 py-2 md:px-6 md:py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce z-[1000] text-sm md:text-base font-bold whitespace-nowrap">
            <CheckCircle2 size={18} /> {toast}
          </div>
        )}

        {/* Header - Responsive Flex */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 bg-[#1e293b] p-5 md:p-6 rounded-3xl border border-white/5 shadow-xl">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-[#ba6b3f] to-[#f86e42] bg-clip-text text-transparent italic tracking-tighter">
              NOGRUNT PRO
            </h1>
            <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest mt-1">Inventory Management</p>
          </div>
          
          {/* Pagination - Full width on mobile */}
          <div className="flex items-center justify-between w-full md:w-auto gap-4 bg-black/20 p-2 rounded-2xl border border-white/5">
            <button 
              onDragOver={() => handlePageHover(page - 1)}
              className={`p-3 rounded-xl transition-all ${draggedIndex !== null ? 'bg-[#3bdf7f]/20 text-[#3bdf7f] animate-pulse' : 'hover:bg-white/5'}`}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft size={24} />
            </button>
            <div className="text-center px-4 min-w-[80px]">
              <p className="text-[10px] text-slate-500 font-mono">PAGE</p>
              <p className="font-black text-xl leading-none">{page} / 5</p>
            </div>
            <button 
              onDragOver={() => handlePageHover(page + 1)}
              className={`p-3 rounded-xl transition-all ${draggedIndex !== null ? 'bg-[#3bdf7f]/20 text-[#3bdf7f] animate-pulse' : 'hover:bg-white/5'}`}
              onClick={() => setPage(p => Math.min(5, p + 1))}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </header>

        {/* List Container - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 relative">
          {currentItems.map((item, index) => {
            const isBeingDragged = draggedIndex === startIndex + index;
            const isDropTarget = dropTargetIndex === index;

            return (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => onDragStart(e, startIndex + index)}
                onDragOver={(e) => onDragOver(e, index)}
                onDragLeave={() => setDropTargetIndex(null)}
                onDrop={() => onDrop(index)}
                className={`group relative flex items-center justify-between p-4 md:p-6 rounded-2xl border-2 transition-all duration-300 cursor-move ${
                  isBeingDragged ? 'opacity-20 scale-95 border-dashed' : 
                  isDropTarget ? 'border-[#3bdf7f] bg-[#3bdf7f]/10 translate-y-1' : 
                  'border-white/5 bg-[#1e293b] hover:border-[#ba6b3f]/40'
                }`}
              >
                <div className="flex items-center gap-3 md:gap-6 overflow-hidden">
                  <GripVertical className="hidden md:block text-slate-700 group-hover:text-slate-400" size={24} />
                  <div className={`h-10 w-10 md:h-14 md:w-14 shrink-0 rounded-xl md:rounded-2xl flex items-center justify-center transition-colors ${isDropTarget ? 'bg-[#3bdf7f] text-black' : 'bg-slate-800 text-[#3bdf7f]'}`}>
                    <Package size={22} className="md:hidden" />
                    <Package size={28} className="hidden md:block" />
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-base md:text-lg tracking-tight truncate">{item.name}</p>
                    <div className="flex items-center gap-2 md:gap-4 mt-0.5">
                      <span className="text-[9px] md:text-[10px] font-mono text-slate-500 bg-black/30 px-1.5 py-0.5 rounded truncate max-w-[80px] md:max-w-none">ID: {item.id}</span>
                      <span className="text-[9px] md:text-[10px] font-mono text-[#ba6b3f] font-bold">SLOT: {startIndex + index}</span>
                    </div>
                  </div>
                </div>
                
                {/* Drag Indicator for Touch/Visual */}
                <div className="md:hidden text-slate-600">
                  <Menu size={20} />
                </div>

                {isDropTarget && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#3bdf7f] text-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg z-10">
                    Insert
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}