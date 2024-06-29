import React from 'react';

interface SortIconProps<T> {
  column: keyof T;
  currentSort: keyof T;
  currentOrder: 'asc' | 'desc';
}

function SortIcon<T>({ column, currentSort, currentOrder }: SortIconProps<T>) {
  if (column !== currentSort) {
    return (
      <svg className="inline-block ml-1 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    );
  }

  return currentOrder === 'asc' ? (
    <svg className="inline-block ml-1 h-4 w-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
    </svg>
  ) : (
    <svg className="inline-block ml-1 h-4 w-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}

export default SortIcon;