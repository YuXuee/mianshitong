import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

function Progress({
  className,
  value,
  ...props
}: React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-secondary', className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 transition-all duration-500"
        style={{
          transform: `translateX(-${100 - (value || 0)}%)`,
          background: 'linear-gradient(90deg, hsl(224, 76%, 48%), hsl(217, 91%, 60%))',
        }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
