'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { booking } from '@/content/booking';
import { cn } from '@/lib/utils';

export function BackButton({
	variant,
	className,
}: {
	variant: 'overlay' | 'inline';
	className?: string;
}) {
	const router = useRouter();

	const goBack = () => {
		if (window.history.length > 1) {
			router.back();
			return;
		}

		router.push('/');
	};

	return (
		<button
			type="button"
			onClick={goBack}
			aria-label={booking.header.back}
			className={cn(
				'grid size-10 cursor-pointer place-items-center rounded-full transition-colors sm:hidden',
				variant === 'overlay'
					? 'bg-ink-950/55 text-paper-50 backdrop-blur-sm hover:bg-ink-950/70'
					: 'border border-paper-300 text-ink-900 hover:bg-paper-200',
				className,
			)}
		>
			<ArrowLeft aria-hidden className="size-5" strokeWidth={1.75} />
		</button>
	);
}

export default BackButton;
