import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DiligenceTableSkeletonProps {
  rowCount?: number;
}

const DiligenceTableSkeleton: React.FC<DiligenceTableSkeletonProps> = ({ rowCount = 8 }) => {
  return (
    <div className="rounded-lg border overflow-hidden bg-card">
      {/* Toolbar skeleton */}
      <div className="flex items-center justify-end px-3 py-2 border-b bg-muted/30">
        <Skeleton className="h-8 w-32" />
      </div>
      
      <Table className="w-full">
        <TableHeader className="bg-gray-50 border-b-2 border-gray-200">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12 px-3 py-3.5">
              <Skeleton className="h-4 w-4" />
            </TableHead>
            <TableHead className="min-w-[280px] px-4 py-3.5">
              <Skeleton className="h-4 w-16" />
            </TableHead>
            <TableHead className="w-16 px-3 py-3.5">
              <Skeleton className="h-4 w-8" />
            </TableHead>
            <TableHead className="w-32 px-4 py-3.5">
              <Skeleton className="h-4 w-16" />
            </TableHead>
            <TableHead className="w-40 px-4 py-3.5">
              <Skeleton className="h-4 w-20" />
            </TableHead>
            <TableHead className="w-36 px-4 py-3.5">
              <Skeleton className="h-4 w-20" />
            </TableHead>
            <TableHead className="w-16 px-3 py-3.5">
              <Skeleton className="h-4 w-4 mx-auto" />
            </TableHead>
            <TableHead className="w-16 px-3 py-3.5">
              <Skeleton className="h-4 w-4 mx-auto" />
            </TableHead>
            <TableHead className="w-16 px-3 py-3.5">
              <Skeleton className="h-4 w-4 mx-auto" />
            </TableHead>
            <TableHead className="w-28 px-4 py-3.5">
              <Skeleton className="h-4 w-12" />
            </TableHead>
            <TableHead className="w-28 px-4 py-3.5">
              <Skeleton className="h-4 w-12" />
            </TableHead>
            <TableHead className="w-28 px-4 py-3.5">
              <Skeleton className="h-4 w-16" />
            </TableHead>
            <TableHead className="w-12 px-3 py-3.5" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Category header skeleton */}
          <TableRow className="bg-slate-100/80 hover:bg-slate-100/80">
            <TableCell colSpan={13} className="py-3 px-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-1.5 w-16 rounded-full" />
                  <Skeleton className="h-3 w-8" />
                </div>
              </div>
            </TableCell>
          </TableRow>
          
          {/* Row skeletons */}
          {Array.from({ length: rowCount }).map((_, i) => (
            <TableRow key={i} className="bg-white border-b border-gray-100">
              <TableCell className="w-12 px-3 py-3">
                <Skeleton className="h-4 w-4" />
              </TableCell>
              <TableCell className="min-w-[280px] px-4 py-3">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-full max-w-[200px]" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </TableCell>
              <TableCell className="w-16 px-3 py-3">
                <Skeleton className="h-4 w-4 mx-auto" />
              </TableCell>
              <TableCell className="w-32 px-4 py-3">
                <Skeleton className="h-6 w-20 rounded-full" />
              </TableCell>
              <TableCell className="w-40 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </TableCell>
              <TableCell className="w-36 px-4 py-3">
                <div className="flex -space-x-1">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-5 w-5 rounded-full" />
                </div>
              </TableCell>
              <TableCell className="w-16 px-3 py-3 text-center">
                <Skeleton className="h-3 w-4 mx-auto" />
              </TableCell>
              <TableCell className="w-16 px-3 py-3 text-center">
                <Skeleton className="h-3 w-4 mx-auto" />
              </TableCell>
              <TableCell className="w-16 px-3 py-3 text-center">
                <Skeleton className="h-3 w-4 mx-auto" />
              </TableCell>
              <TableCell className="w-28 px-4 py-3">
                <Skeleton className="h-3 w-12" />
              </TableCell>
              <TableCell className="w-28 px-4 py-3">
                <Skeleton className="h-3 w-12" />
              </TableCell>
              <TableCell className="w-28 px-4 py-3">
                <Skeleton className="h-3 w-16" />
              </TableCell>
              <TableCell className="w-12 px-3 py-3" />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DiligenceTableSkeleton;
