import { cn } from '@/lib/utils'

interface DividerProps {
  className?: string
}

export default function Divider({ className }: DividerProps) {
  return <hr className={cn('border-0 border-t border-border', className)} />
}
