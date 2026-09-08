import {
	MdAccessibilityNew,
	MdAutoAwesome,
	MdBackHand,
	MdBrush,
	MdContentCut,
	MdDry,
	MdEmojiEmotions,
	MdFitnessCenter,
	MdHotTub,
	MdMedicalServices,
	MdPets,
	MdRemoveRedEye,
	MdSelfImprovement,
	MdStorefront,
	MdVaccines,
	MdWaterDrop,
	MdWbSunny,
} from 'react-icons/md';
import type { IconType } from 'react-icons';

/**
 * Un icono por rubro, para los filtros y para los marcadores del mapa.
 *
 * Vive acá y no en `content/` porque no es copy: la etiqueta —lo único que se
 * lee— está en `content/business-types.ts`, y el icono es el dibujo que la
 * acompaña. Los dos se buscan por el mismo código, así que agregar un rubro es
 * agregar una línea en cada archivo.
 *
 * **Rellenos y no de contorno**, que es lo contrario del resto de la interfaz.
 * No es una inconsistencia sino la misma regla aplicada al tamaño: un trazo de
 * 1,75px dentro de un marcador de 14px se convierte en una mancha gris con
 * agujeros. Material Symbols están dibujados macizos y a ese tamaño se leen; la
 * chapa de Polaria —los iconos de la interfaz, `lucide-react`— sigue siendo de
 * contorno, porque ahí se usan a 16 y 20px y el contorno pesa menos.
 *
 * **El icono nunca reemplaza a la etiqueta.** Ninguno de estos dibujos dice
 * "depilación" por sí solo; sirven para encontrar rápido el que ya se está
 * leyendo, y por eso van con `aria-hidden`. En el mapa, donde no hay etiqueta
 * al lado, el nombre del negocio lo dice el `aria-label` del marcador.
 *
 * Las repeticiones se evitaron donde se podía y no donde no: barbería se queda
 * con la tijera —que es lo que la gente dibuja cuando dibuja una barbería— y
 * peluquería con el secador. El rubro que no reconocemos usa el local
 * genérico, el mismo dibujo que marca al negocio en el mapa de la reserva.
 */
const ICONS: Record<string, IconType> = {
	BARBERSHOP: MdContentCut,
	HAIR_SALON: MdDry,
	NAIL_SALON: MdBackHand,
	BROWS_LASHES: MdRemoveRedEye,
	SALON: MdAutoAwesome,
	AESTHETIC_MEDICINE: MdVaccines,
	MASSAGE: MdSelfImprovement,
	SPA: MdHotTub,
	WAXING: MdWaterDrop,
	TATTOO_PIERCING: MdBrush,
	TANNING: MdWbSunny,
	FITNESS: MdFitnessCenter,
	PHYSIOTHERAPY: MdAccessibilityNew,
	HEALTH_CLINIC: MdMedicalServices,
	DENTAL_CLINIC: MdEmojiEmotions,
	PET_GROOMING: MdPets,
	OTHER: MdStorefront,
};

export function BusinessTypeIcon({
	type,
	className,
}: {
	type: string;
	className?: string;
}) {
	const Icon = ICONS[type] ?? MdStorefront;

	return <Icon aria-hidden className={className} />;
}

export default BusinessTypeIcon;
