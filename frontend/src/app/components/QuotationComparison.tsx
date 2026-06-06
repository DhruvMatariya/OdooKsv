import { useState } from 'react';
import { Star, ArrowUpDown, CheckCircle2, TrendingDown } from 'lucide-react';
import { cn } from './ui/utils';

const rfqDetails = {
  id: 'RFQ-2024-088',
  title: 'Server Infrastructure Upgrade',
  items: 6,
  deadline: '18 Jun 2024',
  status: 'under-review',
};

const vendors = [
  {
    name: 'TechParts Ltd',
    initials: 'TP',
    rating: 4.5,
    total: 1285000,
    delivery: '25 Jun 2024',
    color: '#004643',
    items: [125000, 45000, 280000, 420000, 215000, 200000],
  },
  {
    name: 'Apex Components',
    initials: 'AC',
    rating: 4.2,
    total: 1190000,
    delivery: '30 Jun 2024',
    color: '#00706A',
    items: [118000, 42000, 265000, 390000, 205000, 170000],
  },
  {
    name: 'Global Metals Inc.',
    initials: 'GM',
    rating: 3.8,
    total: 1340000,
    delivery: '22 Jun 2024',
    color: '#9A6800',
    items: [130000, 48000, 295000, 440000, 225000, 202000],
  },
];

const lineItems = [
  { name: 'Dell PowerEdge R750 Server', qty: 2, unit: 'pcs' },
  { name: 'Network Switches (48-port)', qty: 4, unit: 'pcs' },
  { name: 'UPS Battery Systems', qty: 3, unit: 'pcs' },
  { name: 'SSD Storage Arrays (8TB)', qty: 6, unit: 'pcs' },
  { name: 'Server Rack Enclosures', qty: 2, unit: 'pcs' },
  { name: 'Installation & Configuration', qty: 1, unit: 'service' },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={cn('w-3.5 h-3.5', i <= Math.floor(rating) ? 'fill-[#9A6800] text-[#9A6800]' : i - 0.5 <= rating ? 'fill-[#9A6800]/50 text-[#9A6800]' : 'text-[#C8E0DE]')} />
      ))}
      <span className="text-xs text-[#527270] ml-1">{rating}</span>
    </div>
  );
}

export function QuotationComparison() {
  const [selected, setSelected] = useState<number | null>(1);
  const [sortBy, setSortBy] = useState<'price' | 'delivery' | 'rating'>('price');

  const minTotal = Math.min(...vendors.map(v => v.total));

  const sortedVendors = [...vendors].sort((a, b) => {
    if (sortBy === 'price') return a.total - b.total;
    if (sortBy === 'rating') return b.rating - a.rating;
    return new Date(a.delivery).getTime() - new Date(b.delivery).getTime();
  });

  const getMinForItem = (idx: number) => Math.min(...vendors.map(v => v.items[idx]));

  return (
    <div className="space-y-5">
      {/* RFQ summary bar */}
      <div className="bg-white rounded-xl border border-[#C8E0DE]/60 px-5 py-4 flex flex-wrap items-center gap-6"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div>
          <p className="text-xs text-[#527270]">RFQ</p>
          <p className="font-semibold text-[#0D1F1E]">{rfqDetails.id}</p>
        </div>
        <div>
          <p className="text-xs text-[#527270]">Title</p>
          <p className="font-medium text-[#0D1F1E]">{rfqDetails.title}</p>
        </div>
        <div>
          <p className="text-xs text-[#527270]">Items</p>
          <p className="font-medium text-[#0D1F1E]">{rfqDetails.items} items</p>
        </div>
        <div>
          <p className="text-xs text-[#527270]">Deadline</p>
          <p className="font-medium text-[#0D1F1E]">{rfqDetails.deadline}</p>
        </div>
        <div className="ml-auto">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#FFF0C8] text-[#9A6800]">Under Review</span>
        </div>
      </div>

      {/* Sort controls */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-[#527270]">Sort by:</span>
        {(['price', 'delivery', 'rating'] as const).map(s => (
          <button key={s} onClick={() => setSortBy(s)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-all capitalize',
              sortBy === s ? 'bg-[#004643] text-white border-[#004643]' : 'border-[#C8E0DE] text-[#527270] hover:border-[#004643] hover:text-[#004643]'
            )}>
            <ArrowUpDown className="w-3.5 h-3.5" /> {s}
          </button>
        ))}
      </div>

      {/* Comparison table */}
      <div className="bg-white rounded-xl border border-[#C8E0DE]/60 overflow-hidden"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-[#C8E0DE]/60">
                <th className="px-5 py-4 text-left bg-[#EBF7F6] w-52 sticky left-0 z-10">
                  <span className="text-xs font-semibold text-[#527270] uppercase tracking-wide">Item Details</span>
                </th>
                {sortedVendors.map((v, vi) => (
                  <th key={v.name} className="px-4 py-4 text-center min-w-[180px]">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-semibold text-xs"
                        style={{ background: v.color }}>
                        {v.initials}
                      </div>
                      <span className="font-semibold text-[#0D1F1E] text-sm">{v.name}</span>
                      <StarRating rating={v.rating} />
                      {v.total === minTotal && (
                        <span className="flex items-center gap-1 text-xs text-[#00706A] bg-[#D4EEEC] px-2 py-0.5 rounded-full">
                          <TrendingDown className="w-3 h-3" /> Lowest
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, idx) => {
                const minPrice = getMinForItem(idx);
                return (
                  <tr key={item.name} className={cn('border-t border-[#D8EDEB]', idx % 2 === 1 && 'bg-[#EEF7F6]')}>
                    <td className="px-5 py-3.5 sticky left-0 bg-inherit">
                      <p className="font-medium text-[#0D1F1E]" style={{ fontSize: 13 }}>{item.name}</p>
                      <p className="text-xs text-[#527270] mt-0.5">Qty: {item.qty} {item.unit}</p>
                    </td>
                    {sortedVendors.map((v) => {
                      const price = v.items[idx];
                      const isLowest = price === minPrice;
                      return (
                        <td key={v.name} className="px-4 py-3.5 text-center">
                          <div className={cn(
                            'inline-flex items-center justify-center px-3 py-1.5 rounded-lg font-medium text-sm',
                            isLowest ? 'bg-[#D4EEEC] text-[#00706A]' : 'text-[#0D1F1E]'
                          )}>
                            ₹{price.toLocaleString('en-IN')}
                            {isLowest && <CheckCircle2 className="w-3.5 h-3.5 ml-1" />}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* Delivery row */}
              <tr className="border-t-2 border-[#C8E0DE]/60 bg-[#EBF7F6]">
                <td className="px-5 py-3.5 font-semibold text-[#0D1F1E] text-sm sticky left-0 bg-[#EBF7F6]">Delivery Date</td>
                {sortedVendors.map(v => (
                  <td key={v.name} className="px-4 py-3.5 text-center text-sm text-[#527270] font-medium">{v.delivery}</td>
                ))}
              </tr>

              {/* Total row */}
              <tr className="border-t border-[#C8E0DE]/60">
                <td className="px-5 py-4 font-bold text-[#0D1F1E] sticky left-0 bg-white">Grand Total</td>
                {sortedVendors.map(v => (
                  <td key={v.name} className="px-4 py-4 text-center">
                    <span className={cn(
                      'text-base font-bold',
                      v.total === minTotal ? 'text-[#00706A]' : 'text-[#0D1F1E]'
                    )}>
                      ₹{v.total.toLocaleString('en-IN')}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Action row */}
              <tr className="border-t border-[#D8EDEB] bg-[#EBF7F6]">
                <td className="px-5 py-4 sticky left-0 bg-[#EBF7F6]" />
                {sortedVendors.map((v, vi) => (
                  <td key={v.name} className="px-4 py-4 text-center">
                    <button
                      onClick={() => setSelected(vi)}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                        selected === vi
                          ? 'text-white' + ' shadow-md'
                          : 'border border-[#004643] text-[#004643] hover:bg-[#D4EEEC]'
                      )}
                      style={selected === vi ? { background: 'linear-gradient(135deg, #004643, #00706A)' } : {}}>
                      {selected === vi ? '✓ Selected' : 'Select Vendor'}
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sortedVendors.map((v, vi) => (
          <div key={v.name}
            className={cn(
              'bg-white rounded-xl border p-5 transition-all',
              selected === vi ? 'border-[#004643] shadow-md' : 'border-[#C8E0DE]/60'
            )}
            style={{ boxShadow: selected === vi ? '0 4px 20px rgba(0,70,67,0.15)' : '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                style={{ background: v.color }}>
                {v.initials}
              </div>
              <div>
                <p className="font-semibold text-[#0D1F1E] text-sm">{v.name}</p>
                <StarRating rating={v.rating} />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-[#527270]">Total Quote</span>
                <span className="font-bold text-[#0D1F1E]">₹{v.total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-[#527270]">Delivery</span>
                <span className="text-sm font-medium text-[#0D1F1E]">{v.delivery}</span>
              </div>
              {v.total === minTotal && (
                <div className="flex items-center gap-1.5 text-xs text-[#00706A] bg-[#D4EEEC] px-2.5 py-1.5 rounded-lg">
                  <TrendingDown className="w-3.5 h-3.5" />
                  Lowest price — saves ₹{Math.max(...vendors.map(x => x.total) as any) - v.total > 0 ? (Math.max(...vendors.map(x => x.total)) - v.total).toLocaleString('en-IN') : '0'}
                </div>
              )}
            </div>

            <button
              onClick={() => setSelected(vi)}
              className={cn(
                'w-full mt-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                selected === vi
                  ? 'text-white'
                  : 'border border-[#004643] text-[#004643] hover:bg-[#D4EEEC]'
              )}
              style={selected === vi ? { background: 'linear-gradient(135deg, #004643, #00706A)' } : {}}>
              {selected === vi ? '✓ Selected & Proceed' : 'Select & Proceed'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
