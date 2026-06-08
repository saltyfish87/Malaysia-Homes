/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project, Article, FAQItem, CurrencyConfig } from '../types';

export const STATE_AREAS: Record<string, string[]> = {
  'Kuala Lumpur': ['KLCC', 'Bukit Jalil', 'TRX', 'Mont Kiara', 'Bangsar', 'Bukit Bintang'],
  'Selangor': ['Petaling Jaya', 'Subang Jaya', 'Puchong', 'Shah Alam', 'Damansara', 'Sunway'],
  'Johor': ['Iskandar Puteri', 'Johor Bahru', 'Tebrau', 'Puteri Harbour', 'Mount Austin'],
  'Penang': ['Gurney Drive', 'Bayan Lepas', 'Tanjung Tokong', 'Batu Ferringhi', 'Georgetown']
};

export const DEVELOPERS = [
  'EcoWorld Development',
  'Sime Darby Property',
  'SP Setia Group',
  'UEM Sunrise',
  'IOI Properties',
  'Gamuda Land',
  'Sunway Property',
  'Mah Sing Group',
  'Pavilion Group',
  'Eastern & Oriental',
  'Exsim Group',
  'Lendlease',
  'Oxley Holdings',
  'Symphony Life'
];

export const CURRENCIES: CurrencyConfig[] = [
  { code: 'MYR', symbol: 'RM', rate: 1.0 },
  { code: 'SGD', symbol: 'S$', rate: 0.31 },
  { code: 'USD', symbol: '$', rate: 0.23 },
  { code: 'CNY', symbol: '¥', rate: 1.66 }
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'pavilion-square',
    name: 'Pavilion Square',
    developer: 'Pavilion Group',
    state: 'Kuala Lumpur',
    area: 'Bukit Bintang',
    priceMin: 1450000,
    priceMax: 3500000,
    completionYear: 2027,
    propertyType: 'Condo',
    tenure: 'Leasehold',
    furnishing: 'Fully Furnished',
    bedrooms: 2,
    bathrooms: 2,
    carPark: 2,
    totalUnits: 480,
    totalFloors: 50,
    builtUpMin: 850,
    builtUpMax: 1500,
    maintenanceFee: 0.90,
    airbnbFriendly: true,
    investmentScore: 9.6,
    ownStayScore: 9.1,
    rentalYield: 7.2,
    featured: true,
    image: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'
    ],
    vrTourLink: 'https://images.unsplash.com/photo-1460317442991-0ec209397118',
    droneViewLink: 'https://images.unsplash.com/photo-1460317442991-0ec209397118',
    keyHighlights: [
      'Adjacent next-door to Pavilion Kuala Lumpur Retail Mall & Starhill Gallery',
      'Signature rooftop sky club featuring an infinity pool and premium yoga dome',
      'Exceedingly high Airbnb rental yields driven by premier central district hub locale',
      'Bespoke pedestrian link bridge accessing MRT Bukit Bintang Interchange'
    ],
    nearbyAmenities: [
      'Pavilion Kuala Lumpur (1 min walk)',
      'MRT Bukit Bintang Station (2 mins walk)',
      'Jalan Alor Famous Food Street (5 mins walk)',
      'KLCC Park & Petronas Twin Towers (10 mins via covered walkway)'
    ],
    description: 'Pavilion Square Residences delivers uncompromising ultra-luxury living to the glittering heart of Bukit Bintang. Rising majestically above Kuala Lumpur’s primary shopping and lifestyle nexus, it boasts top-tier developer finishes, private concierge hospitality, and stellar city panorama views.',
    lat: 3.1478,
    lng: 101.7132
  },
  {
    id: 'orion-residence',
    name: 'Orion Residence',
    developer: 'Symphony Life',
    state: 'Kuala Lumpur',
    area: 'Bukit Bintang',
    priceMin: 1450000,
    priceMax: 3600000,
    completionYear: 2026,
    propertyType: 'Serviced Apartment',
    tenure: 'Freehold',
    furnishing: 'Fully Furnished',
    bedrooms: 2,
    bathrooms: 2,
    carPark: 2,
    totalUnits: 298,
    totalFloors: 51,
    builtUpMin: 720,
    builtUpMax: 1300,
    maintenanceFee: 0.75,
    airbnbFriendly: true,
    investmentScore: 9.3,
    ownStayScore: 8.8,
    rentalYield: 6.8,
    featured: true,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
    ],
    vrTourLink: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00',
    droneViewLink: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00',
    keyHighlights: [
      'Branded ultra-luxury residence with exclusive private on-demand limousine service',
      'Strategic prime location next to Pavilion Mall and Starhill Gallery in Bukit Bintang',
      'Automated robotic butler delivery and integrated high-tech smart home systems',
      'Double-deck astronomical stargazing sky lounge on levels 50 & 51'
    ],
    nearbyAmenities: [
      'Pavilion Kuala Lumpur Mall (1 min walk)',
      'Starhill Gallery and Fahrenheit 88 (2 mins walk)',
      'MRT Bukit Bintang Station (3 mins walk)',
      'The Exchange TRX Mall (4 mins drive)'
    ],
    description: 'Orion Residence is a glamorous freehold branded service residence shining at the absolute core of Bukit Bintang. Located right next to Pavilion Kuala Lumpur and Starhill Gallery, Orion combines modern high-tech luxury, integrated robotic butler systems, and an exclusive private limousine service.',
    lat: 3.1466,
    lng: 101.7118
  },
  {
    id: 'the-conlay',
    name: 'The Conlay',
    developer: 'Eastern & Oriental & Mitsui Fudosan',
    state: 'Kuala Lumpur',
    area: 'KLCC',
    priceMin: 1500000,
    priceMax: 4200000,
    completionYear: 2024,
    propertyType: 'Serviced Apartment',
    tenure: 'Freehold',
    furnishing: 'Fully Furnished',
    bedrooms: 2,
    bathrooms: 2,
    carPark: 1,
    totalUnits: 491,
    totalFloors: 52,
    builtUpMin: 740,
    builtUpMax: 1450,
    maintenanceFee: 0.88,
    airbnbFriendly: true,
    investmentScore: 9.4,
    ownStayScore: 9.3,
    rentalYield: 6.5,
    featured: true,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
    ],
    vrTourLink: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab',
    droneViewLink: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab',
    keyHighlights: [
      'Architectural masterpiece designed by legendary Kerry Hill Architects',
      'Exclusive private lift lobbies and bespoke dual-temperature Japanese hot-spring baths',
      'E&O Signature Concierge, fine dining, and sommelier services available on premises',
      'Located directly adjacent to MRT Conlay underground transit station'
    ],
    nearbyAmenities: [
      'MRT Conlay Station (1 min walk)',
      'Prince Court Medical Centre (4 mins walk)',
      'Royal Selangor Golf Club (3 mins drive)',
      'The Exchange TRX Mall (4 mins MRT ride)'
    ],
    description: 'The Conlay is an imposing architectural tribute to classic Japanese minimalism, located in the prestigious embassy district of Jalan Conlay. Perfect for connoisseurs of lifestyle art, this freehold masterpiece combines natural oak materials, premium stone finishes, and unparalleled service care.',
    lat: 3.1492,
    lng: 101.7153
  },
  {
    id: 'branniganz',
    name: 'Branniganz',
    developer: 'Exsim Group',
    state: 'Kuala Lumpur',
    area: 'Bukit Bintang',
    priceMin: 720000,
    priceMax: 1350000,
    completionYear: 2025,
    propertyType: 'Serviced Apartment',
    tenure: 'Leasehold',
    furnishing: 'Fully Furnished',
    bedrooms: 2,
    bathrooms: 2,
    carPark: 1,
    totalUnits: 720,
    totalFloors: 48,
    builtUpMin: 550,
    builtUpMax: 900,
    maintenanceFee: 0.65,
    airbnbFriendly: true,
    investmentScore: 9.5,
    ownStayScore: 8.0,
    rentalYield: 7.8,
    featured: false,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'
    ],
    vrTourLink: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
    droneViewLink: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
    keyHighlights: [
      'Smart dual-key floor layouts optimized premiumly for holiday Airbnb hosting',
      'Rooftop astronomical sky bar and dining lounge with 365 panoramic lookouts',
      '3-minute walking distance from premium nightlife, food streets, and MRT stations',
      'Extremely high localized occupancy ratios'
    ],
    nearbyAmenities: [
      'Jalan Alor Famous Food Street (2 mins walk)',
      'Pavilion Kuala Lumpur Mall (4 mins walk)',
      'MRT Bukit Bintang Station (3 mins walk)',
      'Sungai Wang Plaza (1 min walk)'
    ],
    description: 'Branniganz Suite Bukit Bintang is custom-crafted to dominate the short-let tourist market. Utilizing highly flexible layout blueprints, dual key options, and award-winning urban interior designs, it offers passive investors high rental yields.',
    lat: 3.1442,
    lng: 101.7105
  },
  {
    id: 'core-residence',
    name: 'Core Residence',
    developer: 'CORE Precious Development',
    state: 'Kuala Lumpur',
    area: 'TRX',
    priceMin: 1180000,
    priceMax: 2150000,
    completionYear: 2025,
    propertyType: 'Condo',
    tenure: 'Freehold',
    furnishing: 'Fully Furnished',
    bedrooms: 2,
    bathrooms: 2,
    carPark: 2,
    totalUnits: 580,
    totalFloors: 44,
    builtUpMin: 620,
    builtUpMax: 1020,
    maintenanceFee: 0.80,
    airbnbFriendly: true,
    investmentScore: 9.4,
    ownStayScore: 8.5,
    rentalYield: 6.9,
    featured: false,
    image: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
    ],
    vrTourLink: 'https://images.unsplash.com/photo-1460317442991-0ec209397118',
    droneViewLink: 'https://images.unsplash.com/photo-1460317442991-0ec209397118',
    keyHighlights: [
      'The first premier freehold luxury residence inside the prestigious TRX Financial Hub',
      'Direct sky garden bridges linked to the 10-acre TRX Elevated Central Park',
      'Eco-certified structure with smart cooling ventilation systems',
      'Underground pedestrian connections directly accessing TRX MRT station'
    ],
    nearbyAmenities: [
      'The Exchange TRX Shopping Mall (1 min walk)',
      'TRX Elevated Central Park (1 min walk)',
      'TRX MRT station (3 mins underground passage)',
      'Royal Selangor Golf Club (3 mins drive)'
    ],
    description: 'Core Residence TRX sets a pristine benchmark for luxury urban living inside Tun Razak Exchange. Designed specifically to host active global professionals and digital financial elites, Core integrates eco-friendly intelligence with a world-class amenity lineup.',
    lat: 3.1415,
    lng: 101.7185
  },
  {
    id: 'golden-crown-residence',
    name: 'Golden Crown Residence',
    developer: 'Symphony Life',
    state: 'Kuala Lumpur',
    area: 'KLCC',
    priceMin: 1850000,
    priceMax: 3900000,
    completionYear: 2026,
    propertyType: 'Condo',
    tenure: 'Freehold',
    furnishing: 'Fully Furnished',
    bedrooms: 3,
    bathrooms: 3,
    carPark: 3,
    totalUnits: 150,
    totalFloors: 38,
    builtUpMin: 1200,
    builtUpMax: 2800,
    maintenanceFee: 0.55,
    airbnbFriendly: true,
    investmentScore: 9.2,
    ownStayScore: 9.4,
    rentalYield: 6.5,
    featured: false,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80'
    ],
    vrTourLink: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
    droneViewLink: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
    keyHighlights: [
      'Gated freehold luxury sky residences located premiumly adjacent to KLCC',
      'Private internal lift access and temperature-regulated private balcony plunge pool',
      'Personal automated parking garages and soundproof luxury entertainment lounges',
      'Magnificent triple-layer guard patrols and perimeter thermal security grids'
    ],
    nearbyAmenities: [
      'Sayfol International School (3 mins drive)',
      'Ampang Park LRT & MRT station (4 mins walk)',
      'Suria KLCC shopping mall (5 mins walk)',
      'Gleneagles Hospital KL (4 mins drive)'
    ],
    description: 'Golden Crown Residence represents an extraordinarily scarce opportunity to own freehold sky villas right in the epicentre of KLCC. These masterpiece colonial-styled tower suites cater towards high-profile multi-generational families demanding space, status, and iron-clad safety.',
    lat: 3.1555,
    lng: 101.7122
  },
  {
    id: 'trx-residence',
    name: 'TRX Residence',
    developer: 'Lendlease',
    state: 'Kuala Lumpur',
    area: 'TRX',
    priceMin: 1150000,
    priceMax: 2900000,
    completionYear: 2026,
    propertyType: 'Serviced Apartment',
    tenure: 'Freehold',
    furnishing: 'Fully Furnished',
    bedrooms: 2,
    bathrooms: 2,
    carPark: 1,
    totalUnits: 896,
    totalFloors: 53,
    builtUpMin: 700,
    builtUpMax: 1250,
    maintenanceFee: 0.85,
    airbnbFriendly: true,
    investmentScore: 9.5,
    ownStayScore: 8.2,
    rentalYield: 6.8,
    featured: false,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
    ],
    vrTourLink: 'https://images.unsplash.com/photo-1545324418-cc1a3fa15c00',
    droneViewLink: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00',
    keyHighlights: [
      'Developed by global urban marvel constructor Lendlease',
      'Direct private lobby gateway into the retail levels of The Exchange TRX Mall',
      'Integrated smart district heating grids reducing individual cooling electric bills',
      'High target appreciation potential inside Malaysias singular financial district'
    ],
    nearbyAmenities: [
      'TRX Central Park (1 min walk)',
      'LRT/MRT TRX Interchange (2 mins walk)',
      'Prince Court Medical Center (3 mins drive)',
      'Royal Selangor Golf Club (4 mins drive)'
    ],
    description: 'TRX Residences presents the gold standard of integrated transit-oriented lifestyles. Rising elegantly alongside TRX Signature Tower, TRX Residences provides homeowners and foreign investors with a secure, highly liquid global financial hub asset.',
    lat: 3.1422,
    lng: 101.7191
  },
  {
    id: 'oxley-towers',
    name: 'Oxley Towers',
    developer: 'Oxley Holdings',
    state: 'Kuala Lumpur',
    area: 'KLCC',
    priceMin: 1600000,
    priceMax: 4500000,
    completionYear: 2027,
    propertyType: 'Serviced Apartment',
    tenure: 'Freehold',
    furnishing: 'Fully Furnished',
    bedrooms: 3,
    bathrooms: 3,
    carPark: 2,
    totalUnits: 590,
    totalFloors: 78,
    builtUpMin: 810,
    builtUpMax: 1600,
    maintenanceFee: 0.82,
    airbnbFriendly: true,
    investmentScore: 9.4,
    ownStayScore: 9.1,
    rentalYield: 6.7,
    featured: false,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80'
    ],
    vrTourLink: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab',
    droneViewLink: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab',
    keyHighlights: [
      'Integrated signature five-star SO/ Sofitel residences serviced luxury',
      'Rising 78-stories with the highest urban sky deck, lounge, and pool in KLCC',
      'Exclusive boutique shopping courtyard under-housing the residential towers',
      'Surrounded elegantly by global corporate embassies'
    ],
    nearbyAmenities: [
      'KLCC LRT Station (3 mins walk)',
      'Suria KLCC Galleria (4 mins walk)',
      'Saloma Link Bridge pedestrian path (5 mins walk)',
      'Jalan P. Ramlee Lifestyle block (2 mins walk)'
    ],
    description: 'Oxley Towers KLCC is an imposing luxury lifestyle project that commands the KL skyline. Anchored by SO/ Sofitel hospitality, Oxley serves elite multi-cultural amenities, premium sky decks, and impeccable housekeeping benefits right to your doorstep.',
    lat: 3.1582,
    lng: 101.7145
  },
  {
    id: 'centrix-the-station',
    name: 'Centrix The Station',
    developer: 'MRT Corp & SP Setia',
    state: 'Kuala Lumpur',
    area: 'KLCC',
    priceMin: 680000,
    priceMax: 1250000,
    completionYear: 2026,
    propertyType: 'Condo',
    tenure: 'Freehold',
    furnishing: 'Partly Furnished',
    bedrooms: 2,
    bathrooms: 2,
    carPark: 2,
    totalUnits: 650,
    totalFloors: 42,
    builtUpMin: 650,
    builtUpMax: 1100,
    maintenanceFee: 0.38,
    airbnbFriendly: true,
    investmentScore: 8.9,
    ownStayScore: 9.2,
    rentalYield: 6.1,
    featured: false,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
    ],
    vrTourLink: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
    droneViewLink: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
    keyHighlights: [
      'True Transit-Oriented Development with direct linked access bridge into Dang Wangi LRT & Bukit Nanas Monorail Station',
      '2 stops to Suria KLCC and Petronas Twin Towers via the integrated LRT line',
      'Eco Green Certified building with advanced solar array panels and smart home locks',
      'Highly connected location ideal for international professionals and investors'
    ],
    nearbyAmenities: [
      'Dang Wangi LRT Station (Direct connection via walkway)',
      'Bukit Nanas Monorail Station (Direct connection via walkway)',
      'Petronas Twin Towers & Suria KLCC (2 stops via LRT)',
      'KL Forest Eco Park (8 mins walk)'
    ],
    description: 'Centrix The Station is Kuala Lumpur’s premier transit-oriented development (TOD). Positioned directly above the Dang Wangi LRT station, it connects residents effortlessly to major business hubs while offering high-altitude pool hubs, shared creative co-working suites, and sky lounges.',
    lat: 3.1565,
    lng: 101.6985
  },
  {
    id: 'clouthaus-klcc',
    name: 'Clouthaus KLCC',
    developer: 'TA Global',
    state: 'Kuala Lumpur',
    area: 'KLCC',
    priceMin: 1350000,
    priceMax: 3200000,
    completionYear: 2025,
    propertyType: 'Serviced Apartment',
    tenure: 'Leasehold',
    furnishing: 'Fully Furnished',
    bedrooms: 2,
    bathrooms: 2,
    carPark: 1,
    totalUnits: 380,
    totalFloors: 39,
    builtUpMin: 700,
    builtUpMax: 1400,
    maintenanceFee: 0.78,
    airbnbFriendly: true,
    investmentScore: 9.4,
    ownStayScore: 8.9,
    rentalYield: 7.3,
    featured: false,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
    ],
    vrTourLink: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00',
    droneViewLink: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00',
    keyHighlights: [
      'Luxurious high-ceiling modern loft design layout schemes developed by TA Global',
      'Direct walking bridge connection to Avenue K shopping gallery and LRT station',
      'Exclusive resident on-site Cloud Spa, cryotherapy chamber, and hydro pool',
      'AI biometric facial locks and integrated smart digital parcel locker services'
    ],
    nearbyAmenities: [
      'Avenue K Shopping Mall & LRT Station (Direct walk)',
      'Suria KLCC & Petronas Twin Towers (3 mins walk via covered tunnel)',
      'KLCC Park & jogging tracks (5 mins walk)',
      'HSC Medical Center (2 mins walk)'
    ],
    description: 'Clouthaus KLCC brings the absolute peak of modern technological design and architectural excellence by TA Global. Boasting beautiful vertical lofts, spacious glass window spans, and convenient access next to Avenue K, Clouthaus is highly popular for business travelers and high-yield investors.',
    lat: 3.1610,
    lng: 101.7102
  },
  {
    id: 'ascott-star',
    name: 'Ascott Star',
    developer: 'Symphony Life',
    state: 'Kuala Lumpur',
    area: 'KLCC',
    priceMin: 1650000,
    priceMax: 5500000,
    completionYear: 2024,
    propertyType: 'Serviced Apartment',
    tenure: 'Freehold',
    furnishing: 'Fully Furnished',
    bedrooms: 2,
    bathrooms: 2,
    carPark: 2,
    totalUnits: 410,
    totalFloors: 57,
    builtUpMin: 720,
    builtUpMax: 1550,
    maintenanceFee: 0.85,
    airbnbFriendly: true,
    investmentScore: 9.5,
    ownStayScore: 9.3,
    rentalYield: 7.0,
    featured: false,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80'
    ],
    vrTourLink: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab',
    droneViewLink: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab',
    keyHighlights: [
      'Fully serviced and managed by elite global hoteliers brand Ascott',
      'Beautiful infinity club pool framing up-close panoramic views of the Petronas Twin Towers',
      'Includes premium private spa treatments and custom fine-dining room services',
      'Stellar holiday rental performance record with professional management'
    ],
    nearbyAmenities: [
      'Petronas Twin Towers (3 mins walk)',
      'LRT KLCC (3 mins walk)',
      'Saloma Overpass Bridge (4 mins walk)',
      'Suria KLCC mall (3 mins walk)'
    ],
    description: 'Ascott Star KLCC represents a legendary luxury asset in the most iconic postal code of Malaysia. Managed completely by the world-famous Ascott Group, these fully turnkey hotel-suites offer buyers hand-free passive investments backed by stellar heritage brand standards.',
    lat: 3.1598,
    lng: 101.7121
  },
  {
    id: 'parkside-residence-bangsar',
    name: 'Parkside Residence Bangsar',
    developer: 'S P Setia & Mitsui Fudosan',
    state: 'Kuala Lumpur',
    area: 'Bangsar',
    priceMin: 950000,
    priceMax: 2500000,
    completionYear: 2026,
    propertyType: 'Condo',
    tenure: 'Freehold',
    furnishing: 'Partly Furnished',
    bedrooms: 2,
    bathrooms: 2,
    carPark: 3,
    totalUnits: 120,
    totalFloors: 12,
    builtUpMin: 980,
    builtUpMax: 1800,
    maintenanceFee: 0.45,
    airbnbFriendly: false,
    investmentScore: 9.1,
    ownStayScore: 9.6,
    rentalYield: 5.4,
    featured: false,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
    ],
    vrTourLink: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
    droneViewLink: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
    keyHighlights: [
      'Joint venture masterpiece by Malaysia\'s premier S P Setia and Japan\'s legendary Mitsui Fudosan',
      'Ultra-low density design with only 120 hand-crafted high-end residences',
      'Direct visual framing and walking gateway into the leafy Bangsar Linear Park',
      'Multi-layered military grade smart locks and custom private vault safes integrated'
    ],
    nearbyAmenities: [
      'Bangsar Village 1 & 2 Malls (4 mins walk)',
      'LRT Bangsar Station (8 mins walk)',
      'Jalan Telawi Lifestyle Shopping Streets (4 mins walk)',
      'Mid Valley Megamall (5 mins drive)'
    ],
    description: 'Parkside Residence Bangsar delivers a quiet, sophisticated, nature-inspired lifestyle jointly crafted by S P Setia and Mitsui Fudosan in the prestigious older neighborhoods of Bangsar. Ideal for high-net-worth professionals, Parkside perfectly balances deep greenery, privacy, and metropolitan ease.',
    lat: 3.1285,
    lng: 101.6778
  },
  {
    id: 'bangsar-hill-park',
    name: 'Bangsar Hill Park',
    developer: 'Sunsuria & Suez Capital',
    state: 'Kuala Lumpur',
    area: 'Bangsar',
    priceMin: 1020000,
    priceMax: 3100000,
    completionYear: 2025,
    propertyType: 'Condo',
    tenure: 'Leasehold',
    furnishing: 'Partly Furnished',
    bedrooms: 3,
    bathrooms: 2,
    carPark: 2,
    totalUnits: 980,
    totalFloors: 55,
    builtUpMin: 910,
    builtUpMax: 1470,
    maintenanceFee: 0.42,
    airbnbFriendly: false,
    investmentScore: 9.2,
    ownStayScore: 9.5,
    rentalYield: 5.6,
    featured: false,
    image: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80'
    ],
    vrTourLink: 'https://images.unsplash.com/photo-1460317442991-0ec209397118',
    droneViewLink: 'https://images.unsplash.com/photo-1460317442991-0ec209397118',
    keyHighlights: [
      'Elite resort-inspired swimming lagoons and private tropical oasis beaches',
      'Full-size on premises clay tennis court, glass squash court, and personal gym',
      'Exclusive grand master resident clubhouse with cigar lounge and screen room',
      'Located within the highly valued, secure residential enclave of Bangsar Hill'
    ],
    nearbyAmenities: [
      'Bangsar Shopping Centre (BSC) (5 mins walk)',
      'LRT Bangsar Station (5 mins walk)',
      'Pantai Hospital Kuala Lumpur (4 mins drive)',
      'KL Sentral Transportation Interchange (5 mins drive)'
    ],
    description: 'Bangsar Hill Park represents a highly grand residential estate positioned above the calm, prestigious hills of Bangsar. Tailored specifically as a peaceful urban sanctuary, it features stellar health-oriented facilities and lush forest-like landscapes.',
    lat: 3.1252,
    lng: 101.6749
  },
  {
    id: 'khaya-tree-residence-bangsar',
    name: 'Khaya Tree Residence Bangsar',
    developer: 'Melati Ehsan',
    state: 'Kuala Lumpur',
    area: 'Bangsar',
    priceMin: 2100000,
    priceMax: 5800000,
    completionYear: 2027,
    propertyType: 'Landed',
    tenure: 'Leasehold',
    furnishing: 'Partly Furnished',
    bedrooms: 5,
    bathrooms: 5,
    carPark: 2,
    totalUnits: 180,
    totalFloors: 24,
    builtUpMin: 3200,
    builtUpMax: 5600,
    maintenanceFee: 0.28,
    airbnbFriendly: false,
    investmentScore: 9.0,
    ownStayScore: 9.8,
    rentalYield: 4.8,
    featured: false,
    image: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80'
    ],
    vrTourLink: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6',
    droneViewLink: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6',
    keyHighlights: [
      'Gentry-level hillside freehold standalone luxury villas with maximum privacy',
      'Individual direct open infinity pool framing stunning vistas of the city skyline',
      'Pre-installed high-capacity residential solar panels and EV charging infrastructure',
      'Gated guarded estate featuring high-definition infrared CCTV tracking'
    ],
    nearbyAmenities: [
      'Bangsar Shopping Centre (BSC) (3 mins drive)',
      'Bangsar Village (4 mins drive)',
      'Pantai Medical Hospital (5 mins drive)',
      'Cempaka International School (8 mins drive)'
    ],
    description: 'Khaya Tree Residence Bangsar is the absolute pinnacle of luxury hillside landed living. These freehold hillside villas feature beautiful private infinity pools, advanced climate control glass, smart security, and exceptional space layout design.',
    lat: 3.1310,
    lng: 101.6795
  }
];

export const MOCK_ARTICLES: Article[] = [
  {
    id: 'guide-foreign-buyer',
    title: 'How Foreigners Can Successfully Buy Property in Malaysia: The Complete Guide',
    category: 'Foreign Buyer',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    readTime: '6 min read',
    date: 'May 31, 2026',
    summary: 'A step-by-step breakdown of state minimum pricing thresholds, MMRH policies, and bank financing options for international buyers.',
    content: 'Malaysia welcomes foreign real estate investment with very friendly policies compared to other East Asian countries. Under current regulations, foreigners are eligible to buy freehold or leasehold properties directly in their own name. However, states implement minimum purchase limits to shelter local housing. For instance, in Kuala Lumpur and Penang, the minimum pricing typically stands at RM 1,000,000 for standard high-rises. Our mortgage guide highlights that foreign investors can typically secure up to 70% to 80% financing from domestic banks when holding valid resident permits or company assets.'
  },
  {
    id: 'guide-airbnb-yields',
    title: 'Top High-Yield Areas in Kuala Lumpur Perfect for Short-Term Airbnb in 2026',
    category: 'Investment',
    image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80',
    readTime: '4 min read',
    date: 'May 12, 2026',
    summary: 'Discover key micro-locations in Bukit Bintang and KLCC achieving over 7-8% net rental yield with professional hosting operators.',
    content: 'Airbnb demand in Malaysia has skyrocketed, fueled by high-tech corporate hubs and tourist crowds. The most profitable locations remain within 500 meters of iconic transit nodes or major shopping gallerias. Projects located directly close to TRX or Bukit Bintang are generating double the yields of classic residential suburbs. When acquiring properties for this purpose, ensure the management guidelines explicitly allow commercial short-term let operations, and choose layouts with smart locks and dual-key functionality.'
  },
  {
    id: 'guide-loan-secrets',
    title: 'Secrets to Securing Fast Property Loan Approvals with Low Bank Interest Rates',
    category: 'Loan Tips',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    readTime: '5 min read',
    date: 'April 28, 2026',
    summary: 'How to calculate your Debt Service Ratio (DSR), organize documents, and choose between Islamic and Conventional home loans.',
    content: 'Securing a commercial home loan in Malaysia requires understanding how banks calculate your Debt Service Ratio (DSR). Most banks allow maximum DSRs between 60% to 70% of absolute net monthly income. Maintaining a clean CCRIS profile (Central Credit Reference Information System), submitting complete EPF (Employees Provident Fund) records, and including valid dividend tax filings will dramatically shorten evaluation times and grant you access to preferential margins (current rates fluctuate around 3.8% to 4.3% p.a.).'
  }
];

export const MOCK_FAQS: FAQItem[] = [
  {
    id: 'faq-foreigner',
    question: 'Can foreigners buy property in Malaysia?',
    answer: 'Yes! Foreigners can legally purchase properties under freehold or leasehold titles. However, they must adhere to State-specified minimum price thresholds (e.g., RM 1 million in Kuala Lumpur, RM 1 million in Selangor for developer projects, etc.) to ensure local housing markets remain balanced.',
    category: 'Foreign Buyer'
  },
  {
    id: 'faq-downpayment',
    question: 'What is the minimum downpayment required for a home?',
    answer: 'For a first or second residential property, the standard bank margin of finance is 90%, requiring a minimum 10% cash downpayment. For third property ownership, the financing limit falls to 70%, requiring a 30% downpayment. Real estate taxes, lawyer fees, and stamp duty add roughly 3-5% in ancillary costs.',
    category: 'Morgage'
  },
  {
    id: 'faq-difference',
    question: 'What is the main difference between Freehold and Leasehold properties?',
    answer: 'Freehold property grants absolute indefinite ownership of the land. Leasehold titles grant tenancy ownership from the state governate for a specified period (typically 99 years). Leasehold properties are often priced slightly lower initially but may experience stagnating prices as the lease term approaches maturity under 40 years, unless extended.',
    category: 'Property Type'
  },
  {
    id: 'faq-airbnb-friendly',
    question: 'How can I check if a condominium is Airbnb-friendly?',
    answer: 'Always look for projects that are built on commercial titles or explicitly classified as serviced apartments with commercial operations enabled in their joint-management body (JMB) bylaws. Projects designed with dual-key layouts and distinct concierge areas are optimized for short-term occupants.',
    category: 'Investment'
  }
];
