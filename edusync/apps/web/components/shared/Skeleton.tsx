'use client';

import { Info } from "lucide-react";
import toast from "react-hot-toast";

export function Skeleton({
  className = '',
  width = 'w-full',
  height = 'h-4',
}: {
  className?: string;
  width?: string;
  height?: string;
}) {
  return (
    <div
      className={`${width} ${height} bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded animate-pulse ${className}`}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-slate-900/40 border border-white/5 p-6 rounded-[32px] space-y-4">
      <Skeleton height="h-6" width="w-3/4" />
      <Skeleton height="h-4" width="w-full" />
      <Skeleton height="h-4" width="w-5/6" />
      <div className="flex gap-2 pt-4">
        <Skeleton height="h-10" width="w-24" className="rounded-xl" />
        <Skeleton height="h-10" width="w-24" className="rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="space-y-4">
      <div className="flex gap-4 border-b border-white/5 pb-4">
        <Skeleton width="w-12" height="h-4" />
        <Skeleton width="w-48" height="h-4" />
        <Skeleton width="w-32" height="h-4" />
        <Skeleton width="w-24" height="h-4" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 py-2">
          <Skeleton width="w-10" height="h-8" className="rounded-lg" />
          <Skeleton width="w-40" height="h-8" className="rounded-lg" />
          <Skeleton width="w-24" height="h-8" className="rounded-lg" />
          <Skeleton width="w-20" height="h-8" className="rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export const showNexusInfo = (message: string) => {
    toast(message, {
        icon: 'ℹ️',
        style: {
            borderRadius: '16px',
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)'
        },
    });
};
