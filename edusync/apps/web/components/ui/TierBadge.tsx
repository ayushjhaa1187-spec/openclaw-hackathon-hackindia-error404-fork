import React from 'react';
import { Shield, ShieldCheck, Star, Crown } from 'lucide-react';
import { KarmaTier } from '@edusync/shared';

interface TierBadgeProps {
  tier: KarmaTier;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const TierBadge: React.FC<TierBadgeProps> = ({ tier, size = 'md', showLabel = true }) => {
  const configs = {
    bronze: {
      color: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
      icon: Shield,
      label: 'Bronze'
    },
    silver: {
      color: 'text-slate-300 bg-slate-300/10 border-slate-300/20',
      icon: ShieldCheck,
      label: 'Silver'
    },
    gold: {
      color: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
      icon: Star,
      label: 'Gold'
    },
    platinum: {
      color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20 shadow-[0_0_15px_rgba(129,140,248,0.2)]',
      icon: Crown,
      label: 'Platinum'
    }
  };

  const config = configs[tier] || configs.bronze;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[8px] gap-1',
    md: 'px-3 py-1 text-[10px] gap-1.5',
    lg: 'px-4 py-2 text-xs gap-2'
  };

  const iconSizes = {
    sm: 10,
    md: 12,
    lg: 16
  };

  return (
    <div className={`inline-flex items-center font-black uppercase tracking-widest rounded-full border ${config.color} ${sizeClasses[size]}`}>
      <Icon size={iconSizes[size]} strokeWidth={3} />
      {showLabel && <span className="italic">{config.label}</span>}
    </div>
  );
};
