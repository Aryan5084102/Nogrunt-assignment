import { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { Package, GripVertical, ChevronLeft, ChevronRight } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  position: number; 
}

const ITEMS_PER_PAGE = 8;
const TOTAL_ITEMS = 40;

const mockData: Product[] = Array.from({ length: TOTAL_ITEMS }, (_, i) => ({
  id: `prod-${i}`,
  name: `Premium Product ${i + 1}`,
  position: i,
}));

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>(mockData);
  const [page, setPage] = useState(1);

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => a.position - b.position);
  }, [products]);

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const currentPageData = sortedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    if (source.index === destination.index && source.droppableId === destination.droppableId) {
      return;
    }

    const oldGlobalIndex = source.index + startIndex;
    const newGlobalIndex = destination.index + startIndex;

    const reordered = [...sortedProducts];
    const [removed] = reordered.splice(oldGlobalIndex, 1);
    reordered.splice(newGlobalIndex, 0, removed);

    const updatedWithPositions = reordered.map((item, index) => ({
      ...item,
      position: index,
    }));

    setProducts(updatedWithPositions);
    
    updateBackendPosition(removed.id, newGlobalIndex);
  };

  const updateBackendPosition = (productId: string, newPosition: number) => {
    console.log("--- BACKEND API CALL ---");
    console.log(`Endpoint: PATCH /api/products/${productId}/position`);
    console.log(`Payload: { "newPosition": ${newPosition} }`);
    console.log("Strategy: Using 'Lexicographical Ranking' or 'Gap-based' indices to avoid updating 100+ rows.");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#ba6b3f]">Nogrunt Inventory</h1>
            <p className="text-slate-400">Drag products to reorder across pages</p>
          </div>
          <div className="flex items-center gap-4 bg-slate-800 p-2 rounded-lg">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              className="hover:text-[#3bdf7f] p-1"
              disabled={page === 1}
            >
              <ChevronLeft />
            </button>
            <span className="font-mono">Page {page} of {Math.ceil(TOTAL_ITEMS / ITEMS_PER_PAGE)}</span>
            <button 
              onClick={() => setPage(p => Math.min(5, p + 1))} 
              className="hover:text-[#3bdf7f] p-1"
              disabled={page === 5}
            >
              <ChevronRight />
            </button>
          </div>
        </header>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="product-list">
            {(provided) => (
              <div 
                {...provided.droppableProps} 
                ref={provided.innerRef} 
                className="grid grid-cols-1 gap-3"
              >
                {currentPageData.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                          snapshot.isDragging 
                            ? 'border-[#3bdf7f] bg-slate-700 scale-105 shadow-2xl z-50' 
                            : 'border-slate-700 bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div 
                            {...provided.dragHandleProps} 
                            className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-white"
                          >
                            <GripVertical size={20} />
                          </div>
                          <div className="bg-slate-700 p-2 rounded-lg text-[#3bdf7f]">
                            <Package size={20} />
                          </div>
                          <div>
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-xs text-slate-500">Global Pos: {item.position}</p>
                          </div>
                        </div>
                        <div className="text-sm font-mono text-slate-500">ID: {item.id}</div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}

