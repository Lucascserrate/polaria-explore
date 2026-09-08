import {
	Bath,
	Dog,
	Dumbbell,
	Eye,
	Feather,
	Hand,
	PenTool,
	PersonStanding,
	Scissors,
	Smile,
	Sparkles,
	SprayCan,
	Stethoscope,
	Store,
	Sun,
	Syringe,
	Waves,
	type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
	BARBERSHOP: Scissors,
	HAIR_SALON: SprayCan,
	NAIL_SALON: Hand,
	BROWS_LASHES: Eye,
	SALON: Sparkles,
	AESTHETIC_MEDICINE: Syringe,
	MASSAGE: Waves,
	SPA: Bath,
	WAXING: Feather,
	TATTOO_PIERCING: PenTool,
	TANNING: Sun,
	FITNESS: Dumbbell,
	PHYSIOTHERAPY: PersonStanding,
	HEALTH_CLINIC: Stethoscope,
	DENTAL_CLINIC: Smile,
	PET_GROOMING: Dog,
	OTHER: Store,
};

export function BusinessTypeIcon({
	type,
	className,
}: {
	type: string;
	className?: string;
}) {
	const Icon = ICONS[type] ?? Store;

	return <Icon aria-hidden className={className} strokeWidth={1.75} />;
}

export default BusinessTypeIcon;
