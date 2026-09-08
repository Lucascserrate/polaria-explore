import { ImageResponse } from 'next/og';
import { booking } from '@/content/booking';
import { businessTypeLabel } from '@/content/business-types';
import { initials } from '@/lib/initials';
import { getBusinessProfile } from '@/services/booking/server/business';
import coverUrl from './utils/coverUrl';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = booking.share.imageAlt;

export default async function Image({
	params,
}: {
	params: Promise<{ businessSlug: string }>;
}) {
	const { businessSlug } = await params;
	const profile = await getBusinessProfile(businessSlug);

	if (!profile) return new ImageResponse(<div style={CARD} />, size);

	const cover = profile.photos[0];
	const mark = initials(profile.name);
	const subtitle = profile.address ?? businessTypeLabel(profile.businessType);

	return new ImageResponse(
		<div style={{ ...CARD, position: 'relative' }}>
			{cover && (
				// eslint-disable-next-line @next/next/no-img-element
				<img
					src={coverUrl(cover.url, size)}
					alt=""
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						width: '100%',
						height: '100%',
						objectFit: 'cover',
					}}
				/>
			)}

			<div
				style={{
					position: 'absolute',
					bottom: 0,
					left: 0,
					right: 0,
					height: '75%',
					display: 'flex',
					background:
						'linear-gradient(to top, rgba(10,10,10,0.94), rgba(10,10,10,0.6) 45%, rgba(10,10,10,0))',
				}}
			/>

			<div
				style={{
					position: 'relative',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'flex-end',
					width: '100%',
					padding: 72,
				}}
			>
				{!cover && mark && (
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							width: 116,
							height: 116,
							marginBottom: 36,
							borderRadius: 9999,
							backgroundColor: '#17171a',
							color: '#9b9ba4',
							fontSize: 46,
							fontWeight: 600,
						}}
					>
						{mark}
					</div>
				)}

				<span
					style={{
						color: '#ffffff',
						fontSize: profile.name.length > 26 ? 54 : 70,
						fontWeight: 700,
						lineHeight: 1.05,
						letterSpacing: -2,
						maxWidth: 940,
					}}
				>
					{profile.name}
				</span>

				{subtitle && (
					<span
						style={{
							color: 'rgba(255,255,255,0.72)',
							fontSize: 30,
							marginTop: 20,
							maxWidth: 940,
						}}
					>
						{subtitle}
					</span>
				)}
			</div>
		</div>,
		size,
	);
}

const CARD = {
	width: '100%',
	height: '100%',
	display: 'flex',
	backgroundColor: '#0a0a0a',
	fontFamily: 'sans-serif',
} as const;
