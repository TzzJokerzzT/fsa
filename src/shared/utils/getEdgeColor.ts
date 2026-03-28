export function getEdgeColor(type: string): string {
  switch (type) {
    case 'props':
      return '#3b82f6';
    case 'state':
      return '#22c55e';
    case 'event':
      return '#f59e0b';
    case 'import':
      return '#8b5cf6';
    case 'context':
      return '#06b6d4';
    default:
      return '#64748b';
  }
}
