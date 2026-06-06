import { useState } from 'react';
import { Upload, Calendar, CheckCircle, Building2 } from 'lucide-react';
import { cn } from './ui/utils';

const rfqSummary = {
  id: 'RFQ-2024-088',
  title: 'Server Infrastructure Upgrade',
  deadline: '18 Jun 2024',
  buyer: 'VendorBridge Corp.',
  items: [
    { name: 'Dell PowerEdge R750 Server', qty: 2, unit: 'pcs' },
    { name: 'Network Switches (48-port)', qty: 4, unit: 'pcs' },
    { name: 'UPS Battery Systems', qty: 3, unit: 'pcs' },
    { name: 'SSD Storage Arrays (8TB)', qty: 6, unit: 'pcs' },
    { name: 'Server Rack Enclosures', qty: 2, unit: 'pcs' },
    { name: 'Installation & Configuration', qty: 1, unit: 'service' },
  ],
};

export function QuotationSubmission() {
  const [submitted, setSubmitted] = useState(false);
  const [prices, setPrices] = useState<Record<number, string>>({ 0: '125000', 1: '42000', 2: '85000', 3: '70000', 4: '107500', 5: '190000' });
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [dragging, setDragging] = useState(false);

  const totals = rfqSummary.items.map((item, i) => (parseFloat(prices[i] || '0') || 0) * item.qty);
  const grandTotal = totals.reduce((s, t) => s + t, 0);

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-[#D4EEEC] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-[#00706A]" />
          </div>
          <h2 className="font-bold text-[#0D1F1E] mb-2" style={{ fontSize: 22 }}>Quotation Submitted!</h2>
          <p className="text-[#527270] text-sm mb-6">Your quotation for {rfqSummary.title} has been submitted successfully. The buyer will review it and respond shortly.</p>
          <div className="bg-[#EBF7F6] rounded-xl p-4 mb-6 text-left">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[#527270]">RFQ ID</span>
              <span className="font-medium text-[#0D1F1E]">{rfqSummary.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#527270]">Total Quote Value</span>
              <span className="font-bold text-[#004643]">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <button onClick={() => setSubmitted(false)} className="w-full py-2.5 rounded-lg text-sm font-medium text-white"
            style={{ background: 'linear-gradient(135deg, #004643, #00706A)' }}>
            View My Quotations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Minimal header for vendor view */}
      <div className="bg-white rounded-xl border border-[#C8E0DE]/60 p-5"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-bold text-[#0D1F1E]" style={{ fontSize: 20 }}>Submit Quotation</h2>
            <p className="text-[#527270] mt-0.5 text-sm">{rfqSummary.title}</p>
            <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#D4EEEC] text-[#004643]">
              {rfqSummary.id}
            </span>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#527270]">Deadline</p>
            <p className="font-semibold text-[#C0392B] text-sm mt-0.5">{rfqSummary.deadline}</p>
          </div>
        </div>
      </div>

      {/* RFQ summary */}
      <div className="bg-white rounded-xl border border-[#C8E0DE]/60 overflow-hidden"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#D8EDEB] bg-[#EBF7F6]">
          <Building2 className="w-4 h-4 text-[#004643]" />
          <div>
            <p className="text-xs text-[#527270]">Buyer Organization</p>
            <p className="font-semibold text-[#0D1F1E] text-sm">{rfqSummary.buyer}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-[#527270]">Items Requested</p>
            <p className="font-semibold text-[#0D1F1E] text-sm">{rfqSummary.items.length} items</p>
          </div>
        </div>
        <div className="p-5">
          <h4 className="font-semibold text-[#0D1F1E] text-sm mb-3">Your Price Quotation</h4>
          <div className="space-y-3">
            {rfqSummary.items.map((item, i) => {
              const total = (parseFloat(prices[i] || '0') || 0) * item.qty;
              return (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 bg-[#EBF7F6] rounded-lg border border-[#D8EDEB]">
                  <div className="sm:col-span-1">
                    <p className="font-medium text-[#0D1F1E] text-sm">{item.name}</p>
                    <p className="text-xs text-[#527270] mt-0.5">Qty: {item.qty} {item.unit}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-[#527270] mb-1">Unit Price (₹)</label>
                    <input type="number" value={prices[i] || ''} onChange={e => setPrices(prev => ({ ...prev, [i]: e.target.value }))}
                      placeholder="0.00"
                      className="w-full px-2.5 py-1.5 border border-[#C8E0DE] rounded text-sm text-[#0D1F1E] focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs text-[#527270] mb-1">Total (auto)</label>
                    <div className="px-2.5 py-1.5 bg-[#D4EEEC] border border-[#004643]/20 rounded text-sm font-medium text-[#004643]">
                      ₹{total.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-[#527270] mb-1">Notes</label>
                    <input type="text" value={notes[i] || ''} onChange={e => setNotes(prev => ({ ...prev, [i]: e.target.value }))}
                      placeholder="e.g. brand, model"
                      className="w-full px-2.5 py-1.5 border border-[#C8E0DE] rounded text-sm text-[#0D1F1E] focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grand total */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#C8E0DE]/60">
            <span className="font-bold text-[#0D1F1E]">Total Quotation Value</span>
            <span className="font-bold text-[#004643] text-xl">₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Additional details */}
      <div className="bg-white rounded-xl border border-[#C8E0DE]/60 p-5 space-y-4"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <h4 className="font-semibold text-[#0D1F1E] text-sm">Additional Details</h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">Delivery Timeline</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#527270]" />
              <input type="date" defaultValue="2024-06-30"
                className="w-full pl-9 pr-4 py-2.5 border border-[#C8E0DE] rounded-lg text-sm focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">Validity Period (days)</label>
            <input type="number" defaultValue="30"
              className="w-full px-3 py-2.5 border border-[#C8E0DE] rounded-lg text-sm focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">General Notes</label>
          <textarea rows={3} placeholder="Any additional terms, conditions, or notes for the buyer..."
            className="w-full px-3 py-2.5 border border-[#C8E0DE] rounded-lg text-sm focus:outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all resize-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0D1F1E] mb-1.5">Attachments</label>
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); }}
            className={cn(
              'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors',
              dragging ? 'border-[#004643] bg-[#D4EEEC]' : 'border-[#C8E0DE] hover:border-[#004643] hover:bg-[#EBF7F6]'
            )}>
            <Upload className="w-5 h-5 text-[#527270] mx-auto mb-2" />
            <p className="text-sm text-[#527270]">Drag & drop or <span className="text-[#004643] font-medium">browse</span></p>
            <p className="text-xs text-[#527270] mt-0.5">PDF, DOC, XLSX — Max 10MB</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-[#C8E0DE]/60 px-6 py-4"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <button className="px-5 py-2.5 rounded-lg text-sm font-medium border border-[#004643] text-[#004643] hover:bg-[#D4EEEC] transition-colors">
          Save Draft
        </button>
        <button onClick={() => setSubmitted(true)}
          className="px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #004643, #00706A)', boxShadow: '0 4px 12px rgba(0,70,67,0.3)' }}>
          Submit Quotation
        </button>
      </div>
    </div>
  );
}
