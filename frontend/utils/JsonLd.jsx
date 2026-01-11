import { Script } from 'destamatic-ui';

export const SITE_NAME = 'OpenGig';
export const BASE_URL = 'https://opengig.org';
export const AUTHOR_NAME = 'Torrin Leonard';

export const AUTHOR_ID = `${BASE_URL}/#person`;
export const ORG_ID = `${BASE_URL}/#organization`;
export const WEBSITE_ID = `${BASE_URL}/#website`;
export const WEBPAGE_ID = `${BASE_URL}/#webpage`;

export const LOGO_URL = `${BASE_URL}/branding/OpenGig_Logo_Light_Mode.svg`; // update if you have a dedicated logo file
export const IMAGE_URL = `${BASE_URL}/branding/OpenGig_Logo_Light_Mode.svg`; // strongly recommend you add this for sharing/SEO
export const GITHUB_URL = 'https://github.com/torrinworx/OpenGig.org';

const baseJsonLd = {
	'@context': 'https://schema.org',
	'@graph': [
		{
			'@type': 'Organization',
			'@id': ORG_ID,
			name: SITE_NAME,
			legalName: 'OpenGig',
			url: BASE_URL,
			logo: {
				'@type': 'ImageObject',
				url: LOGO_URL,
			},
			image: {
				'@type': 'ImageObject',
				url: IMAGE_URL,
			},
			description:
				'A transparent gig platform. Anyone can hire or work. Pricing and fees are transparent.',
			slogan: 'A transparent gig platform. Anyone can hire or work. Pricing and fees are transparent.',
			foundingDate: '2024',
			foundingLocation: {
				'@type': 'Place',
				name: 'Waterloo, Ontario, Canada',
			},
			address: {
				'@type': 'PostalAddress',
				addressLocality: 'Waterloo',
				addressRegion: 'ON',
				addressCountry: 'CA',
			},
			areaServed: [
				{
					'@type': 'AdministrativeArea',
					name: 'Canada',
				},
				{
					'@type': 'AdministrativeArea',
					name: 'Ontario',
				},
				{
					'@type': 'City',
					name: 'Waterloo',
				},
				{
					'@type': 'City',
					name: 'Kitchener',
				},
				{
					'@type': 'City',
					name: 'Cambridge',
				},
			],
			knowsAbout: [
				'Gig work',
				'Local services marketplace',
				'Freelance services',
				'Cooperatives',
				'Open source software',
				'Transparent fees',
			],
			sameAs: [
				BASE_URL,
				GITHUB_URL,
			],
			mainEntityOfPage: {
				'@id': WEBPAGE_ID,
			},
		},

		{
			'@type': 'Person',
			'@id': AUTHOR_ID,
			name: AUTHOR_NAME,
			givenName: 'Torrin',
			familyName: 'Leonard',
			url: BASE_URL,
			image: 'https://torrin.me/headshot.webp',
			jobTitle: ['Founder', 'Maintainer'],
			worksFor: {
				'@id': ORG_ID,
			},
			address: {
				'@type': 'PostalAddress',
				addressLocality: 'Waterloo',
				addressRegion: 'ON',
				addressCountry: 'CA',
			},
			email: 'mailto:torrin@torrin.me',
			sameAs: [
				'https://www.linkedin.com/in/torrin-leonard-8343a1154/',
				'https://github.com/torrinworx',
			],
			mainEntityOfPage: {
				'@id': WEBPAGE_ID,
			},
		},

		{
			'@type': 'WebSite',
			'@id': WEBSITE_ID,
			url: BASE_URL,
			name: SITE_NAME,
			description:
				'A transparent gig platform. Anyone can hire or work. Pricing and fees are transparent.',
			inLanguage: 'en-CA',
			publisher: {
				'@id': ORG_ID,
			},
			creator: {
				'@id': ORG_ID,
			},
			// If you have a site search, wire this up; otherwise remove it.
			// potentialAction: {
			// 	'@type': 'SearchAction',
			// 	target: `${BASE_URL}/search?q={search_term_string}`,
			// 	'query-input': 'required name=search_term_string',
			// },
		},

		// WebPage (homepage)
		{
			'@type': 'WebPage',
			'@id': WEBPAGE_ID,
			url: BASE_URL,
			name: 'OpenGig — Transparent gig platform.',
			isPartOf: {
				'@id': WEBSITE_ID,
			},
			about: {
				'@id': ORG_ID,
			},
			inLanguage: 'en-CA',
			primaryImageOfPage: {
				'@type': 'ImageObject',
				url: IMAGE_URL,
			},
		},

		// Software app listing (helps Google understand “this is a web platform/app”)
		{
			'@type': 'SoftwareApplication',
			name: SITE_NAME,
			applicationCategory: 'BusinessApplication',
			operatingSystem: 'Web',
			url: BASE_URL,
			description:
				'A transparent gig platform. Anyone can hire or work. Pricing and fees are transparent.',
			offers: {
				'@type': 'Offer',
				price: '0',
				priceCurrency: 'CAD',
				description: 'Free to join.',
				url: `${BASE_URL}/`,
			},
			publisher: {
				'@id': ORG_ID,
			},
		},
	],
};

const JsonLd = ({ extraNodes = [] }) => {
	const full = {
		...baseJsonLd,
		'@graph': [
			...baseJsonLd['@graph'],
			...(Array.isArray(extraNodes) ? extraNodes : [extraNodes]),
		],
	};

	return <Script type="application/ld+json" group="jsonld">
		{JSON.stringify(full)}
	</Script>;
};

export default JsonLd;
