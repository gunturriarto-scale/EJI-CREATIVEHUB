
import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { usageService } from '../services/usageService';

export const UsageLimit: React.FC = () => {
  const [usage, setUsage] = useState(usageService.getUsage());
  const max = usageService.getMaxLimit();

  useEffect(() => {
    const handleUpdate = () => {
      setUsage(usageService.getUsage());
    };

    window.addEventListener('usage-updated', handleUpdate);
    return () => window.removeEventListener('usage-updated', handleUpdate);
  }, []);

  const percentage = Math.min((usage / max) * 100, 100);
  const isNearLimit = usage >= max * 0.8;
  const isAtLimit = usage >= max;

  return (
    <div className="p-6 mt-auto border-t border-white/5 bg-white/2">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <Zap className={`w-3 h-3 ${isAtLimit ? 'text-red-500' : isNearLimit ? 'text-amber-500' : 'text-brand-primary'}`} />
          <span>Limit Generate</span>
        </div>
        <span className={`text-xs font-bold ${isAtLimit ? 'text-red-500' : 'text-slate-300'}`}>
          {usage} / {max}
        </span>
      </div>
      
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 rounded-full ${
            isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-brand-primary'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <p className="mt-3 text-[10px] text-slate-500 leading-relaxed">
        {isAtLimit 
          ? 'Limit harian tercapai. Silakan coba lagi besok atau upgrade akun.' 
          : 'Gunakan kuota Anda dengan bijak untuk hasil terbaik.'}
      </p>
    </div>
  );
};
