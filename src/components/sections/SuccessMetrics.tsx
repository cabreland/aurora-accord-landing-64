
import React from 'react';

const SuccessMetrics = () => {
  return (
    <section id="metrics" className="py-20 bg-[#2A3B3C]/50">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-12 text-[#FFC107]">Success Metrics</h2>
        
        <div className="bg-[#1C2526] rounded-lg overflow-hidden border border-[#4A5D70]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#FFC107]/20">
                <tr>
                  <th className="px-6 py-4 text-left text-[#FFC107] font-semibold">Manual Task</th>
                  <th className="px-6 py-4 text-left text-red-300 font-semibold">Current Time</th>
                  <th className="px-6 py-4 text-left text-green-300 font-semibold">Target Time</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-[#4A5D70] hover:bg-[#FFC107]/5">
                  <td className="px-6 py-4">Lead Qualification</td>
                  <td className="px-6 py-4 text-red-300 font-medium">45 min/lead</td>
                  <td className="px-6 py-4 text-[#FFC107] font-bold">5 min/lead</td>
                </tr>
                <tr className="border-b border-[#4A5D70] hover:bg-[#FFC107]/5">
                  <td className="px-6 py-4">Follow-up Sequences</td>
                  <td className="px-6 py-4 text-red-300 font-medium">30 min/sequence</td>
                  <td className="px-6 py-4 text-[#FFC107] font-bold">2 min/sequence</td>
                </tr>
                <tr className="border-b border-[#4A5D70] hover:bg-[#FFC107]/5">
                  <td className="px-6 py-4">Data Entry</td>
                  <td className="px-6 py-4 text-red-300 font-medium">20 min/entry</td>
                  <td className="px-6 py-4 text-[#FFC107] font-bold">1 min/entry</td>
                </tr>
                <tr className="hover:bg-[#FFC107]/5">
                  <td className="px-6 py-4">Report Generation</td>
                  <td className="px-6 py-4 text-red-300 font-medium">2 hours/report</td>
                  <td className="px-6 py-4 text-[#FFC107] font-bold">5 min/report</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuccessMetrics;
