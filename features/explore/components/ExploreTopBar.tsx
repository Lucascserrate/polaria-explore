'use client';

import Link from 'next/link';
import { ArrowLeft, List, Map as MapIcon } from 'lucide-react';
import { explore } from '@/content/explore';

export function ExploreTopBar({
	count,
	mapOpen,
	onToggleMap,
}: {
	count: number;
	mapOpen: boolean;
	onToggleMap?: () => void;
}) {
	return (
		<div className="flex items-center gap-1 rounded-2xl bg-paper-50 p-2 shadow-lg ring-1 ring-paper-300">
			<Link
				href="/"
				aria-label={explore.back}
				className="grid size-10 shrink-0 place-items-center rounded-full text-ink-900 transition-colors hover:bg-paper-200"
			>
				<ArrowLeft aria-hidden className="size-5" strokeWidth={1.75} />
			</Link>

			<p className="min-w-0 flex-1 truncate px-1 text-sm font-medium text-ink-950">
				{explore.count(count)}
			</p>

			{onToggleMap && (
				<button
					type="button"
					onClick={onToggleMap}
					aria-label={mapOpen ? explore.map.backToList : explore.map.show}
					className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full border border-paper-300 text-ink-900 transition-colors hover:bg-paper-200"
				>
					{mapOpen ? (
						<List aria-hidden className="size-5" strokeWidth={1.75} />
					) : (
						<MapIcon aria-hidden className="size-5" strokeWidth={1.75} />
					)}
				</button>
			)}
		</div>
	);
}

export default ExploreTopBar;
