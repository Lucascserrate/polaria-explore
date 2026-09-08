export const businessTypes: Record<string, string> = {
	HAIR_SALON: 'Peluquería',
	BARBERSHOP: 'Barbería',
	NAIL_SALON: 'Salón de uñas',
	BROWS_LASHES: 'Cejas y pestañas',
	SALON: 'Salón de belleza',
	AESTHETIC_MEDICINE: 'Medicina estética',
	MASSAGE: 'Masajes',
	SPA: 'Spa y sauna',
	WAXING: 'Depilación',
	TATTOO_PIERCING: 'Tatuajes y piercings',
	TANNING: 'Bronceado',
	FITNESS: 'Fitness y recuperación',
	PHYSIOTHERAPY: 'Fisioterapia',
	HEALTH_CLINIC: 'Consultorio médico',
	DENTAL_CLINIC: 'Clínica dental',
	PET_GROOMING: 'Peluquería de mascotas',
	OTHER: 'Otro',
};

export const businessTypeLabel = (value?: string | null): string | null =>
	value ? (businessTypes[value] ?? null) : null;
