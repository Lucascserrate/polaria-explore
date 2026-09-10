import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { home } from '@/content/home';
import { typeOptions } from '@/features/explore/type-options';
import { SearchEntry } from '@/features/home/components/SearchEntry';
import { TypeShortcuts } from '@/features/home/components/TypeShortcuts';
import { toSearchBusiness } from '@/features/home/search-options';
import { listBusinesses } from '@/services/explore/server/businesses';

export const metadata: Metadata = {
	title: home.metaTitle,
	description: home.metaDescription,
	alternates: { canonical: '/' },
};

export default async function HomePage() {
	const businesses = await listBusinesses();
	const types = typeOptions(businesses);

	return (
		/*
		 * El titular va arriba y no centrado a lo alto, y la razón es el panel:
		 * cuelga del campo y mide hasta 26rem, así que un campo en el medio de una
		 * pantalla baja lo deja cortado contra el borde. Cortado además sin
		 * remedio, porque el panel está posicionado y no empuja la página: no hay
		 * nada que desplazar para llegar a las últimas filas. Anclado arriba,
		 * abajo siempre queda el alto que el panel necesita —y el lugar donde van
		 * a ir las tarjetas de negocios el día que la raíz tenga algo más que la
		 * puerta—.
		 */
		<main className="flex flex-1 flex-col bg-paper-50">
			<Container width="narrow" className="py-14 text-center sm:py-20 lg:py-28">
				<h1 className="text-4xl font-semibold text-ink-950 sm:text-5xl lg:text-6xl">
					{home.title}
				</h1>

				<p className="mx-auto mt-4 max-w-xl text-ink-600 sm:text-lg">
					{home.subtitle}
				</p>

				<div className="mt-8 sm:mt-10">
					<SearchEntry
						types={types}
						businesses={businesses.map(toSearchBusiness)}
					/>
				</div>

				<TypeShortcuts options={types} className="mt-6" />
			</Container>
		</main>
	);
}
