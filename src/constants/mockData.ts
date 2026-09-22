/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project, Article, FAQItem, CurrencyConfig, MalaysianState, PropertyType } from '../types';
import { PROJECT_IMAGES_MAP } from './imagesMapping';

export const STATE_AREAS: Record<string, string[]> = {
  'Kuala Lumpur': [
    'Bangsar',
    'Bukit Bintang',
    'Bukit Jalil',
    'Chan Sow Lin',
    'Cheras',
    'KL City Centre',
    'Kuchai Lama',
    'Old Klang Road',
    'OUG',
    'Sentul',
    'Seputeh',
    'Sri Petaling',
    'Sungai Besi',
    'Taman Desa',
    'TRX'
  ],
  'Selangor': [
    'Damansara',
    'Kwasa Damansara',
    'Petaling Jaya',
    'Puchong',
    'Shah Alam',
    'Subang Jaya',
    'USJ'
  ],
  'Johor': [
    'Johor Bahru',
    'Iskandar Puteri',
    'Mount Austin',
    'Puteri Harbour',
    'Tebrau'
  ],
  'Penang': [
    'Bayan Lepas',
    'Batu Ferringhi',
    'Georgetown',
    'Gurney Drive',
    'Tanjung Tokong'
  ]
};

export const DEVELOPERS = [
  'Avaland (Next Delta Sdn Bhd)',
  'OSK Property (Aspect Potential Sdn Bhd)',
  'Fiamma Properties Sdn Bhd',
  'UOA Development Bhd (Cosmo Housing Development Sdn Bhd)',
  'Paramount Property (Aneka Sepakat Sdn Bhd)',
  'Amber Home (Sdn Bhd)',
  'Chin Hin Group',
  'BKSP Autoworld Sdn Bhd',
  'Bangsar Hill Park Development Sdn Bhd',
  'TA Global',
  'Core Precious Development Sdn Bhd',
  'Majestic Gen Sdn Bhd',
  'BRDB',
  'Mah Sing Group',
  'WCT Land Sdn Bhd',
  'Berjaya Hartanah Berhad',
  'Seputeh Resources Sdn Bhd',
  'Orion Tower Sdn Bhd',
  'Malton Berhad',
  'Quaver Sdn Bhd',
  'Radium Development Berhad',
  'Alzac Development Sdn Bhd',
  'MRCB (MRCB Seputeh Land Sdn Bhd)',
  'Kwasa Sentral Sdn Bhd (MRCB)',
  'Kerjaya Property Sdn Bhd',
  'Forward Victory Sdn Bhd',
  'Gaya Kuasa Sdn Bhd',
  'WCT OUG Development Sdn Bhd',
  'Exsim Bukit Jalil City Sdn Bhd',
  'Bayu Mantap Sdn Bhd',
  'Exsim',
  'Exsim (Lembaran Beruntung Sdn Bhd)',
  'Avaland (USJ Citypoint Sdn Bhd)',
  'Glomac (Glomac Albatha Sdn Bhd)'
];

export const CURRENCIES: CurrencyConfig[] = [
  { code: 'MYR', symbol: 'RM', rate: 1.0 },
  { code: 'SGD', symbol: 'S$', rate: 0.31 },
  { code: 'USD', symbol: '$', rate: 0.23 },
  { code: 'CNY', symbol: '¥', rate: 1.66 }
];

type ProjectTuple = [
  string, // id
  string, // name
  string, // developer
  MalaysianState, // state
  string, // area
  number, // priceMin
  number, // priceMax
  number, // completionYear
  PropertyType, // propertyType
  'Freehold' | 'Leasehold', // tenure
  number, // builtUpMin
  number, // builtUpMax
  number, // bedrooms
  number, // lat
  number  // lng
];

const DETAILED_PROJECT_TUPLES: ProjectTuple[] = [
  ['amika', 'Amika', 'Avaland (Next Delta Sdn Bhd)', 'Selangor', 'Subang Jaya', 697800, 960800, 2027, 'Serviced Apartment', 'Freehold', 883, 1227, 3, 3.0494, 101.5906],
  ['anya', 'Anya', 'OSK Property (Aspect Potential Sdn Bhd)', 'Selangor', 'Puchong', 504000, 748000, 2026, 'Serviced Apartment', 'Freehold', 560, 1389, 1, 2.9796, 101.6111],
  ['aricia', 'Aricia', 'Fiamma Properties Sdn Bhd', 'Kuala Lumpur', 'Chan Sow Lin', 461000, 1137000, 2029, 'Serviced Apartment', 'Freehold', 550, 1420, 2, 3.1215, 101.7100],
  ['aster-hill', 'Aster Hill Sri Petaling', 'UOA Development Bhd (Cosmo Housing Development Sdn Bhd)', 'Kuala Lumpur', 'Sri Petaling', 518000, 843300, 2027, 'Serviced Apartment', 'Freehold', 846, 1077, 3, 3.0722, 101.6853],
  ['atera-phase2', 'Atera Phase 2', 'Paramount Property (Aneka Sepakat Sdn Bhd)', 'Selangor', 'Petaling Jaya', 691400, 1290000, 2028, 'Serviced Apartment', 'Leasehold', 775, 1420, 2, 3.1031, 101.6350],
  ['aurum-business', 'Aurum Business Centre (Suites)', 'Amber Home (Sdn Bhd)', 'Kuala Lumpur', 'Cheras', 417545, 600000, 2029, 'Serviced Apartment', 'Freehold', 527, 679, 1, 3.1017, 101.7121],
  ['avantro', 'Avantro Residences', 'Chin Hin Group', 'Kuala Lumpur', 'Bukit Jalil', 664000, 1250000, 2028, 'Serviced Apartment', 'Freehold', 550, 1389, 1, 3.0483, 101.6450],
  ['ayanna-res', 'Ayanna', 'BKSP Autoworld Sdn Bhd', 'Kuala Lumpur', 'Bukit Jalil', 753000, 911000, 2027, 'Condo', 'Freehold', 1155, 2453, 3, 3.0581, 101.6502],
  ['bangsar-hill-bc', 'Bangsar Hill Park – Tower B & C', 'Bangsar Hill Park Development Sdn Bhd', 'Kuala Lumpur', 'Bangsar', 1123000, 1742000, 2028, 'Condo', 'Leasehold', 917, 1478, 2, 3.1252, 101.6749],
  ['bangsar-hill-verdura', 'Bangsar Hill Park – Verdura (Tower D & E)', 'Bangsar Hill Park Development Sdn Bhd', 'Kuala Lumpur', 'Bangsar', 1200000, 1800000, 2029, 'Condo', 'Leasehold', 917, 1478, 2, 3.1260, 101.6760],
  ['clouthaus-res', 'CloutHaus', 'TA Global', 'Kuala Lumpur', 'KL City Centre', 1548800, 4694800, 2029, 'Serviced Apartment', 'Freehold', 549, 1216, 1, 3.1580, 101.7140],
  ['core-trx', 'Core Residence @ TRX', 'Core Precious Development Sdn Bhd', 'Kuala Lumpur', 'TRX', 1500000, 4660000, 2025, 'Serviced Apartment', 'Freehold', 622, 1572, 1, 3.1415, 101.7185],
  ['genstarz-res', 'GenStarz', 'Majestic Gen Sdn Bhd', 'Kuala Lumpur', 'Old Klang Road', 593000, 867000, 2028, 'Serviced Apartment', 'Freehold', 650, 874, 1, 3.0903, 101.6754],
  ['luminar-subang', 'Luminar Residence (Federal Avenue)', 'BRDB', 'Selangor', 'Subang Jaya', 356000, 1027000, 2029, 'Serviced Apartment', 'Freehold', 549, 1389, 1, 3.0812, 101.5822],
  ['m-aspira', 'M Aspira', 'Mah Sing Group', 'Kuala Lumpur', 'Taman Desa', 538800, 1000000, 2029, 'Serviced Apartment', 'Leasehold', 706, 1006, 1, 3.0998, 101.6812],
  ['maple-oug', 'The Maple Residences', 'WCT Land Sdn Bhd', 'Kuala Lumpur', 'OUG', 600000, 1200000, 2025, 'Condo', 'Freehold', 808, 1378, 2, 3.0734, 101.6667],
  ['oaka-res', 'OAKA Residences', 'Berjaya Hartanah Berhad', 'Kuala Lumpur', 'Bukit Jalil', 836000, 1503000, 2028, 'Condo', 'Freehold', 882, 1423, 2, 3.0578, 101.6689],
  ['one-seputeh', 'One Seputeh', 'Seputeh Resources Sdn Bhd', 'Kuala Lumpur', 'Seputeh', 722700, 1772100, 2029, 'Serviced Apartment', 'Freehold', 657, 1611, 2, 3.1112, 101.6823],
  ['orion-bid', 'Orion Residence', 'Orion Tower Sdn Bhd', 'Kuala Lumpur', 'Bukit Bintang', 1580000, 4200000, 2025, 'Serviced Apartment', 'Freehold', 491, 1329, 0, 3.1466, 101.7118],
  ['park-green', 'Park Green Pavilion Bukit Jalil', 'Malton Berhad', 'Kuala Lumpur', 'Bukit Jalil', 1209100, 2000000, 2029, 'Condo', 'Freehold', 1201, 1905, 3, 3.0524, 101.6700],
  ['quaver-kl', 'Quaver Residence', 'Quaver Sdn Bhd', 'Kuala Lumpur', 'Kuchai Lama', 555000, 1200000, 2027, 'Serviced Apartment', 'Leasehold', 1017, 1850, 2, 3.0823, 101.6912],
  ['radium-arena', 'Radium Arena', 'Radium Development Berhad', 'Kuala Lumpur', 'Old Klang Road', 480000, 950000, 2028, 'Serviced Apartment', 'Freehold', 658, 920, 2, 3.0898, 101.6742],
  ['riverville2', 'Riverville Residences 2', 'Alzac Development Sdn Bhd', 'Kuala Lumpur', 'Old Klang Road', 430000, 625000, 2027, 'Serviced Apartment', 'Freehold', 803, 915, 3, 3.0845, 101.6687],
  ['tria-seputeh', 'Tria Seputeh', 'MRCB (MRCB Seputeh Land Sdn Bhd)', 'Kuala Lumpur', 'Seputeh', 736800, 3547800, 2023, 'Condo', 'Leasehold', 764, 4575, 2, 3.1165, 101.6775],
  ['tujuh-kwasa', 'Tujuh Residences', 'Kwasa Sentral Sdn Bhd (MRCB)', 'Selangor', 'Kwasa Damansara', 501000, 839000, 2026, 'Serviced Apartment', 'Leasehold', 550, 909, 1, 3.1767, 101.5706],
  ['vox-sentul', 'Vox', 'Kerjaya Property Sdn Bhd', 'Kuala Lumpur', 'Sentul', 523200, 782300, 2027, 'Serviced Apartment', 'Freehold', 667, 947, 2, 3.1912, 101.6912],
  ['wyn-puchong', 'Wyn', 'Forward Victory Sdn Bhd', 'Selangor', 'Puchong', 516700, 708900, 2027, 'Serviced Apartment', 'Leasehold', 700, 850, 2, 3.0410, 101.6210],
  ['zenia-damansara', 'Zenia Damansara', 'Park City', 'Selangor', 'Kwasa Damansara', 1300000, 3800000, 2030, 'Landed', 'Leasehold', 1691, 4247, 4, 3.1725, 101.5695],
  ['ren-bukit-jalil', 'Ren Residence', 'Gaya Kuasa Sdn Bhd', 'Kuala Lumpur', 'Bukit Jalil', 537000, 1148000, 2027, 'Condo', 'Leasehold', 920, 1680, 3, 3.0502, 101.6606],
  ['aras-wcity', 'Aras (WCity OUG)', 'WCT OUG Development Sdn Bhd', 'Kuala Lumpur', 'OUG', 666000, 950000, 2029, 'Serviced Apartment', 'Freehold', 850, 1062, 2, 3.0645, 101.6631],
  ['vividz-res', 'The Vividz', 'Exsim Bukit Jalil City Sdn Bhd', 'Kuala Lumpur', 'Old Klang Road', 446400, 850000, 2030, 'Serviced Apartment', 'Leasehold', 484, 915, 1, 3.0459, 101.6662],
  ['khaya-bangsar', 'Khaya Residence', 'Bayu Mantap Sdn Bhd', 'Kuala Lumpur', 'Bangsar', 893000, 1694000, 2029, 'Serviced Apartment', 'Leasehold', 630, 1321, 1, 3.1310, 101.6795],
  ['phoeniz-suites', 'Phoeniz Suites @ KL City Centre', 'Exsim', 'Kuala Lumpur', 'KL City Centre', 1016400, 1421600, 2031, 'Serviced Apartment', 'Freehold', 484, 678, 1, 3.1610, 101.7126],
  ['branniganz-exsim', 'Branniganz', 'Exsim (Lembaran Beruntung Sdn Bhd)', 'Kuala Lumpur', 'KL City Centre', 803500, 1200000, 2028, 'Serviced Apartment', 'Leasehold', 344, 678, 0, 3.1605, 101.7135],
  ['alora-subang', 'Alora Residence', 'Avaland (USJ Citypoint Sdn Bhd)', 'Selangor', 'Subang Jaya', 470800, 995800, 2027, 'Serviced Apartment', 'Freehold', 568, 1457, 1, 3.0227, 101.5815],
  ['loop-city', 'Loop City @ Puchong', 'Glomac (Glomac Albatha Sdn Bhd)', 'Selangor', 'Puchong', 365610, 612317, 2028, 'Serviced Apartment', 'Leasehold', 450, 750, 0, 3.0312, 101.6167]
];

type CoordTuple = [
  string, // id
  string, // name
  number, // lat
  number, // lng
  MalaysianState, // state
  string // area
];

const COORDINATE_PROJECT_TUPLES: CoordTuple[] = [
  ['aldenz', 'The Aldenz', 3.17375430580668, 101.616371821163, 'Selangor', 'Damansara'],
  ['parkside', 'Parkside', 3.1645, 101.6122, 'Selangor', 'Damansara'],
  ['foresthill', 'ForestHill Residence', 3.1792109, 101.6178492, 'Selangor', 'Damansara'],
  ['amaya', 'Amaya Residence', 3.1965076, 101.6173055, 'Selangor', 'Damansara'],
  ['grand-damansara', 'Grand Damansara', 3.1325458, 101.6104671, 'Selangor', 'Damansara'],
  ['stellar-damansara', 'Stellar Damansara', 3.13220944920006, 101.615793443322, 'Selangor', 'Damansara'],
  ['seresta', 'Seresta', 3.182434467, 101.6131875, 'Selangor', 'Damansara'],
  ['livista', 'Livista', 3.1978163, 101.6131406, 'Selangor', 'Damansara'],
  ['the-lines', 'The Lines', 3.15692326258695, 101.609448671456, 'Selangor', 'Damansara'],
  ['pinnacle-ara', 'Pinnacle Ara', 3.10826359762268, 101.590425040552, 'Selangor', 'Damansara'],
  ['hampton', 'Hampton Damansara', 3.1775269, 101.6204536, 'Selangor', 'Damansara'],
  ['d-tessera', "D'Tessera", 3.17190488570198, 101.614839141209, 'Selangor', 'Damansara'],
  ['amara-res', 'Amara Residence', 3.11063716287159, 101.58086020372, 'Selangor', 'Petaling Jaya'],
  ['linari-kwasa', 'Linari Kwasa Damansara', 3.1767319, 101.570642, 'Selangor', 'Kwasa Damansara'],
  ['mahogany', 'Mahogany Residences', 3.17211257973759, 101.578695222166, 'Selangor', 'Kwasa Damansara'],
  ['panorama-kelana', 'Panorama Residences, Kelana Jaya', 3.09563313719861, 101.592285181964, 'Selangor', 'Petaling Jaya'],
  ['sunway-dhill', "Sunway d'hill Residences", 3.1644859, 101.5802239, 'Selangor', 'Petaling Jaya'],
  ['d-evia-kwasa', "D'Evia Kwasa", 3.16737547087865, 101.565589151269, 'Selangor', 'Kwasa Damansara'],
  ['arra-res', 'ARRA', 3.10954620733159, 101.58380853143, 'Selangor', 'Petaling Jaya'],
  ['paradigm-mall', 'Paradigm Mall', 3.10462017115691, 101.596081469709, 'Selangor', 'Petaling Jaya'],
  ['kwasa-cc', 'Kwasa Damansara City Center', 3.17157898147547, 101.566604676211, 'Selangor', 'Kwasa Damansara'],
  ['kingswoodz', 'The Kingswoodz @ Bukit Jalil', 3.0587357, 101.672585, 'Kuala Lumpur', 'Bukit Jalil'],
  ['queenswoodz', 'Queenswoodz', 3.05767617200174, 101.672877856883, 'Kuala Lumpur', 'Bukit Jalil'],
  ['wellness-city', 'KL Wellness City', 3.04690313895938, 101.667666721591, 'Kuala Lumpur', 'Bukit Jalil'],
  ['veladaz', 'Veladaz', 3.04673409475637, 101.666182208055, 'Kuala Lumpur', 'Bukit Jalil'],
  ['johor-causeway', 'Johor CIQ Causewayz', 1.4630060186301, 103.769163921456, 'Johor', 'Johor Bahru'],
  ['rf-casa', 'R&F New Casa Suites', 1.46094368547892, 103.772425720809, 'Johor', 'Johor Bahru'],
  ['gen-sphere', 'GEN SPHERE', 1.46064844744123, 103.767737472535, 'Johor', 'Johor Bahru'],
  ['gen-rise', 'GEN RISE', 1.46174811260367, 103.768793218871, 'Johor', 'Johor Bahru'],
  ['ciq-johor', 'CIQ ', 1.4650075064781, 103.766250588799, 'Johor', 'Johor Bahru'],
  ['calia-pgb', 'Calia Residences by PGB', 1.48261454394774, 103.720182763333, 'Johor', 'Johor Bahru'],
  ['bukit-chagar', 'Bukit Chagar RTS Station', 1.46664175187431, 103.762836325096, 'Johor', 'Johor Bahru'],
  ['m-grand-minori', 'M Grand Minori', 1.47894484974011, 103.773063978253, 'Johor', 'Johor Bahru'],
  ['address-maxim', 'The Address by Maxim', 1.4831017488507, 103.766253586166, 'Johor', 'Johor Bahru'],
  ['arden-johor', 'THE ARDEN', 1.47440367013199, 103.763674458687, 'Johor', 'Johor Bahru'],
  ['skyline-tslaw', 'Skyline One Sentosa by TS LAW', 1.49214426595117, 103.768886511978, 'Johor', 'Johor Bahru'],
  ['paragon-signatures', 'Paragon Signatures Suite', 1.46656828285198, 103.744157250484, 'Johor', 'Johor Bahru'],
  ['asteriaz-exsim', 'The Asteriaz by Exsim', 1.48825175926432, 103.755980218511, 'Johor', 'Johor Bahru'],
  ['nadi-southkey', 'NADI Residences BY Southkey City', 1.50335341613893, 103.777139780129, 'Johor', 'Johor Bahru'],
  ['mb-world-bay', 'MB World Bay', 1.47009495327172, 103.725503539756, 'Johor', 'Johor Bahru'],
  ['paragon-gateway', 'Paragon Gateway', 1.50294772291247, 103.763936204469, 'Johor', 'Johor Bahru']
];

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';

export const MOCK_PROJECTS: Project[] = [
  ...DETAILED_PROJECT_TUPLES.map((t): Project => {
    const projId = t[0];
    const mapped = PROJECT_IMAGES_MAP[projId];
    const bedrooms = t[12];

    // Defaults
    let keyHighlights: string[] = [];
    let nearbyAmenities: string[] = [];
    let description = '';
    let image = (mapped && mapped.image) ? mapped.image : DEFAULT_IMAGE;
    let gallery = (mapped && mapped.gallery && mapped.gallery.length > 0) ? mapped.gallery : [DEFAULT_IMAGE];
    let layoutPlans: any[] | undefined = (mapped && mapped.layoutPlans && mapped.layoutPlans.length > 0) ? mapped.layoutPlans : undefined;
    let featured = false;
    let bathrooms = bedrooms > 1 ? bedrooms - 1 : 1;
    let carPark = bedrooms > 2 ? 2 : 1;
    let totalUnits = 450;
    let totalFloors = 35;
    let investmentScore = 8.5;
    let ownStayScore = 8.5;
    let rentalYield = 5.2;

    if (projId === 'aricia') {
      keyHighlights = [
        "Prime Freehold transit-oriented residence in vibrant Chan Sow Lin, Kuala Lumpur",
        "Just 1 MRT stop to Tun Razak Exchange (TRX Financial Hub) & 3 stops to KL City Centre East",
        "Direct dual-line connectivity via Chan Sow Lin MRT & LRT interchange stations",
        "Panoramic city skyline views facing Tun Razak Exchange (TRX) and Merdeka 118",
        "Diverse flexible layouts from 550 sqft (1-2 bed) to 1,420 sqft (dual-key 4 bed)",
        "Resort-class amenities including Sky Infinity Pool, co-working hub, and fitness center"
      ];
      nearbyAmenities = [
        "Chan Sow Lin MRT & LRT Interchange (0.4km)",
        "Tun Razak Exchange - TRX Mall & Banking Hub (2.0km)",
        "Sunway Velocity Mall & Medical Centre (1.8km)",
        "MyTown Shopping Centre & IKEA Cheras (1.5km)",
        "Pavilion Kuala Lumpur & Bukit Bintang (3.5km)",
        "Prince Court Medical Centre (3.2km)"
      ];
      description = "Aricia Residences by Fiamma Properties is an exceptional Freehold luxury residential development situated in Chan Sow Lin, Kuala Lumpur. Engineered for modern urban executives, savvy investors, and multi-generational families, Aricia offers exceptional connectivity to the TRX Financial Hub and downtown KL City Centre via rapid transit links. Featuring masterfully planned architectural suites, high-ceiling layouts, Sky Infinity Pool overlooking the KL skyline, multi-tier biometric security, and premium developer fittings.";
      image = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80';
      gallery = [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80'
      ];
      layoutPlans = [
        {
          name: "Type A (550 sqft)",
          imageUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
          description: "Efficient 1-2 Bedroom urban suite layout designed for young professionals and high-yield Airbnb / long-term rental investors.",
          sizeSqft: 550
        },
        {
          name: "Type B (750 sqft)",
          imageUrl: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80",
          description: "Functional 2 Bedroom, 2 Bathroom open-plan layout featuring bright living spaces, integrated kitchen, and private balcony.",
          sizeSqft: 750
        },
        {
          name: "Type C (1,050 sqft)",
          imageUrl: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80",
          description: "Spacious 3 Bedroom, 2 Bathroom family residence with dedicated utility yard, dry/wet kitchen counter, and master ensuite.",
          sizeSqft: 1050
        },
        {
          name: "Type D Dual-Key (1,420 sqft)",
          imageUrl: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=800&q=80",
          description: "Premium 4 Bedroom Dual-Key luxury configuration allowing simultaneous self-stay and independent studio rental income.",
          sizeSqft: 1420
        }
      ];
      featured = true;
      bathrooms = 2;
      carPark = 2;
      totalUnits = 650;
      totalFloors = 45;
      investmentScore = 9.4;
      ownStayScore = 8.9;
      rentalYield = 5.8;
    } else if (projId === 'zenia-damansara') {
      keyHighlights = [
        "Premium low-density Condovillas and luxury 3-storey Parkhomes",
        "Developed by legendary township specialist developer Park City",
        "Elite 24/7 auxiliary-guarded secure private township enclave",
        "Direct connection to Kwasa central lake park linear pathways",
        "Generous floorplans starting from 1,691 up to 4,247 sqft layouts"
      ];
      nearbyAmenities = [
        "Kwasa Sentral MRT Station (0.5km)",
        "Kwasa Damansara Central Park (0.2km)",
        "Help International School (1.2km)",
        "Kota Damansara Forest Reserve (3.0km)",
        "Emporis Shopping Gallery (3.2km)"
      ];
      description = "Zenia Damansara represents the pinnacle of luxury masterplanned community living. Nestled in the heart of Kwasa Damansara and built by legendary master-developer Park City, it blends premium low-density Condovillas with magnificent multi-level Parkhomes. Homeowners can experience resort-style clubhouses, deep biophilic linear walking parks, and premium-crafted spaces.";
      image = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80';
      gallery = [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80'
      ];
      layoutPlans = [
        {
          name: "Type C Condovilla",
          imageUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
          description: "Modern low-rise 2,053 sqft design with 4 bedrooms, dual frontage views, and premium biophilic natural materials throughout.",
          sizeSqft: 2053
        },
        {
          name: "Type D Condovilla",
          imageUrl: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80",
          description: "Cozy 1,691 sqft 3 bedroom villa layout presenting generous layout flow, wide balconies, and designated study alcove.",
          sizeSqft: 1691
        },
        {
          name: "Type A Parkhome",
          imageUrl: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80",
          description: "Spacious multi-level 4,247 sqft floor plan with 5 bedrooms, signature open courtyard, and wide backyard carpark porch.",
          sizeSqft: 4247
        },
        {
          name: "Type B Parkhome",
          imageUrl: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=800&q=80",
          description: "Elegant 3,095 sqft park-facing intermediate layout offering premium cross-ventilation, floor-to-ceiling glass, and dual master suites.",
          sizeSqft: 3095
        }
      ];
      featured = true;
      bathrooms = 4;
      carPark = 2;
      totalUnits = 1085;
      totalFloors = 15;
      investmentScore = 8.7;
      ownStayScore = 9.1;
      rentalYield = 4.6;
    }

    return {
      id: projId,
      name: t[1],
      developer: t[2],
      state: t[3],
      area: t[4],
      priceMin: t[5],
      priceMax: t[6],
      completionYear: t[7],
      propertyType: t[8],
      tenure: t[9],
      builtUpMin: t[10],
      builtUpMax: t[11],
      bedrooms: bedrooms,
      bathrooms: bathrooms,
      carPark: carPark,
      totalUnits: totalUnits,
      totalFloors: totalFloors,
      maintenanceFee: 0.35,
      airbnbFriendly: projId === 'zenia-damansara-condovilla' ? false : (t[8] === 'Serviced Apartment'),
      investmentScore: investmentScore,
      ownStayScore: ownStayScore,
      rentalYield: rentalYield,
      furnishing: 'Partly Furnished',
      keyHighlights: keyHighlights,
      nearbyAmenities: nearbyAmenities,
      gallery: gallery,
      locationImage: (mapped && mapped.locationImage) ? mapped.locationImage : undefined,
      layoutPlans: layoutPlans,
      featured: featured,
      vrTourLink: '',
      droneViewLink: '',
      description: description,
      image: image,
      lat: t[13],
      lng: t[14]
    };
  }),
  ...COORDINATE_PROJECT_TUPLES.map((t): Project => {
    const projId = t[0];
    const mapped = PROJECT_IMAGES_MAP[projId];

    // Custom premium specs for featured projects
    let developer = 'To Be Updated';
    let priceMin = 0;
    let priceMax = 0;
    let completionYear = 2028;
    let propertyType: PropertyType = 'Condo';
    let tenure: 'Freehold' | 'Leasehold' = 'Freehold';
    let furnishing: 'Partly Furnished' | 'Unfurnished' | 'Fully Furnished' = 'Unfurnished';
    let bedrooms = 0;
    let bathrooms = 0;
    let carPark = 0;
    let totalUnits = 0;
    let totalFloors = 0;
    let builtUpMin = 0;
    let builtUpMax = 0;
    let maintenanceFee = 0;
    let airbnbFriendly = false;
    let investmentScore = 0;
    let ownStayScore = 0;
    let rentalYield = 0;
    let keyHighlights: string[] = [];
    let nearbyAmenities: string[] = [];
    let description = 'Project details to be updated soon.';

    if (projId === 'aldenz') {
      developer = 'Exsim Group';
      priceMin = 850000;
      priceMax = 1450000;
      completionYear = 2028;
      propertyType = 'Serviced Apartment';
      tenure = 'Freehold';
      furnishing = 'Partly Furnished';
      builtUpMin = 850;
      builtUpMax = 1210;
      bedrooms = 3;
      bathrooms = 2;
      carPark = 2;
      totalUnits = 450;
      totalFloors = 38;
      maintenanceFee = 0.38;
      airbnbFriendly = true;
      rentalYield = 5.6;
      investmentScore = 9.2;
      ownStayScore = 8.8;
      keyHighlights = ['Minutes to MRT Station', 'Next to Major Shopping Hub', 'Low Density Premium Units', 'Multi-tier Safety Lock Systems'];
      nearbyAmenities = ['Damansara MRT', '1 Utama Mall', 'The Curve', 'SJK(C) Puay Chai 2'];
      description = 'Superb boutique luxury residence featuring iconic layout floorplans, panoramic forest & skyline views, and standard executive concierge.';
    } else if (projId === 'queenswoodz') {
      developer = 'Exsim Group';
      priceMin = 680000;
      priceMax = 1120000;
      completionYear = 2028;
      propertyType = 'Serviced Apartment';
      tenure = 'Leasehold';
      furnishing = 'Partly Furnished';
      builtUpMin = 650;
      builtUpMax = 950;
      bedrooms = 2;
      bathrooms = 2;
      carPark = 1;
      totalUnits = 580;
      totalFloors = 42;
      maintenanceFee = 0.35;
      airbnbFriendly = true;
      rentalYield = 5.4;
      investmentScore = 8.9;
      ownStayScore = 8.5;
      keyHighlights = ['Panoramic Bukit Jalil Park Views', 'Link Bridge to Pavilion Mall', 'High-speed Smart Security Lift', 'Infinity Sky Lounge'];
      nearbyAmenities = ['LRT Bukit Jalil', 'Pavilion Bukit Jalil', 'Bukit Jalil Recreational Park', 'IMU'];
      description = 'Sleek and dynamic high-rise tower at Bukit Jalil designed with premium materials, active smart-home systems, and extensive amenities.';
    } else if (projId === 'parkside') {
      developer = 'WCT Land Sdn Bhd';
      priceMin = 750000;
      priceMax = 1350000;
      completionYear = 2029;
      propertyType = 'Condo';
      tenure = 'Freehold';
      furnishing = 'Partly Furnished';
      builtUpMin = 917;
      builtUpMax = 1478;
      bedrooms = 3;
      bathrooms = 2;
      carPark = 2;
      totalUnits = 360;
      totalFloors = 32;
      maintenanceFee = 0.32;
      airbnbFriendly = false;
      rentalYield = 5.2;
      investmentScore = 8.7;
      ownStayScore = 9.0;
      keyHighlights = ['Direct Access to Central Park', 'Dual Key Layout Option', 'Premium Wellness Sky Gym', 'Multi-tier Guard Security Systems'];
      nearbyAmenities = ['ARA Damansara LRT', 'Paradigm Mall', 'Subang National Golf Club', 'Sime Darby Medical Centre'];
      description = 'Highly integrated family sanctuary styled with spacious private layout designs, private lift lobbies, and seamless landscape corridors.';
    }

    const isFeatured = projId === 'aldenz' || projId === 'queenswoodz' || projId === 'parkside';

    return {
      id: projId,
      name: t[1],
      developer,
      state: t[4],
      area: t[5],
      priceMin,
      priceMax,
      completionYear,
      propertyType,
      tenure,
      furnishing,
      bedrooms,
      bathrooms,
      carPark,
      totalUnits,
      totalFloors,
      builtUpMin,
      builtUpMax,
      maintenanceFee,
      airbnbFriendly,
      investmentScore,
      ownStayScore,
      rentalYield,
      keyHighlights,
      nearbyAmenities,
      gallery: (mapped && mapped.gallery && mapped.gallery.length > 0) ? mapped.gallery : [DEFAULT_IMAGE],
      locationImage: (mapped && mapped.locationImage) ? mapped.locationImage : undefined,
      layoutPlans: (mapped && mapped.layoutPlans && mapped.layoutPlans.length > 0) ? mapped.layoutPlans : undefined,
      featured: isFeatured,
      vrTourLink: '',
      droneViewLink: '',
      description,
      image: (mapped && mapped.image) ? mapped.image : DEFAULT_IMAGE,
      lat: t[2],
      lng: t[3]
    };
  })
];

export const MOCK_ARTICLES: Article[] = [
  {
    id: 'guide-foreign-buyer-1',
    title: 'How Foreigners Can Successfully Buy Property in Malaysia: The Complete Guide',
    titleZh: '外籍买家如何在大马成功购房：最全保姆级指南',
    category: 'Foreign Buyer',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    readTime: '6 min read',
    readTimeZh: '阅读需要6分钟',
    date: 'June 23, 2026',
    dateZh: '2026年6月23日',
    summary: 'A step-by-step breakdown of state minimum pricing thresholds, MMRH policies, and bank financing options for international buyers.',
    summaryZh: '分步剖析马来西亚各州外国买家最低购房门槛、第二家园政策以及本地银行的按揭贷款申请要点。',
    content: 'Malaysia welcomes foreign real estate investment with very friendly policies compared to other East Asian countries. Under current regulations, foreigners are eligible to buy freehold or leasehold properties directly in their own name. However, states implement minimum purchase limits to shelter local housing. For instance, in Kuala Lumpur and Penang, the minimum pricing typically stands at RM 1,000,000 for standard high-rises. Our mortgage guide highlights that foreign investors can typically secure up to 70% to 80% financing from domestic banks when holding valid resident permits or company assets.',
    contentZh: '马来西亚为外国买家提供友好政策，允许直接持有永久和租赁产权。为保障本地市场，政府设定了最低购房门槛：吉隆坡和槟城的高层住宅门槛为100万令吉，雪兰莪部分地区可能更高。外国买家若能提供充足的收入证明，或参与第二家园计划（MM2H），通常可从大马本地银行申请高达70%至75%的房贷。'
  },
  {
    id: 'guide-airbnb-yields-2',
    title: 'Top High-Yield Areas in Kuala Lumpur Perfect for Short-Term Airbnb in 2026',
    titleZh: '2026年吉隆坡高收益民宿短租（Airbnb）黄金地段推荐',
    category: 'Investment',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    readTime: '4 min read',
    readTimeZh: '阅读需要4分钟',
    date: 'June 18, 2026',
    dateZh: '2026年6月18日',
    summary: 'Discover key micro-locations in Bukit Bintang and KL City Centre achieving over 7-8% net rental yield with professional hosting operators.',
    summaryZh: '为您揭秘武吉免登与吉隆坡城中城（KL City Centre）周边年净收益率超越7%-8%的宝藏民宿商圈。',
    content: 'Airbnb demand in Malaysia has skyrocketed, fueled by high-tech corporate hubs and tourist crowds. The most profitable locations remain within 500 meters of iconic transit nodes or major shopping gallerias. Projects located directly close to TRX or Bukit Bintang are generating double the yields of classic residential suburbs. When acquiring properties for this purpose, ensure the management guidelines explicitly allow commercial short-term let operations, and choose layouts with smart locks and dual-key functionality.',
    contentZh: '吉隆坡旅游业的蓬勃发展让民宿短租市场收益可观。寻求高租金回报的投资者应锁定距离主要商圈和轻轨站500米以内的黄金地段。武吉免登、城中城（KL City Centre）以及新金融中心敦拉萨（TRX）周边的短租房源，年净收益率往往可达7%至9%。购买时务必确认大楼管理条例允许商业短租，并优先选择配有智能门锁的双钥匙户型，以便于托管。'
  },
  {
    id: 'guide-loan-secrets-3',
    title: 'Secrets to Securing Fast Property Loan Approvals with Low Bank Interest Rates',
    titleZh: '大马房贷速批与锁定超低银行贷款利率的终极秘诀',
    category: 'Loan Tips',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    readTime: '5 min read',
    readTimeZh: '阅读需要5分钟',
    date: 'June 12, 2026',
    dateZh: '2026年6月12日',
    summary: 'How to calculate your Debt Service Ratio (DSR), organize documents, and choose between Islamic and Conventional home loans.',
    summaryZh: '教您如何精准测算偿债率（DSR）、高效备妥批贷材料，并在伊斯兰与传统贷款之间做出最优抉择。',
    content: 'Securing a commercial home loan in Malaysia requires understanding how banks calculate your Debt Service Ratio (DSR). Most banks allow maximum DSRs between 60% to 70% of absolute net monthly income. Maintaining a clean CCRIS profile (Central Credit Reference Information System), submitting complete EPF (Employees Provident Fund) records, and including valid dividend tax filings will dramatically shorten evaluation times and grant you access to preferential margins (current rates fluctuate around 3.8% to 4.3% p.a.).',
    contentZh: '在马来西亚申请低利率房贷，关键在于控制债务偿还率（DSR）。本地银行通常要求该比例不超过净月收入的60%至70%。为了锁定3.8%到4.2%的优惠利率，借款人应保持卓越的CCRIS信用记录，备妥3至6个月的盖章薪资单及最新报税单。此外，对比伊斯兰金融与传统贷款在提前还款及印花税方面的优劣，也有助于节省开支。'
  },
  {
    id: 'guide-own-stay-4',
    title: 'Choosing the Perfect Family Home in Klang Valley: Top Suburban Communities',
    titleZh: '在大吉隆坡挑选完美的自住家庭房：精选成熟社区一览',
    category: 'Own Stay',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    readTime: '5 min read',
    readTimeZh: '阅读需要5分钟',
    date: 'June 08, 2026',
    dateZh: '2026年6月8日',
    summary: 'Evaluate local resident densities, international schools, security records, and garden spaces in Ara Damansara and Desa ParkCity.',
    summaryZh: '对比阿拉白沙罗与德萨公园市（Desa ParkCity）的居住密度、高品质国际学校、安防表现以及公园绿地。',
    content: 'For own-stay buyers in the Klang Valley, balancing neighborhood amenities with daily commute times is paramount. Master-planned townships like Desa ParkCity and Ara Damansara are highly popular among growing families due to their walkable green spaces, secure pet-friendly parks, and proximity to international schools. When evaluating individual projects, pay close attention to the local resident density, community safety track records, and layout configurations. Spacious three-bedroom options with large kitchens and auxiliary study rooms offer the flexibility needed for hybrid remote work arrangements and multi-generational living environments.',
    contentZh: '在大吉隆坡地区选购自住房，首要考虑的是周边配套与日常通勤的平衡。类似德萨公园市（Desa ParkCity）和阿拉白沙罗（Ara Damansara）的成熟社区，凭借大面积绿化、宠物友好公园及优质国际学校，深受家庭买家青睐。实地考察时，应重点关注社区的人口密度、安防系统和户型实用性。宽敞的三居室伴带独立书房，非常适合现代家庭进行居家办公。'
  },
  {
    id: 'guide-market-trends-5',
    title: 'Kuala Lumpur Premium Real Estate Market Outlook for 2026 & Beyond',
    titleZh: '2026年及未来吉隆坡高端住宅房地产市场深度展望与分析',
    category: 'Market Trends',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    readTime: '4 min read',
    readTimeZh: '阅读需要4分钟',
    date: 'June 05, 2026',
    dateZh: '2026年6月5日',
    summary: 'An executive analysis of MRT 3 loop lines, TRX financial hub impact, and green building standard transitions in Malaysia.',
    summaryZh: '权威解析地铁环状三号线（MRT 3）、敦拉萨金融中心辐射圈以及绿色低碳建筑标准对大马房价的助推作用。',
    content: 'The real estate sector in Kuala Lumpur is undergoing a substantial transformation in 2026, driven by high-tech infrastructure expansions and sustainability initiatives. The completion of major MRT Line 3 circles and integrated commercial hubs like Tun Razak Exchange (TRX) has created brand-new high-value pockets. Prices are stabilizing, presenting excellent entry points for long-term capital appreciation. Multi-functional properties incorporating smart-home technology and eco-friendly green certifications are outperforming standard high-rises. Experts anticipate consistent capital growth across premium transit-oriented developments due to ongoing talent inflows and corporate headquarters relocating to the capital city.',
    contentZh: '2026年吉隆坡房地产市场正迎来结构性转型，主要受高科技基建扩建和绿色环保倡议所驱动。随着地铁三号线（MRT 3）的逐步完善和敦拉萨（TRX）等金融区崛起，高溢价的核心地段已见雏形。当前楼价走势稳健，为长期资本增值提供了极佳的入市时机。配备智能家居及绿色认证的综合型豪华住宅正逐渐超越普通高层公寓，成为高净值人群的追捧对象。'
  },
  {
    id: 'guide-mm2h-visa-6',
    title: 'The Revamped MM2H Visa Program: Fast-Tracking Your Property Journey',
    titleZh: '全新改版第二家园（MM2H）签证政策：助力外籍置业更顺畅',
    category: 'Foreign Buyer',
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80',
    readTime: '5 min read',
    readTimeZh: '阅读需要5分钟',
    date: 'May 28, 2026',
    dateZh: '2026年5月28日',
    summary: 'A look at the platinum, gold, and silver MM2H tiers, their property purchase requirements, and exclusive residency rights.',
    summaryZh: '解读铂金、黄金、白银三档第二家园签证新政，包括对购房金额的要求以及所享有的专属长期居留特权。',
    content: 'The Malaysia My Second Home (MM2H) visa program remains an attractive pathway for foreigners looking to purchase premium property and reside in Southeast Asia long-term. Under revised MM2H guidelines, visa holders enjoy simplified banking procedures and fast-tracked mortgage evaluation channels. Although foreigners do not strictly need an MM2H visa to buy property in Malaysia, holding one grants access to exclusive residency permissions and potential stamp duty exemptions in select states. Properties in peaceful retirement-friendly areas like Penang, Johor Bahru, and suburban Selangor are highly favored by MM2H participants for their relaxed coastal lifestyle.',
    contentZh: '“马来西亚我的第二家园”（MM2H）长期居留计划，仍是外国人移居东南亚并购置优质房产的重要途径。在新规指引下，签证持有人在本地开设银行账户及申请房贷时，可享受更简化的流程。虽然买房本身不强制需要MM2H身份，但持有该签证能带来更长的免签停留期，甚至在特定州属享受印花税减免。槟城、新山和雪兰莪郊区因其宁静宜居的海岸及慢生活节奏，广受签证持有者增持。'
  },
  {
    id: 'guide-valuation-7',
    title: 'Understanding Professional Property Valuation & Securing Fair Pricing',
    titleZh: '揭秘专业房产估值逻辑：买家如何规避高溢价，确保价格公允',
    category: 'Investment',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
    readTime: '4 min read',
    readTimeZh: '阅读需要4分钟',
    date: 'May 15, 2026',
    dateZh: '2026年5月15日',
    summary: 'Learn how JPPH historical data, replacement costs, and capitalized rental models determine actual bank value in Malaysia.',
    summaryZh: '学习大马国家房产估值司（JPPH）成交数据、置换成本法与资本化租金模型如何决定银行最终批贷评级。',
    content: 'Accurately determining a property’s market value is critical before placing a booking deposit. In Malaysia, professional surveyors assess property valuation based on historical transaction prices from the National Property Information Centre (JPPH), prevailing rental yields, building age, and overall maintenance standards. When purchasing under-construction developer projects, the asking price is often supported by early-bird discount structures and interest absorption schemes. For sub-sale properties, getting a preliminary bank valuation check prevents buyers from paying a heavy premium above what local banks are willing to finance, ensuring your capital is protected.',
    contentZh: '在支付订金锁房之前，客观评估物业的市场公允价值至关重要。在大马，估价师主要参考国家产估司（JPPH）的历史成交记录，并结合租金回报、楼龄及物业维护水平进行评估。购买期房时，开发商标价通常包含了早鸟折扣或免息优惠；而购买二手房时，提前进行银行估价预审可以避免因高溢价购房而需要补足大笔现金差价，规避财务风险。'
  },
  {
    id: 'guide-construction-vs-subsale-8',
    title: 'Under-Construction Developer Projects vs. Completed Ready Sub-Sale Homes',
    titleZh: '新开发商期房 vs 二手房：自住买家该如何进行最优抉择',
    category: 'Own Stay',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    readTime: '6 min read',
    readTimeZh: '阅读需要6分钟',
    date: 'May 02, 2026',
    dateZh: '2026年5月2日',
    summary: 'A comprehensive pros and cons comparison of progressive payments, legal rebates, renovation costs, and immediate occupancy.',
    summaryZh: '全方位对比期房递增式付款、开发商律师费减免与二手现房即买即住、真实社区环境及折旧改造开销的利弊。',
    content: 'First-time own-stay home buyers often face a difficult choice: buying brand-new under-construction properties from developer launches or choosing completed sub-sale homes. Developer projects are highly appealing due to modern design, brand-new facilities, developer rebates, free legal fees, and progressive payment schedules that reduce early-stage financial pressure. However, buyers must wait several years for construction completion. Completed sub-sale properties offer immediate occupancy, zero construction risk, and exact visual verification of the neighborhood, but they require substantial upfront capital for downpayments, stamp duties, legal fees, and immediate renovation or repair costs.',
    contentZh: '首套自住房买家常在“期房项目”与“二手现房”之间摇摆不定。新期房的吸引力在于现代化的设计、完备的设施，以及开发商提供的回扣、免印花税/律师费和按工程进度付款，财务压力较小，但缺点是需要等待数年方可落成交楼。二手现房则支持即买即住，无烂尾风险，社区面貌真实可见，但缺点是首付款、印花税和装修翻新等先期现金需求较高。'
  },
  {
    id: 'guide-eco-smart-homes-9',
    title: 'The Greening of Malaysian Real Estate: Rise of Eco-Friendly Smart Homes',
    titleZh: '大马房产绿色风潮：节能环保与智能家居如何为资产增值保值',
    category: 'Market Trends',
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80',
    readTime: '5 min read',
    readTimeZh: '阅读需要5分钟',
    date: 'April 20, 2026',
    dateZh: '2026年4月20日',
    summary: 'Discover how Green Building Index (GBI) ratings, EV chargers, and automated grids drive higher capital appreciation premiums.',
    summaryZh: '了解绿色建筑认证（GBI）、电动车专属充电桩及智能电网如何全面优化日常开支并提升二手房转让溢价率。',
    content: 'Sustainable housing is transitioning from a premium luxury niche to a mainstream residential market standard across Malaysia. Modern home buyers are actively prioritizing properties that carry Green Building Index (GBI) certifications. These eco-friendly developments utilize rainwater harvesting systems, solar-paneled common facilities, energy-efficient LED configurations, and dual-layered insulated glass to reduce carbon footprints and lower monthly utility costs. Furthermore, developers are integrating smart-home infrastructure, such as automated climate control, smart security sensors, and localized electric vehicle (EV) charging stations, to future-proof residential structures and drive higher long-term resale premiums.',
    contentZh: '绿色可持续住宅正从大马的奢侈小众选项，演变为主流住宅市场的新标杆。现代买家愈发注重拥有绿色建筑指数（GBI）认证的低碳住宅。这些环保项目通过雨水收集系统、公区太阳能发电、高效LED节能照明及双层中空隔热玻璃，大幅度降低公共开支与家庭电费。同时，开发商也在逐步引入智能家居系统（智能防盗、自动温控）和专属电动车（EV）充电桩，让住宅资产在未来更具流通与保值力。'
  }
];

export const MOCK_FAQS: FAQItem[] = [
  {
    id: 'faq-foreigner',
    question: 'Can foreigners buy property in Malaysia?',
    questionZh: '外籍买家可以在马来西亚买房吗？',
    answer: 'Yes! Foreigners can legally purchase properties under freehold or leasehold titles. However, they must adhere to State-specified minimum price thresholds (e.g., RM 1 million in Kuala Lumpur, RM 1 million in Selangor for developer projects, etc.) to ensure local housing markets remain balanced.',
    answerZh: '可以！外籍人士可以合法购买马来西亚的永久产权或租赁产权房产。但必须遵守各州规定的最低购房门槛（例如，吉隆坡为100万令吉，雪兰莪州开发商项目为100万令吉等），以维护本地住房市场的平衡。',
    category: 'Foreign Buyer',
    categoryZh: '外籍买家'
  },
  {
    id: 'faq-downpayment',
    question: 'What is the minimum downpayment required for a home?',
    questionZh: '在马来西亚买房首付比例是多少？',
    answer: 'For a first or second residential property, the standard bank margin of finance is 90%, requiring a minimum 10% cash downpayment. For third property ownership, the financing limit falls to 70%, requiring a 30% downpayment. Real estate taxes, lawyer fees, and stamp duty add roughly 3-5% in ancillary costs.',
    answerZh: '对于第一套或第二套住宅，标准的银行贷款成数高达90%，即需要至少10%的现金首付。对于第三套房产，贷款成数降至70%，首付要求为30%。此外，契税、律师费和印花税等其他附加费用约占房产价格的3%至5%。',
    category: 'Morgage',
    categoryZh: '按揭贷款'
  },
  {
    id: 'faq-difference',
    question: 'What is the main difference between Freehold and Leasehold properties?',
    questionZh: '永久产权（Freehold）和租赁产权（Leasehold）的主要区别是什么？',
    answer: 'Freehold property grants absolute indefinite ownership of the land. Leasehold titles grant tenancy ownership from the state governate for a specified period (typically 99 years). Leasehold properties are often priced slightly lower initially but may experience stagnating prices as the lease term approaches maturity under 40 years, unless extended.',
    answerZh: '永久产权房产赋予买家对土地的绝对且无限期的所有权。租赁产权则表示在规定期限内（通常为99年）拥有州政府转让的使用权。租赁产权项目初期的定价通常略低，但随着租期剩余不足40年，除非申请延期，否则其增值空间可能会放缓。',
    category: 'Property Type',
    categoryZh: '产权类型'
  },
  {
    id: 'faq-airbnb-friendly',
    question: 'How can I check if a condominium is Airbnb-friendly?',
    questionZh: '如何确认一个公寓项目是否支持经营民宿/Airbnb？',
    answer: 'Always look for projects that are built on commercial titles or explicitly classified as serviced apartments with commercial operations enabled in their joint-management body (JMB) bylaws. Projects designed with dual-key layouts and distinct concierge areas are optimized for short-term occupants.',
    answerZh: '务必选择建在商业土地上或明确分类为服务式公寓的项目，且其联合管理委员会（JMB）章程中明确允许商业民宿运营。拥有双钥匙（Dual-Key）户型和独立礼宾大堂等专门设计的产品最适合民宿出租。',
    category: 'Investment',
    categoryZh: '房产投资'
  }
  ,
  {
    id: 'faq-buying-costs',
    question: 'What extra costs should I budget for when buying a new launch in Malaysia?',
    questionZh: '在马来西亚买新楼盘，除了房价还要准备哪些费用？',
    answer: 'Beyond the downpayment, budget for: (1) stamp duty on the Memorandum of Transfer, charged on a sliding scale of 1% on the first RM 100,000, 2% on RM 100,001 to RM 500,000, 3% on RM 500,001 to RM 1,000,000 and 4% above that; (2) legal fees for the Sale & Purchase Agreement and for the loan agreement, both on a scale set by the Solicitors Remuneration Order; (3) stamp duty on the loan agreement at 0.5% of the loan amount; and (4) a valuation fee if the bank requires one. Some developer packages cover part of these fees. Always ask for the full breakdown in writing before signing.',
    answerZh: '除了首付，还要预算：(1) 产权转让（MOT）印花税，按阶梯计算：首 10 万令吉 1%，10 万零 1 至 50 万令吉 2%，50 万零 1 至 100 万令吉 3%，超过 100 万令吉 4%；(2) 买卖合约和贷款合约的律师费，按律师收费法令的费率计算；(3) 贷款合约印花税，为贷款额的 0.5%；(4) 银行要求时的估价费。部分发展商配套会承担其中一些费用，签约前务必索取书面的完整费用明细。',
    category: 'Costs & Fees',
    categoryZh: '费用与税务'
  },
  {
    id: 'faq-mot',
    question: 'What is the Memorandum of Transfer (MOT) and when do I pay its stamp duty?',
    questionZh: '什么是产权转让书（MOT）？印花税什么时候付？',
    answer: 'The Memorandum of Transfer is the document that registers the property title in your name. For a new launch, it is signed and stamped when the individual or strata title is issued, which is often around or after vacant possession rather than at the time you sign the Sale & Purchase Agreement. Until the strata title is ready, ownership is recorded through a Deed of Assignment. Your lawyer will notify you when the MOT stamp duty is due, so keep that amount set aside even after you have moved in.',
    answerZh: '产权转让书（MOT）是把房产地契登记到你名下的文件。新楼盘通常在个别地契或分层地契发出后才签署和盖印，时间往往在交楼前后，而不是签买卖合约的时候。在分层地契发出前，产权以转让契据（Deed of Assignment）记录。律师会通知你何时缴付 MOT 印花税，所以即使已经入住，也要预留这笔钱。',
    category: 'Buying Process',
    categoryZh: '购买流程'
  },
  {
    id: 'faq-hda',
    question: 'What does it mean when a project is sold under the Housing Development Act (HDA)?',
    questionZh: '楼盘受房屋发展法令（HDA）保护是什么意思？',
    answer: 'The Housing Development (Control and Licensing) Act 1966 governs licensed housing developers in Peninsular Malaysia. Under HDA the developer must hold a valid developer licence and advertising permit, use the standard Schedule G (landed) or Schedule H (strata) Sale & Purchase Agreement, keep buyers’ money in a Housing Development Account, deliver vacant possession within 24 months (landed) or 36 months (strata) of the agreement date, pay liquidated damages of 10% per annum on late delivery, and honour a 24-month defect liability period. Serviced apartments on commercial land are covered when the developer sells them under HDA, which is stated in the agreement, so check this for each project.',
    answerZh: '1966 年房屋发展（管制与执照）法令规管西马的持牌房屋发展商。受 HDA 约束的发展商必须持有有效的发展商执照和广告准证，使用标准的 Schedule G（有地房产）或 Schedule H（分层房产）买卖合约，把买家的款项存入房屋发展账户，在合约日期起 24 个月（有地）或 36 个月（分层）内交楼，逾期按每年 10% 支付赔偿金，并提供 24 个月的缺陷保修期。建在商业地契上的服务式公寓，如果发展商以 HDA 方式出售，也同样受保护，这会写在合约里，每个楼盘都要确认。',
    category: 'Buying Process',
    categoryZh: '购买流程'
  },
  {
    id: 'faq-progressive-payment',
    question: 'How do payments work while a new launch is still under construction?',
    questionZh: '楼盘还在建的时候，房贷是怎么付的？',
    answer: 'New launches use a progressive payment schedule fixed by the Sale & Purchase Agreement (Schedule H for strata projects). You pay the first 10% on signing, and the remaining 90% is released by your bank in stages as the architect certifies each construction milestone, such as foundation, structural frame, walls, services and completion. During construction you normally pay only interest on the amount the bank has released so far, and full monthly instalments begin after the final disbursement. Some developer packages vary this, so confirm the schedule for the project you are considering.',
    answerZh: '新楼盘采用买卖合约规定的分期付款进度（分层项目用 Schedule H）。签约时付首 10%，其余 90% 由银行按建筑师签发的各个工程阶段证明分批放款，例如地基、主体结构、墙体、水电设施和竣工。建筑期间通常只需支付银行已放款部分的利息，全额月供在最后一笔放款后才开始。部分发展商配套会有所不同，请以你考虑的楼盘为准。',
    category: 'Morgage',
    categoryZh: '按揭贷款'
  },
  {
    id: 'faq-completion-time',
    question: 'How long does a new launch take to complete, and what if it is late?',
    questionZh: '新楼盘要多久才交楼？迟交怎么办？',
    answer: 'Under the standard HDA agreement the developer must deliver vacant possession within 36 months for strata projects (condominiums and serviced apartments) or 24 months for landed homes, counted from the date of the Sale & Purchase Agreement. Many projects hand over earlier than the deadline. Each project page on propertyportal.my shows the completion status and expected completion year from the developer. If delivery is late, the buyer is entitled to liquidated ascertained damages calculated at 10% per annum of the purchase price for the delayed period.',
    answerZh: '按照标准 HDA 合约，发展商必须在买卖合约日期起 36 个月内（公寓和服务式公寓等分层项目）或 24 个月内（有地房产）交楼。很多楼盘会提前交付。propertyportal.my 每个楼盘页面都列出发展商提供的完工状态和预计完工年份。如果逾期交楼，买家有权按房价每年 10% 的比例获得逾期赔偿金。',
    category: 'Buying Process',
    categoryZh: '购买流程'
  },
  {
    id: 'faq-maintenance-fee',
    question: 'How much are the maintenance fee and sinking fund for a condominium?',
    questionZh: '公寓的管理费和维修储备金大概多少？',
    answer: 'Maintenance fees are charged per square foot of your unit every month and pay for security, cleaning, lifts, pools and other shared facilities. In the Klang Valley most new condominiums and serviced apartments charge roughly RM 0.25 to RM 0.45 per square foot, with lower-density or facility-rich projects at the higher end. The sinking fund, usually 10% of the maintenance fee, is collected on top for major future repairs. Each project page on propertyportal.my lists the developer’s stated maintenance fee, so you can compare the monthly cost between projects before you commit.',
    answerZh: '管理费按单位面积每月计算，用于保安、清洁、电梯、泳池等公共设施。巴生谷大多数新公寓和服务式公寓的管理费约为每平方英尺 RM 0.25 至 RM 0.45，低密度或设施较多的项目会偏高。维修储备金（sinking fund）通常是管理费的 10%，另外收取，用于日后的大型维修。propertyportal.my 每个楼盘页面都列出发展商公布的管理费，方便你在决定前比较每月成本。',
    category: 'Costs & Fees',
    categoryZh: '费用与税务'
  },
  {
    id: 'faq-bumi-units',
    question: 'What are Bumiputera units, and can a non-Bumiputera buyer purchase one?',
    questionZh: '什么是土著单位？非土著买家可以买吗？',
    answer: 'Every state requires developers to reserve a share of units in a project for Bumiputera buyers, commonly around 30%, and to sell them at a discount set by that state. These units are marked as Bumi lots in the developer’s price list. A non-Bumiputera buyer can only purchase a Bumi lot after the developer obtains a release from the state authority, which usually happens later in the sales cycle if the units remain unsold. If you are not Bumiputera, choose from the open units, and if you are, ask for the Bumi price list to see the discount you are entitled to.',
    answerZh: '各州都要求发展商在每个楼盘中保留一定比例的单位给土著买家，通常约 30%，并按该州规定的折扣出售。这些单位在发展商价单上标为土著单位（Bumi lot）。非土著买家只有在发展商向州政府申请解除限制后才能购买，这通常在销售后期、单位仍未售出时才会发生。如果你不是土著，请从公开单位中选择；如果你是土著，记得索取土著价单，了解你可享的折扣。',
    category: 'Property Type',
    categoryZh: '产权类型'
  },
  {
    id: 'faq-check-developer',
    question: 'How do I check that a developer and its project are legitimate?',
    questionZh: '怎么确认发展商和楼盘是合法可靠的？',
    answer: 'Ask the sales team for the developer licence number and the advertising permit (APDL) number, then verify both on the Ministry of Housing and Local Government (KPKT) portal, which also lists blacklisted developers and abandoned projects. Confirm that the land is not charged in a way that blocks the sale, that the project is sold under the HDA with the standard agreement, and look at the developer’s completed projects and delivery track record. Only pay booking money to the developer’s account, and make sure every promise about price or fittings is written into the agreement.',
    answerZh: '向销售人员索取发展商执照号码和广告准证（APDL）号码，然后到房屋及地方政府部（KPKT）的网站核实，该网站也会列出黑名单发展商和被弃置的项目。确认土地没有妨碍出售的抵押，楼盘是以 HDA 标准合约出售，并查看发展商已完成的项目和过往交楼记录。订金只付给发展商的账户，而且关于价格或配置的任何承诺都必须写进合约。',
    category: 'Buying Process',
    categoryZh: '购买流程'
  }
];
