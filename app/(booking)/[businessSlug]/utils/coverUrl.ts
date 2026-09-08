const CLOUDINARY_UPLOAD = '/image/upload/';

/**
 * El recorte que pide la vista previa, hecho por Cloudinary.
 *
 * La portada la sube el dueño desde el teléfono y puede pesar varios megas con
 * cualquier proporción; acá hace falta un JPEG de 1200×630. Pedírselo recortado
 * a Cloudinary evita bajar la foto entera en cada render y evita que el nombre
 * caiga sobre una cara: `g_auto` elige la parte que importa.
 *
 * La transformación se encadena con lo que ya traiga la URL, y si la foto no
 * está en Cloudinary se usa tal cual.
 */
const coverUrl = (
	url: string,
	size: { width: number; height: number },
): string => {
	const at = url.indexOf(CLOUDINARY_UPLOAD);
	if (at === -1) return url;

	const cut = at + CLOUDINARY_UPLOAD.length;
	const crop = `c_fill,g_auto,w_${size.width},h_${size.height},f_jpg,q_auto`;

	return `${url.slice(0, cut)}${crop}/${url.slice(cut)}`;
};

export default coverUrl;
