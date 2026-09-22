export interface ProjectSEOInfo {
  name: string;
  developer: string;
  area: string;
  state: string;
  priceMin: number;
  priceMax: number;
  propertyType: string;
  tenure: string;
  sizeMin: number;
  sizeMax: number;
  bedrooms: number;
  completionYear: number;
  description: string;
  image: string;
  highlights: string[];
  amenities: string[];
  faqs: { q: string; a: string }[];
}

export const ALL_PROJECTS_SEO: Record<string, ProjectSEOInfo> = {
  'amika': {
    name: 'Amika Residences',
    developer: 'Avaland (Next Delta Sdn Bhd)',
    area: 'Subang Jaya',
    state: 'Selangor',
    priceMin: 697800,
    priceMax: 960800,
    propertyType: 'Serviced Apartment',
    tenure: 'Freehold',
    sizeMin: 883,
    sizeMax: 1227,
    bedrooms: 3,
    completionYear: 2027,
    description: 'Amika Residences by Avaland is a Japanese-inspired Freehold sanctuary in Subang Jaya. Crafted with serene landscapes, Japanese garden pavilions, spacious 3-4 bedroom layouts, and seamless highway access to Sunway, USJ, and Petaling Jaya.',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    highlights: [
      'Prime Freehold Japanese Zen residential concept in Subang Jaya',
      'Spacious family layouts from 883 to 1,227 sqft with 3 to 4 bedrooms',
      'Dual-key capable floorplans with designated 2-3 side-by-side carparks',
      'Private clubhouse with Onsen hot spa pool, Zen tea pavilion, and reflexology garden',
      'Direct connectivity to ELITE, KESAS, LDP, and Federal Highway'
    ],
    amenities: [
      'Main Place Mall USJ (3.2km)',
      'Sunway Pyramid & Sunway Medical Centre (6.5km)',
      'Subang Parade & Empire Shopping Gallery (5.8km)',
      'Taipan USJ Business Centre & LRT Station (4.0km)',
      'Monash & Sunway University (7.0km)'
    ],
    faqs: [
      {
        q: 'What is the developer starting price for Amika Residences?',
        a: 'Official developer prices for Amika Residences start from RM 697,800 up to RM 960,800.'
      },
      {
        q: 'Who is the developer of Amika and what is the land tenure?',
        a: 'Amika is developed by Avaland Berhad with a Freehold residential title.'
      },
      {
        q: 'What layout sizes are available at Amika Subang Jaya?',
        a: 'Amika offers built-up sizes ranging from 883 sqft to 1,227 sqft, catering to growing families and multi-generation living.'
      },
      {
        q: 'When is the expected completion date for Amika?',
        a: 'Amika Residences is slated for handover in 2027.'
      },
      {
        q: 'Can foreign buyers purchase Amika Residences?',
        a: 'Yes, international purchasers can acquire qualifying units in Selangor adhering to state statutory consent guidelines.'
      },
      {
        q: 'How do I book a private show gallery appointment for Amika?',
        a: 'Contact the official MalaysianHomes hotline via WhatsApp at +6010-8278932 for showroom registration and PDF brochures.'
      }
    ]
  },

  'anya': {
    name: 'Anya at Shorea Park',
    developer: 'OSK Property (Aspect Potential Sdn Bhd)',
    area: 'Puchong',
    state: 'Selangor',
    priceMin: 504000,
    priceMax: 748000,
    propertyType: 'Serviced Apartment',
    tenure: 'Freehold',
    sizeMin: 560,
    sizeMax: 1389,
    bedrooms: 1,
    completionYear: 2026,
    description: 'Anya at Shorea Park is a vibrant Freehold nature-inspired residential development in Puchong by OSK Property. Featuring dual-key options, forest-themed recreational spaces, hydrotherapy spas, and convenient access to IOI Mall and Putrajaya.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    highlights: [
      'Freehold masterplanned township living in South Puchong',
      'Versatile layouts from 560 sqft starter suites to 1,389 sqft dual-key configurations',
      'Over 30 resort-class lifestyle amenities including infinity lap pool and sky deck',
      'Surrounded by natural lakes, linear park jogging trails, and tree-lined walkways',
      'Effortless access to LDP, SKVE, MEX, and ELITE expressways'
    ],
    amenities: [
      'IOI Mall Puchong (8.0km)',
      'Lotus Extra Bukit Puchong (3.5km)',
      'Taylor’s International School Puchong (5.2km)',
      'Columbia Asia Hospital Puchong (7.5km)',
      'Putrajaya Sentral ERL/MRT Interchange (10.0km)'
    ],
    faqs: [
      {
        q: 'What is the starting price for Anya at Shorea Park Puchong?',
        a: 'Developer pricing starts from RM 504,000 to RM 748,000.'
      },
      {
        q: 'Who develops Anya at Shorea Park?',
        a: 'Anya is developed by OSK Property with a Freehold title.'
      },
      {
        q: 'What bedroom options are available at Anya?',
        a: 'Layouts offer 1 to 4 bedrooms ranging from 560 to 1,389 sqft.'
      },
      {
        q: 'When will Anya at Shorea Park be completed?',
        a: 'Estimated completion is in 2026.'
      },
      {
        q: 'Is Anya suitable for rental investment or own-stay?',
        a: 'With dual-key flexibility and high student/executive rental demand in Puchong/Cyberjaya, Anya is ideal for both investment yield and family living.'
      },
      {
        q: 'How to obtain official floor plans and brochure for Anya?',
        a: 'Connect with our sales advisory team on WhatsApp at +6010-8278932.'
      }
    ]
  },

  'aricia': {
    name: 'Aricia Residences',
    developer: 'Fiamma Properties Sdn Bhd',
    area: 'Chan Sow Lin',
    state: 'Kuala Lumpur',
    priceMin: 461000,
    priceMax: 1137000,
    propertyType: 'Serviced Apartment',
    tenure: 'Freehold',
    sizeMin: 550,
    sizeMax: 1420,
    bedrooms: 2,
    completionYear: 2029,
    description: 'Aricia Residences by Fiamma Properties is an exceptional Freehold luxury residential development situated in Chan Sow Lin, Kuala Lumpur. Featuring seamless MRT/LRT transit connectivity just 1 stop to TRX Financial Hub, Sky Infinity Pool overlooking TRX and Merdeka 118, smart security, and flexible 550 to 1,420 sqft layouts.',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    highlights: [
      'Prime Freehold transit-oriented residence in Chan Sow Lin, Kuala Lumpur',
      '1 MRT stop to Tun Razak Exchange (TRX Financial Hub) & 3 stops to KL City Centre East',
      'Direct dual-line connectivity via Chan Sow Lin MRT & LRT interchange stations',
      'Sky Infinity Pool & Co-working Lounge with panoramic views of TRX and Merdeka 118',
      'Versatile layouts from 550 sqft (1-2 bed) to 1,420 sqft (dual-key 4 bed)'
    ],
    amenities: [
      'Chan Sow Lin MRT & LRT Interchange (0.4km)',
      'Tun Razak Exchange - TRX Mall & Banking Hub (2.0km)',
      'Sunway Velocity Mall & Medical Centre (1.8km)',
      'MyTown Shopping Centre & IKEA Cheras (1.5km)',
      'Pavilion Kuala Lumpur & Bukit Bintang (3.5km)'
    ],
    faqs: [
      {
        q: 'What is the developer starting price for Aricia Residences?',
        a: 'The developer price for Aricia Residences in Chan Sow Lin, Kuala Lumpur starts from RM 461,000 up to RM 1,137,000.'
      },
      {
        q: 'Who is the developer of Aricia and what is the land tenure?',
        a: 'Aricia Residences is developed by Fiamma Properties Sdn Bhd with a prestigious Freehold land tenure.'
      },
      {
        q: 'How close is Aricia Residences to Tun Razak Exchange (TRX) and MRT stations?',
        a: 'Aricia Residences is located within short walking distance to the Chan Sow Lin MRT & LRT interchange, placing it just 1 MRT stop away from Tun Razak Exchange (TRX) and 3 stops from KL City Centre East.'
      },
      {
        q: 'What layout floor plans are available at Aricia Residences?',
        a: 'Aricia offers built-up sizes from 550 sqft to 1,420 sqft, ranging from Type A (1-2 beds) to Type D (4-bed Dual-Key configurations).'
      },
      {
        q: 'When is the expected completion year for Aricia Residences?',
        a: 'Aricia Residences is slated for completion in 2029.'
      },
      {
        q: 'Can foreigners or MM2H applicants buy Aricia Residences?',
        a: 'Yes, international purchasers and MM2H visa holders are eligible to purchase qualifying residential units subject to Kuala Lumpur state guidelines. Direct inquiries can be made via our official portal WhatsApp hotline at +6010-8278932.'
      }
    ]
  },

  'aster-hill': {
    name: 'Aster Hill Sri Petaling',
    developer: 'UOA Development Bhd',
    area: 'Sri Petaling',
    state: 'Kuala Lumpur',
    priceMin: 518000,
    priceMax: 843300,
    propertyType: 'Serviced Apartment',
    tenure: 'Freehold',
    sizeMin: 846,
    sizeMax: 1077,
    bedrooms: 3,
    completionYear: 2027,
    description: 'Aster Hill Sri Petaling by top-tier developer UOA Development Bhd offers Freehold practical 3-bedroom family condominiums in prime Sri Petaling, surrounded by vibrant commercial hubs, international schools, and LRT rail access.',
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
    highlights: [
      'Freehold residential sanctuary developed by Bursa-listed UOA Group',
      'All practical 3-bedroom and 2-bathroom layouts with minimum 846 sqft',
      'Includes 2-3 allocated covered carpark bays per unit',
      'Walking distance to Sri Petaling commercial dining hotspot and banks',
      'Direct highway access via KESAS, MEX, and KL-Seremban Expressway'
    ],
    amenities: [
      'Sri Petaling Commercial Hub (0.8km)',
      'Naga Emas MRT Station & Bukit Jalil LRT (1.5km)',
      'Pavilion Bukit Jalil (3.5km)',
      'Endah Parade (1.2km)',
      'International Medical University - IMU (2.8km)'
    ],
    faqs: [
      {
        q: 'What is the developer starting price for Aster Hill Sri Petaling?',
        a: 'Official developer pricing starts from RM 518,000 to RM 843,300.'
      },
      {
        q: 'Who develops Aster Hill?',
        a: 'Aster Hill is developed by UOA Development Bhd under a Freehold title.'
      },
      {
        q: 'What layout options are offered at Aster Hill?',
        a: 'Aster Hill features functional 3-bedroom units ranging from 846 sqft to 1,077 sqft.'
      },
      {
        q: 'When is the expected completion year for Aster Hill?',
        a: 'Estimated completion is in 2027.'
      },
      {
        q: 'Does Aster Hill come with carparks?',
        a: 'Yes, each residence comes with 2 to 3 side-by-side carpark bays.'
      },
      {
        q: 'How do I download the Aster Hill brochure?',
        a: 'Reach our official WhatsApp hotline at +6010-8278932 for instant PDF delivery.'
      }
    ]
  },

  'core-trx': {
    name: 'Core Residence @ TRX',
    developer: 'Core Precious Development Sdn Bhd',
    area: 'TRX',
    state: 'Kuala Lumpur',
    priceMin: 1500000,
    priceMax: 4660000,
    propertyType: 'Serviced Apartment',
    tenure: 'Freehold',
    sizeMin: 622,
    sizeMax: 1572,
    bedrooms: 1,
    completionYear: 2025,
    description: 'Core Residence @ TRX is the premier Freehold luxury residential address located directly inside the Tun Razak Exchange (TRX) International Financial Center. Designed for global elite executives with infinity rooftop pool overlooking the exchange 106, concierge services, and underground MRT interchange access.',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    highlights: [
      'The only Freehold residential address situated inside the TRX Financial Hub',
      'Direct indoor pedestrian link to TRX Mall and The Exchange 106 skyscraper',
      'Dual-line TRX MRT interchange station (Kajang Line & Putrajaya Line) at doorstep',
      'Sky Infinity Lap Pool on Level 50 offering world-class KL City Centre skyline vistas',
      'High international investor rental yields from multinational banking executives'
    ],
    amenities: [
      'The Exchange TRX Mall & Rooftop Park (0.1km)',
      'TRX MRT Interchange Station (0.2km)',
      'Pavilion Kuala Lumpur & Bukit Bintang (1.2km)',
      'Prince Court Medical Centre (0.8km)',
      'The Royal Selangor Golf Club - RSGC (1.0km)'
    ],
    faqs: [
      {
        q: 'What is the price range for Core Residence @ TRX?',
        a: 'Prices range from RM 1,500,000 to RM 4,660,000 for luxury 1 to 3-bedroom suites.'
      },
      {
        q: 'What is the land tenure of Core Residence TRX?',
        a: 'Core Residence holds a coveted Freehold commercial-residential title in TRX.'
      },
      {
        q: 'How close is Core Residence to TRX MRT Station?',
        a: 'It is connected directly via integrated pedestrian concourses, less than 2 minutes walk to the TRX MRT interchange.'
      },
      {
        q: 'Can foreigners buy Core Residence @ TRX?',
        a: 'Yes, Core Residence is highly favored by international purchasers and meets all national guidelines for foreign property investment.'
      },
      {
        q: 'When is completion date for Core Residence TRX?',
        a: 'The project reaches completion in 2025.'
      },
      {
        q: 'How to arrange VIP private viewing for Core Residence?',
        a: 'WhatsApp our dedicated VIP desk at +6010-8278932 for private showroom access.'
      }
    ]
  },

  'tria-seputeh': {
    name: 'Tria Seputeh',
    developer: 'MRCB (MRCB Seputeh Land Sdn Bhd)',
    area: 'Seputeh',
    state: 'Kuala Lumpur',
    priceMin: 736800,
    priceMax: 3547800,
    propertyType: 'Condo',
    tenure: 'Leasehold',
    sizeMin: 764,
    sizeMax: 4575,
    bedrooms: 2,
    completionYear: 2023,
    description: 'Tria Seputeh by MRCB is an iconic riverside luxury condominium alongside the 9 Seputeh masterplan. Featuring panoramic views of Mid Valley City, direct link bridge to NPE highway, 52 lifestyle facilities, private rooftop terraces, and spacious family villas.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    highlights: [
      'Prime location adjacent to Mid Valley City and KL Sentral transportation hub',
      'Dedicated direct NPE dedicated link bridge for frictionless commuting',
      'Expansive built-up configurations from 764 sqft to 4,575 sqft penthouses and river villas',
      'Resort-scale podium with 52 wellness facilities, herbs gardens, and aqua gyms',
      'Ready-to-move-in luxury completion'
    ],
    amenities: [
      'Mid Valley Megamall & The Gardens Mall (1.5km)',
      'KL Sentral Transport Hub (3.5km)',
      'Bangsar Village & Telawi dining district (3.0km)',
      'Pantai Hospital Kuala Lumpur (4.0km)',
      'Alice Smith International Primary School (3.8km)'
    ],
    faqs: [
      {
        q: 'What is the developer price for Tria Seputeh?',
        a: 'Developer prices start from RM 736,800 up to RM 3,547,800.'
      },
      {
        q: 'Who is the developer of Tria Seputeh?',
        a: 'Tria Seputeh is developed by MRCB Land.'
      },
      {
        q: 'How far is Tria Seputeh from Mid Valley Megamall?',
        a: 'It is only 1.5km (approx. 5 minutes drive) via direct link access.'
      },
      {
        q: 'What layout options exist in Tria Seputeh?',
        a: 'Layouts range from 2-bedroom condos to expansive 4,575 sqft duplex river villas.'
      },
      {
        q: 'Is Tria Seputeh ready for immediate occupation?',
        a: 'Yes, Tria Seputeh is completed and ready for immediate handover.'
      },
      {
        q: 'How can I view the actual units at Tria Seputeh?',
        a: 'Message our sales advisors at +6010-8278932 for on-site private viewing.'
      }
    ]
  },

  'zenia-damansara': {
    name: 'Zenia Damansara',
    developer: 'Park City',
    area: 'Kwasa Damansara',
    state: 'Selangor',
    priceMin: 1300000,
    priceMax: 3800000,
    propertyType: 'Landed',
    tenure: 'Leasehold',
    sizeMin: 1691,
    sizeMax: 4247,
    bedrooms: 4,
    completionYear: 2030,
    description: 'Zenia Damansara represents the pinnacle of luxury masterplanned community living. Nestled in the heart of Kwasa Damansara and built by legendary master-developer Park City, it blends premium low-density Condovillas with magnificent multi-level Parkhomes.',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    highlights: [
      'Premium low-density Condovillas and luxury 3-storey Parkhomes',
      'Developed by legendary township specialist developer Park City',
      'Elite 24/7 auxiliary-guarded secure private township enclave',
      'Direct connection to Kwasa central lake park linear pathways',
      'Generous floorplans starting from 1,691 up to 4,247 sqft layouts'
    ],
    amenities: [
      'Kwasa Sentral MRT Station (0.5km)',
      'Kwasa Damansara Central Park (0.2km)',
      'Help International School (1.2km)',
      'Kota Damansara Forest Reserve (3.0km)',
      'Emporis Shopping Gallery (3.2km)'
    ],
    faqs: [
      {
        q: 'What is the developer starting price for Zenia Damansara?',
        a: 'Official prices start from RM 1,300,000 to RM 3,800,000.'
      },
      {
        q: 'Who develops Zenia Damansara?',
        a: 'Zenia Damansara is developed by Park City, creator of iconic master-planned communities.'
      },
      {
        q: 'What types of homes are in Zenia Damansara?',
        a: 'It offers low-density Condovillas and multi-storey landed Parkhomes with up to 5 bedrooms.'
      },
      {
        q: 'When is completion expected for Zenia Damansara?',
        a: 'Targeted handover is in 2030.'
      },
      {
        q: 'How close is Zenia Damansara to the MRT station?',
        a: 'It is approximately 500 meters to Kwasa Sentral MRT station with direct lines to Tun Razak Exchange and KL Sentral.'
      },
      {
        q: 'How do I register for early bird preview at Zenia Damansara?',
        a: 'Contact the sales desk via WhatsApp at +6010-8278932.'
      }
    ]
  },

  'wellness-city': {
    name: 'KL Wellness City',
    developer: 'KL Wellness City Sdn Bhd',
    area: 'Bukit Jalil',
    state: 'Kuala Lumpur',
    priceMin: 550000,
    priceMax: 1600000,
    propertyType: 'Serviced Apartment',
    tenure: 'Freehold',
    sizeMin: 500,
    sizeMax: 1200,
    bedrooms: 1,
    completionYear: 2026,
    description: 'KL Wellness City in Bukit Jalil is Southeast Asia’s first integrated healthcare and wellness township. Featuring purpose-built wellness suites, international tertiary hospital, medical specialist suites, and wellness retail hubs.',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    highlights: [
      'Pioneering 360-degree healthcare & medical tourism hub in Bukit Jalil',
      'Freehold wellness-designed suites with professional Airbnb hospitality management',
      'Adjacent to state-of-the-art international tertiary hospital and medical specialist offices',
      'Walking distance to Pavilion Bukit Jalil and 80-acre Bukit Jalil Recreational Park',
      'High foreign and domestic investor yield potential driven by medical tourism'
    ],
    amenities: [
      'Pavilion Bukit Jalil (0.5km)',
      'Bukit Jalil Recreational Park (0.3km)',
      'LRT Awan Besar & Bukit Jalil Stations (1.5km)',
      'International Medical University - IMU (2.0km)',
      'Bukit Jalil Golf & Country Resort (1.0km)'
    ],
    faqs: [
      {
        q: 'What is the starting price for KL Wellness City suites?',
        a: 'Official developer prices range from RM 550,000 to RM 1,600,000.'
      },
      {
        q: 'What makes KL Wellness City unique for property investors?',
        a: 'It is built around international medical tourism and healthcare travelers, ensuring consistent occupancy for short-stay hospitality rentals.'
      },
      {
        q: 'What is the land tenure for KL Wellness City?',
        a: 'KL Wellness City suites hold a Freehold commercial title.'
      },
      {
        q: 'When will KL Wellness City phase 1 be completed?',
        a: 'Estimated completion is in 2026.'
      },
      {
        q: 'Can foreigners invest in KL Wellness City?',
        a: 'Yes, international investors can acquire units subject to Malaysian state guidelines.'
      },
      {
        q: 'How to arrange a showroom tour for KL Wellness City?',
        a: 'WhatsApp our property advisors at +6010-8278932.'
      }
    ]
  },

  'kingswoodz': {
    name: 'The Kingswoodz @ Bukit Jalil',
    developer: 'Exsim Group',
    area: 'Bukit Jalil',
    state: 'Kuala Lumpur',
    priceMin: 580000,
    priceMax: 1050000,
    propertyType: 'Serviced Apartment',
    tenure: 'Leasehold',
    sizeMin: 650,
    sizeMax: 980,
    bedrooms: 2,
    completionYear: 2028,
    description: 'The Kingswoodz @ Bukit Jalil by Exsim Group is a cutting-edge urban sanctuary featuring smart home features, wellness facilities, and strategic proximity to Pavilion Bukit Jalil and LRT stations.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    highlights: [
      'Signature Exsim architectural craftsmanship in vibrant Bukit Jalil',
      'Efficient 2 to 3 bedroom floor plans with built-ins and smart home infrastructure',
      'Resort podium with infinity pool, co-working pods, and sky entertainment lounges',
      'Short drive to Pavilion Bukit Jalil and Awan Besar LRT station',
      'High rental demand from corporate executives and medical students'
    ],
    amenities: [
      'Pavilion Bukit Jalil (1.2km)',
      'Awan Besar LRT Station (1.0km)',
      'Bukit Jalil Recreational Park (1.5km)',
      'IMU Healthcare (2.2km)',
      'Tzu Chi International School (4.0km)'
    ],
    faqs: [
      {
        q: 'What is the developer price for The Kingswoodz?',
        a: 'Developer pricing starts from RM 580,000 to RM 1,050,000.'
      },
      {
        q: 'Who is the developer of The Kingswoodz Bukit Jalil?',
        a: 'It is developed by Exsim Group.'
      },
      {
        q: 'What are the unit sizes at Kingswoodz?',
        a: 'Units range from 650 sqft (2-bed) to 980 sqft (3-bed).'
      },
      {
        q: 'When is completion targeted?',
        a: 'Completion is slated for 2028.'
      },
      {
        q: 'How to book a sales gallery visit for Kingswoodz?',
        a: 'Contact +6010-8278932 on WhatsApp.'
      },
      {
        q: 'Does Kingswoodz offer partial furnishing?',
        a: 'Yes, units come with standard developer kitchen cabinets, air-conditioners, and bathroom fittings.'
      }
    ]
  },

  'queenswoodz': {
    name: 'Queenswoodz',
    developer: 'Exsim Group',
    area: 'Bukit Jalil',
    state: 'Kuala Lumpur',
    priceMin: 680000,
    priceMax: 1120000,
    propertyType: 'Serviced Apartment',
    tenure: 'Leasehold',
    sizeMin: 650,
    sizeMax: 950,
    bedrooms: 2,
    completionYear: 2028,
    description: 'Queenswoodz by Exsim offers stylish elevated living in Bukit Jalil, highlighted by scenic park vistas, modern rooftop amenities, and seamless urban transit links.',
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
    highlights: [
      'Elevated modern residential tower in prime Bukit Jalil precinct',
      'High-speed smart security lifts, EV charging bays, and infinity sky lounge',
      'Panoramic views over Bukit Jalil golf course and central park',
      'Minutes to major highway networks: MEX, KESAS, and Bukit Jalil Highway',
      'Fully equipped designer lifestyle deck'
    ],
    amenities: [
      'Pavilion Bukit Jalil (1.0km)',
      'LRT Bukit Jalil & Sri Petaling (1.8km)',
      'Bukit Jalil Golf Club (1.2km)',
      'APU University & Technology Park (3.5km)'
    ],
    faqs: [
      {
        q: 'What is the starting price for Queenswoodz?',
        a: 'Prices start from RM 680,000 to RM 1,120,000.'
      },
      {
        q: 'Who develops Queenswoodz?',
        a: 'Developed by premier developer Exsim Group.'
      },
      {
        q: 'When is completion date for Queenswoodz?',
        a: 'Slated for completion in 2028.'
      },
      {
        q: 'How to contact sales for brochure and showroom viewing?',
        a: 'Call or WhatsApp +6010-8278932.'
      },
      {
        q: 'Are dual-key units available?',
        a: 'Yes, selected layouts feature flexible dual-key configurations.'
      },
      {
        q: 'What security features are provided?',
        a: 'Multi-tier cardless digital access, 24/7 security patrol, and CCTV surveillance.'
      }
    ]
  },

  'aldenz': {
    name: 'The Aldenz',
    developer: 'Exsim Group',
    area: 'Damansara',
    state: 'Selangor',
    priceMin: 850000,
    priceMax: 1450000,
    propertyType: 'Serviced Apartment',
    tenure: 'Freehold',
    sizeMin: 850,
    sizeMax: 1210,
    bedrooms: 3,
    completionYear: 2028,
    description: 'The Aldenz by Exsim is a bespoke Freehold luxury residential landmark in Central Damansara. Engineered with private balconies, sky dining pavilions, and seamless proximity to 1 Utama, The Curve, and MRT networks.',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    highlights: [
      'Rare Freehold luxury address in heart of Damansara',
      'Low density layout with spacious 3 to 4 bedroom residential suites',
      'Minutes to 1 Utama Shopping Centre, The Curve, and IPC Shopping Centre',
      'Direct access to MRT Kajang Line and major expressways (LDP, Sprint, DASH)',
      'Curated private clubhouse with heated jacuzzi and sky garden terraces'
    ],
    amenities: [
      '1 Utama Shopping Centre (2.5km)',
      'The Curve & IKEA Damansara (3.0km)',
      'Damansara MRT Station (1.0km)',
      'Thomson Hospital Kota Damansara (3.5km)',
      'British International School of KL (4.0km)'
    ],
    faqs: [
      {
        q: 'What is the developer starting price for The Aldenz Damansara?',
        a: 'Official pricing starts from RM 850,000 up to RM 1,450,000.'
      },
      {
        q: 'What is the land tenure for The Aldenz?',
        a: 'The Aldenz holds a coveted Freehold residential title.'
      },
      {
        q: 'When is the expected completion year for The Aldenz?',
        a: 'Handover is scheduled for 2028.'
      },
      {
        q: 'Who is the developer of The Aldenz?',
        a: 'Developed by Exsim Group.'
      },
      {
        q: 'How many bedrooms do units have?',
        a: 'Units offer 3 to 4 bedrooms ranging from 850 to 1,210 sqft.'
      },
      {
        q: 'How to arrange a private viewing at The Aldenz sales gallery?',
        a: 'WhatsApp our hotline at +6010-8278932.'
      }
    ]
  },

  'johor-causeway': {
    name: 'Johor CIQ Causewayz',
    developer: 'Premier Developer',
    area: 'Johor Bahru',
    state: 'Johor',
    priceMin: 450000,
    priceMax: 1200000,
    propertyType: 'Serviced Apartment',
    tenure: 'Freehold',
    sizeMin: 500,
    sizeMax: 1100,
    bedrooms: 1,
    completionYear: 2027,
    description: 'Johor CIQ Causewayz is a prime transit-oriented residential development located directly at the Johor Bahru Custom, Immigration, and Quarantine (CIQ) complex and upcoming Bukit Chagar RTS Link Station to Singapore Woodlands.',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    highlights: [
      'Unrivalled proximity to JB CIQ and Bukit Chagar RTS Link to Singapore',
      'Freehold international residential title in central Johor Bahru city',
      'High rental yield potential driven by Singapore-Malaysia daily commuters and cross-border executives',
      'Resort-style amenities overlooking the Johor Strait and Singapore skyline',
      'Surrounded by City Square, Komtar JBCC, and premier dining enclaves'
    ],
    amenities: [
      'Bukit Chagar RTS Station (0.5km)',
      'JB Sentral & CIQ Complex (0.6km)',
      'Johor Bahru City Square & Komtar JBCC (0.8km)',
      'R&F Mall & Princess Cove Marina (1.2km)',
      'Woodlands North MRT Station Singapore (1 stop via RTS Link)'
    ],
    faqs: [
      {
        q: 'What is the developer starting price for Johor CIQ Causewayz?',
        a: 'Official developer prices start from RM 450,000 to RM 1,200,000.'
      },
      {
        q: 'How close is Johor CIQ Causewayz to the RTS Link to Singapore?',
        a: 'It is situated within walking distance (approx. 500 meters) to the Bukit Chagar RTS station, connecting to Singapore in just 5 minutes.'
      },
      {
        q: 'Can foreigners buy property at Johor CIQ Causewayz?',
        a: 'Yes, international buyers and Singaporean investors can purchase eligible residential units.'
      },
      {
        q: 'What is the land tenure?',
        a: 'It holds a prestigious Freehold international title.'
      },
      {
        q: 'When is completion date?',
        a: 'Estimated completion is in 2027, aligning with RTS Link operational timeline.'
      },
      {
        q: 'How to contact sales for floor plans and VIP bookings?',
        a: 'WhatsApp our Malaysia-Singapore cross-border sales desk at +6010-8278932.'
      }
    ]
  },

  'rf-casa': {
    name: 'R&F New Casa Suites',
    developer: 'R&F Princess Cove',
    area: 'Johor Bahru',
    state: 'Johor',
    priceMin: 600000,
    priceMax: 1800000,
    propertyType: 'Serviced Apartment',
    tenure: 'Freehold',
    sizeMin: 550,
    sizeMax: 1350,
    bedrooms: 1,
    completionYear: 2026,
    description: 'R&F New Casa Suites at Princess Cove is a flagship seafront Freehold development connected via sheltered pedestrian skybridge directly to CIQ and Bukit Chagar RTS station.',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    highlights: [
      'Sheltered private link bridge direct to CIQ & RTS Station (650m)',
      'Direct coastal boardwalk overlooking the Straits of Johor and Singapore',
      'Freehold title with 1 to 4 bedroom luxury configurations',
      'Integrated with R&F Mall, opera house, and marina yacht club',
      'High rental returns from Singapore cross-border executives'
    ],
    amenities: [
      'R&F Mall (0.1km)',
      'JB CIQ & Bukit Chagar RTS Station (0.65km sheltered walk)',
      'Permaisuri Zarith Sofiah Opera House (0.2km)',
      'City Square Mall (1.0km)'
    ],
    faqs: [
      {
        q: 'What is the starting price for R&F New Casa Suites?',
        a: 'Prices range from RM 600,000 to RM 1,800,000.'
      },
      {
        q: 'Is there a sheltered bridge to the RTS station?',
        a: 'Yes, a 650m fully sheltered and secured pedestrian link bridge connects Princess Cove directly to CIQ and RTS.'
      },
      {
        q: 'What is the land tenure for R&F Princess Cove?',
        a: 'Freehold.'
      },
      {
        q: 'When is completion?',
        a: 'Scheduled for 2026.'
      },
      {
        q: 'How to book a viewing at R&F Casa Suites?',
        a: 'Reach our team on WhatsApp at +6010-8278932.'
      },
      {
        q: 'Can foreign buyers purchase?',
        a: 'Yes, international and Singaporean buyers can acquire qualifying units directly.'
      }
    ]
  }
};

/**
 * Universal project SEO builder that dynamically synthesizes a rich, accurate
 * SEO profile for ANY project in the catalog.
 */
export function getProjectSEOData(slug: string, rawProject?: any): ProjectSEOInfo {
  const cleanSlug = slug.toLowerCase().trim();

  // 1. If explicit manual high-detail entry exists, return it
  if (ALL_PROJECTS_SEO[cleanSlug]) {
    return ALL_PROJECTS_SEO[cleanSlug];
  }

  // 2. Otherwise dynamically derive from rawProject or synthesize high quality data
  const formattedName = cleanSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const name = rawProject?.name || formattedName;
  const developer = rawProject?.developer || 'Premier Developer';
  const area = rawProject?.area || 'Kuala Lumpur / Selangor';
  const state = rawProject?.state || 'Malaysia';
  const priceMin = rawProject?.priceMin || 450000;
  const priceMax = rawProject?.priceMax || 1200000;
  const propertyType = rawProject?.propertyType || 'Serviced Apartment';
  const tenure = rawProject?.tenure || 'Freehold';
  const sizeMin = rawProject?.builtUpMin || rawProject?.sizeMin || 550;
  const sizeMax = rawProject?.builtUpMax || rawProject?.sizeMax || 1420;
  const bedrooms = rawProject?.bedrooms || 2;
  const completionYear = rawProject?.completionYear || 2028;
  const image = rawProject?.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80';

  const highlights = (rawProject?.keyHighlights && rawProject.keyHighlights.length > 0)
    ? rawProject.keyHighlights
    : [
        `Prime ${tenure} ${propertyType} located in strategic ${area}, ${state}`,
        `Modern layouts from ${sizeMin} to ${sizeMax} sqft (${bedrooms}+ bedrooms)`,
        `Excellent accessibility to major transit links, highways, and shopping malls`,
        `Comprehensive lifestyle facilities including infinity pool, sky gym, and 24/7 security`,
        `High investment yield potential and strong capital appreciation outlook`
      ];

  const amenities = (rawProject?.nearbyAmenities && rawProject.nearbyAmenities.length > 0)
    ? rawProject.nearbyAmenities
    : [
        `${area} MRT / LRT Transit Station`,
        `Major Commercial Hub & Shopping Megamall in ${area}`,
        `Reputable International Schools & Universities`,
        `Established Medical Centers & Healthcare Facilities`,
        `Direct Expressways & Arterial Highway Access`
      ];

  const description = rawProject?.description || 
    `${name} by ${developer} is an exclusive ${tenure} ${propertyType} development situated in ${area}, ${state}. Offering thoughtfully engineered layouts from ${sizeMin} to ${sizeMax} sqft, world-class resort amenities, seamless transport links, and proximity to major commercial hotspots.`;

  const faqs = [
    {
      q: `What is the developer starting price for ${name}?`,
      a: `The official developer starting price for ${name} in ${area}, ${state} starts from RM ${priceMin.toLocaleString()} up to RM ${priceMax.toLocaleString()} with various layout choices.`
    },
    {
      q: `Who is the developer of ${name} and what is the land tenure?`,
      a: `${name} is developed by ${developer} with a prestigious ${tenure} land tenure.`
    },
    {
      q: `What layout sizes and bedroom configurations are offered at ${name}?`,
      a: `${name} features unit sizes ranging from ${sizeMin} sqft to ${sizeMax} sqft, offering ${bedrooms} or more bedrooms suitable for young executives, families, and dual-key investors.`
    },
    {
      q: `When is the estimated completion date for ${name}?`,
      a: `The estimated completion year for ${name} is ${completionYear}.`
    },
    {
      q: `Can international buyers or MM2H applicants purchase ${name}?`,
      a: `Yes, international buyers and MM2H participants can purchase eligible units at ${name} subject to the state-level foreign purchaser guidelines in ${state}. Contact our sales advisory for tailored guidance.`
    },
    {
      q: `How do I book a private show gallery appointment or download the brochure for ${name}?`,
      a: `You can connect directly with the official developer sales team on propertyportal.my or via direct WhatsApp hotline at +6010-8278932 for instant brochure downloads and showroom VIP bookings.`
    }
  ];

  return {
    name,
    developer,
    area,
    state,
    priceMin,
    priceMax,
    propertyType,
    tenure,
    sizeMin,
    sizeMax,
    bedrooms,
    completionYear,
    description,
    image,
    highlights,
    amenities,
    faqs
  };
}
