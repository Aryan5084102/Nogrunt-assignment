"use client";
import { useState, useRef } from 'react';
import { Package, GripVertical, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Move } from 'lucide-react';

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
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  const pageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const currentItems = products.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const onDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    
    // FIX: Ghost image ko container ke andar fix rakhne ke liye cursor offset set kiya
    const dragImg = new Image();
    e.dataTransfer.setDragImage(dragImg, 0, 0); 
  };

  const stopPageTimer = () => {
    if (pageTimerRef.current) {
      clearTimeout(pageTimerRef.current);
      pageTimerRef.current = null;
    }
  };

  const handlePageHover = (newPage: number) => {
    if (draggedIndex === null || newPage < 1 || newPage > 5 || page === newPage) return;
    stopPageTimer(); 
    pageTimerRef.current = setTimeout(() => {
      setPage(newPage);
      pageTimerRef.current = null;
    }, 700);
  };

  const onDrop = (localIndex: number | null) => {
    stopPageTimer();
    
    if (draggedIndex === null) {
      setToast({ msg: "Drop Failed: No item was actively being dragged.", type: 'error' });
      return;
    }

    const targetIdx = localIndex ?? dropTargetIndex ?? 0;
    const globalTargetIndex = (page - 1) * ITEMS_PER_PAGE + targetIdx;

    if (draggedIndex === globalTargetIndex) {
      setDraggedIndex(null);
      setDropTargetIndex(null);
      return;
    }

    const sourcePage = Math.floor(draggedIndex / ITEMS_PER_PAGE) + 1;
    const itemName = products[draggedIndex].name;
    
    let message = "";
    if (sourcePage === page) {
      message = `Successfully reordered "${itemName}" at Position ${globalTargetIndex + 1} on Page ${page}.`;
    } else {
      message = `Transferred "${itemName}" from Page ${sourcePage} to Page ${page} (Slot ${targetIdx + 1}).`;
    }

    const newProducts = [...products];
    const [removed] = newProducts.splice(draggedIndex, 1);
    newProducts.splice(globalTargetIndex, 0, removed);
    
    setProducts(newProducts);
    setDraggedIndex(null);
    setDropTargetIndex(null);
    setToast({ msg: message, type: 'success' });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    // FIX: select-none add kiya taaki drag ke time text blue/highlight na ho
    <div className="min-h-screen bg-[#0f172a] text-white p-4 md:p-8 font-sans flex items-center justify-center select-none">
      <div className="max-w-2xl w-full bg-[#1e293b] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden flex flex-col h-[750px] relative">
        
        {toast && (
          <div className={`fixed top-10 left-1/2 -translate-x-1/2 min-w-[320px] ${toast.type === 'success' ? 'bg-[#3bdf7f]' : 'bg-red-500'} text-black px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-[1000] font-bold animate-in fade-in zoom-in slide-in-from-top-4 duration-300`}>
            {toast.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            <span className="text-sm uppercase tracking-tight leading-tight">{toast.msg}</span>
          </div>
        )}

        <header className="sticky top-0 z-[100] bg-[#1e293b]/95 backdrop-blur-md p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-black bg-gradient-to-r from-[#ba6b3f] to-[#f86e42] bg-clip-text text-transparent italic tracking-tighter uppercase">
              Nogrunt 
            </h1>
            <p className="text-slate-500 text-[9px] font-mono uppercase tracking-[0.2em] mt-0.5 italic">Assignment</p>
          </div>
          
          <div className="flex items-center gap-4 bg-black/30 p-1.5 rounded-2xl border border-white/5 group">
            <button 
              onDragOver={(e) => { e.preventDefault(); handlePageHover(page - 1); }}
              onDragLeave={stopPageTimer}
              onClick={() => { stopPageTimer(); setPage(p => Math.max(1, p - 1)); }}
              disabled={page === 1}
              className={`p-2.5 rounded-xl transition-all ${draggedIndex !== null && page > 1 ? 'bg-[#3bdf7f]/20 text-[#3bdf7f] animate-pulse scale-110' : 'text-slate-500 hover:bg-white/5 disabled:opacity-20'}`}
            >
              <ChevronLeft size={22} />
            </button>

            <div className="flex flex-col items-center min-w-[90px]">
              <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest">Page</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white">{page}</span>
                <span className="text-slate-600 font-bold">/</span>
                <span className="text-sm font-bold text-slate-500">5</span>
              </div>
            </div>

            <button 
              onDragOver={(e) => { e.preventDefault(); handlePageHover(page + 1); }}
              onDragLeave={stopPageTimer}
              onClick={() => { stopPageTimer(); setPage(p => Math.min(5, p + 1)); }}
              disabled={page === 5}
              className={`p-2.5 rounded-xl transition-all ${draggedIndex !== null && page < 5 ? 'bg-[#3bdf7f]/20 text-[#3bdf7f] animate-pulse scale-110' : 'text-slate-500 hover:bg-white/5 disabled:opacity-20'}`}
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </header>

        {/* FIX: relative aur isolation add kiya taaki ghost image list se bahar na dikhe */}
        <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(null)}
            className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 custom-scrollbar relative isolation-auto"
        >
          {currentItems.map((item, index) => {
            const isBeingDragged = draggedIndex === startIndex + index;
            const isDropTarget = dropTargetIndex === index;

            return (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => onDragStart(e, startIndex + index)}
                onDragOver={(e) => { e.preventDefault(); setDropTargetIndex(index); }}
                onDragLeave={() => setDropTargetIndex(null)}
                onDragEnd={() => { setDraggedIndex(null); setDropTargetIndex(null); stopPageTimer(); }}
                onDrop={(e) => { e.stopPropagation(); onDrop(index); }}
                // FIX: touch-none add kiya Windows touch laptops ke liye
                className={`group relative flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 cursor-move touch-none ${
                  isBeingDragged ? 'opacity-20 scale-95 border-dashed border-[#ba6b3f]' : 
                  isDropTarget ? 'border-[#3bdf7f] bg-[#3bdf7f]/10 translate-x-1' : 
                  'border-white/5 bg-[#0f172a]/40 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-4">
                  <GripVertical className="text-slate-700 group-hover:text-slate-400" size={18} />
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center transition-colors ${isDropTarget ? 'bg-[#3bdf7f] text-black' : 'bg-slate-800 text-[#3bdf7f]'}`}>
                    <Package size={22} />
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-sm tracking-tight text-slate-200 truncate">{item.name}</p>
                    <p className="text-[9px] font-mono text-[#ba6b3f] font-bold mt-0.5 uppercase">Global Pos: {startIndex + index}</p>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-slate-600 px-2 py-1 bg-black/20 rounded-lg shrink-0">SLOT {index + 1}</div>
              </div>
            );
          })}
        </div>

        {draggedIndex !== null && (
          <div className="bg-[#ba6b3f] p-4 flex flex-col items-center justify-center gap-1 border-t border-white/10 shadow-[0_-10px_20px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom z-[200]">
            <div className="flex items-center gap-3">
               <Move className="animate-bounce text-white" size={18} />
               <p className="text-xs font-black uppercase tracking-widest text-white">
                 Moving: {products[draggedIndex].name}
               </p>
            </div>
            <p className="text-[9px] font-bold text-black/50 uppercase">From Page {Math.floor(draggedIndex/ITEMS_PER_PAGE) + 1} • Drop Anywhere in List</p>
          </div>
        )}
      </div>
    </div>
  );
}