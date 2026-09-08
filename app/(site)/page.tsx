import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { home } from '@/content/home';

/** Provisional: el lugar del buscador del marketplace. Ver `content/home.ts`. */
export const metadata: Metadata = {
	alternates: { canonical: '/' },
};

export default function HomePage() {
	return (
		<main className="flex min-h-full items-center bg-paper-50">
			<Container width="narrow" className="py-24">
				<h1 className="text-3xl font-semibold tracking-[-0.03em] text-ink-950">
					{home.title}
				</h1>
				<p className="mt-3 text-ink-600">{home.body}</p>
				<a
					href={home.landing.href}
					className="mt-6 inline-block text-sm font-medium text-ink-700 underline underline-offset-4"
				>
					{home.landing.label}
				</a>
			</Container>
		</main>
	);
}
