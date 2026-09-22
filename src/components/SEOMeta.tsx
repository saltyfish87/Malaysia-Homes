import React, { useEffect } from 'react';
import { MOCK_PROJECTS } from '../constants/mockData';

export interface Project {
  id: string;
  name: string;
  developer: string;
  state: string;
  area: string;
  priceMin: number;
  priceMax: number;
  completionYear: number;
  propertyType: string;
  tenure: string;
  sizeMin: number;
  sizeMax: number;
  bedrooms: number;
  latitude: number;
  longitude: number;
  image?: string;
  gallery?: string[];
  description?: string;
  investmentScore?: number;
}

interface SEOMetaProps {
  project: Project | null;
  tab: string;
  lang: 'en' | 'zh';
  projects?: Project[];
  area?: string; // selected area on the residences tab (matches the server's /area/<slug> pages)
}

export default function SEOMeta({ project, tab, lang, projects = [], area = '' }: SEOMetaProps) {
  const areaActive = !project && tab === 'residences' && !!area && area !== 'All';
  const areaSlug = area.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const areaState = (() => { const hit = projects.find(p => (p.area || '').toLowerCase().includes(area.toLowerCase())); return hit?.state || 'Malaysia'; })();
  useEffect(() => {
    // 1. DYNAMIC TITLE GENERATION WITH GLOBAL APPEAL
    let title = 'Malaysia Homes | New Launch Condo & Landed Property Portal | propertyportal.my';
    let description = 'Discover and compare top premium property developments, landed parkhomes, and luxury low-density condos across Kwasa Damansara, Petaling Jaya, Subang Jaya, Puchong, Bukit Jalil, Bangsar, KL City Centre, and Johor Bahru on propertyportal.my. Real-time insights, expert analysis, and direct WhatsApp hotlines.';
    let baseKeywords = 'propertyportal, propertyportal.my, Malaysia homes, new condo PJ, Kwasa Damansara property, Zenia Damansara, Amika Subang Jaya, Anya Puchong, Aricia Chan Sow Lin, Aster Hill Sri Petaling, Atera Petaling Jaya, Aurum Business Centre, Avantro Bukit Jalil, Ayanna Bukit Jalil, Bangsar Hill Park, CloutHaus, Core Residence TRX, GenStarz, Luminar Subang, M Aspira, Maple Residences OUG, OAKA Residences, One Seputeh, Orion Residence, Park Green Pavilion, Quaver Residence, Radium Arena, Riverville 2, Tria Seputeh, Tujuh Residences, Vox Sentul, Wyn Puchong, Ren Residence, Aras OUG, The Vividz, Khaya Residence, Phoeniz Suites, Branniganz, Alora Residence, Loop City Puchong, The Aldenz Damansara, Parkside Damansara, ForestHill Residence Damansara, Amaya Residence Damansara, Grand Damansara, Stellar Damansara, Seresta Damansara, Livista Damansara, The Lines Damansara, Pinnacle Ara Damansara, Hampton Damansara, D\'Tessera Damansara, Amara Residence Petaling Jaya, Linari Kwasa Damansara, Mahogany Residences Kwasa Damansara, Panorama Residences Kelana Jaya, Sunway d\'hill Residences, D\'Evia Kwasa, ARRA Petaling Jaya, Paradigm Mall PJ, Kwasa Damansara City Center, The Kingswoodz Bukit Jalil, Queenswoodz Bukit Jalil, KL Wellness City, Veladaz Bukit Jalil, Johor CIQ Causewayz, R&F New Casa Suites, GEN SPHERE, GEN RISE, CIQ, Calia Residences, Bukit Chagar RTS Station, M Grand Minori, The Address Maxim, THE ARDEN, Skyline One Sentosa, Paragon Signatures Suite, The Asteriaz Exsim, NADI Residences, MB World Bay, Paragon Gateway, buy condo Selangor, property comparison tool, house price Kuala Lumpur, real estate investment Malaysia, KL City Centre city view, residential parkhomes, buy property in malaysia for foreigners, mm2h malaysia my second home property, invest in kuala lumpur real estate, best luxury condo kuala lumpur, klcc properties for sale, property portal malaysia, kuala lumpur property investment yield, singaporean buying house in malaysia, china buyers property malaysia, expatriate property guide malaysia, luxury serviced suites kuala lumpur';
    let keywords = baseKeywords;

    const activeProjectsList = (projects && projects.length > 0) ? projects : MOCK_PROJECTS;

    // Dynamically append all listing names and search intent variations
    if (activeProjectsList && activeProjectsList.length > 0) {
      const dynamicProjectTerms = activeProjectsList.map(p => 
        `${p.name}, ${p.name} price, ${p.name} floor plan, ${p.name} layout, ${p.name} developer, ${p.name} brochure, ${p.name} review, ${p.name} ${p.area}, ${p.name} ${p.state}, ${p.developer} ${p.name}, buy ${p.name}, invest in ${p.name}, ${p.name} sales gallery, ${p.name} show unit, ${p.name} price list`
      ).join(', ');
      keywords = `${dynamicProjectTerms}, ${baseKeywords}`;
    }

    if (project) {
      const pName = project.name;
      const pArea = project.area;
      const pDev = project.developer;
      const pType = project.propertyType;
      const pPrice = project.priceMin ? `RM ${project.priceMin.toLocaleString()}` : '';

      if (lang === 'en') {
        title = `${pName} ${pArea} | Developer Price, Layout Floor Plan, Brochure & Review | propertyportal.my`;
        description = `${pName} by ${pDev} in ${pArea}, ${project.state}. Official developer price list from ${pPrice}, ${project.tenure} ${pType} with ${project.sizeMin}-${project.sizeMax} sqft layouts (${project.bedrooms}+ beds). View floor plans, MRT connectivity, and schedule a sales gallery appointment on propertyportal.my.`;
      } else {
        title = `${pName} ${pArea} | 官方开发商售价、户型图、样板房预约与评测 | propertyportal.my`;
        description = `${pDev} 打造的 ${pName}（位于 ${pArea}，${project.state}）。官方价格从 ${pPrice} 起，${project.tenure} ${pType}，户型面积 ${project.sizeMin}-${project.sizeMax} 平方英尺。查看户型规划、公共交通配套并在 propertyportal.my 预约看房。`;
      }

      keywords = `${pName}, ${pName} price, ${pName} floor plan, ${pName} layout, ${pName} developer, ${pName} brochure, ${pName} review, ${pName} ${pArea}, ${pDev} ${pName}, buy ${pName}, ${pArea} property, ${pName} pricing, ${pName} master plan, ${pName} show gallery, ${pName} sales gallery, foreigner buy ${pName}, ${pName} investment yield, ${pName} chan sow lin, ${pName} mrt, ${pName} trx, ${keywords}`;
    } else if (tab === 'compare') {
      title = lang === 'en' 
        ? 'Compare Properties & New Launch Condominiums | Malaysia Homes'
        : '对比马来西亚新楼盘与优质公寓 | 马来西亚房产网';
      description = lang === 'en'
        ? 'Use our advanced multi-property comparison tool to compare pricing, layouts, developer track records, tenure, and location scores for top properties in Kuala Lumpur, Selangor, and Johor.'
        : '使用我们先进的多房产对比工具，对比吉隆坡、雪兰莪及柔佛各大楼盘的价格、户型、开发商业绩、产权年限及投资评分。';
    } else if (tab === 'guide') {
      title = lang === 'en'
        ? 'Malaysia Real Estate Buying Guide & Investment Insights'
        : '马来西亚置业指南、购房流程与投资分析';
      description = lang === 'en'
        ? 'The ultimate guide to buying residential property in Malaysia. Learn about RPGT, progressive billing, stamp duty exemptions, and critical investment strategies.'
        : '在马来西亚购买住宅房产的终极指南。全面解析房产增值税 (RPGT)、渐进式付款、印花税减免及核心投资策略。';
    } else if (areaActive) {
      const n = projects.filter(p => (p.area || '').toLowerCase().includes(area.toLowerCase())).length;
      title = `New Launch Projects in ${area}, ${areaState} | Developer Price, Floor Plans | propertyportal.my`;
      description = `${n} new launch project${n === 1 ? '' : 's'} in ${area}, ${areaState}. Developer prices, layouts, completion dates and sales gallery appointments on propertyportal.my.`;
    } else if (tab === 'residences') {
      title = lang === 'en'
        ? 'All Residences & New Property Launches in Malaysia | propertyportal.my'
        : '所有新楼盘与优质住宅列表 | 马来西亚房产网';
      description = lang === 'en'
        ? 'Explore our complete directory of luxury condominiums, serviced apartments, and landed parkhomes across Selangor, Kuala Lumpur, and Johor.'
        : '浏览我们在雪兰莪、吉隆坡和柔佛的全部豪华公寓、服务式公寓和排屋别墅完整目录。';
    } else if (tab === 'map') {
      title = lang === 'en'
        ? 'Interactive Property Map Directory | Kuala Lumpur & Selangor Real Estate'
        : '互动式房产地图目录 | 吉隆坡与雪兰莪房产网';
      description = lang === 'en'
        ? 'Explore properties on an interactive geographic map across Kwasa Damansara, Petaling Jaya, Subang Jaya, Puchong, Bukit Jalil, KL City Centre, and Johor.'
        : '在互动地图上探索 Kwasa Damansara、Petaling Jaya、Subang Jaya、Puchong、Bukit Jalil、KL City Centre 和柔佛的精选楼盘。';
    } else if (tab === 'calculators') {
      title = lang === 'en'
        ? 'Malaysia Home Loan & Mortgage Calculator | Stamp Duty & RPGT'
        : '马来西亚房屋贷款与房贷计算器 | 印花税与房产税';
      description = lang === 'en'
        ? 'Calculate monthly mortgage repayments, progressive billing interest, legal fees, stamp duty, and RPGT for buying property in Malaysia.'
        : '计算在马来西亚购房的每月房贷还款额、渐进式利息、律师费、印花税及房产增值税。';
    } else if (tab === 'admin') {
      title = 'Property CRM & Admin Sync Dashboard | Malaysia Homes';
      description = 'Secure administrator interface for managing active listings, syncing with live Google Sheets database, and viewing captured client hotleads.';
    }

    // Update document title
    document.title = title;

    // Helper for Meta Tag Injection
    const updateMetaTag = (name: string, value: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', value);
    };

    // Standard SEO & International Distribution Tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    updateMetaTag('distribution', 'global');
    updateMetaTag('coverage', 'Worldwide');
    updateMetaTag('audience', 'all');
    updateMetaTag('googlebot', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    updateMetaTag('bingbot', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    updateMetaTag('theme-color', '#1C1917');
    updateMetaTag('apple-mobile-web-app-title', 'Malaysia Homes');

    // AI Crawlers & LLM Indexing Meta Permissions
    updateMetaTag('chatgpt-plugin', 'allowed');
    updateMetaTag('GPTBot', 'index, follow');
    updateMetaTag('ClaudeBot', 'index, follow');
    updateMetaTag('PerplexityBot', 'index, follow');

    // Dynamic GEO-Targeting Meta Tags
    const regionCode = project ? (project.state.toLowerCase().includes('kuala lumpur') ? 'MY-14' : 'MY-10') : 'MY-14;MY-10';
    const placeName = project ? `${project.area}, ${project.state}, Malaysia` : 'Kuala Lumpur, Selangor, Malaysia';
    const positionCoords = project ? `${project.latitude};${project.longitude}` : '3.1390;101.6869';
    const icbmCoords = project ? `${project.latitude}, ${project.longitude}` : '3.1390, 101.6869';

    updateMetaTag('geo.region', regionCode);
    updateMetaTag('geo.placename', placeName);
    updateMetaTag('geo.position', positionCoords);
    updateMetaTag('ICBM', icbmCoords);

    // Dynamic Canonical URL Injection
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    const domain = 'https://www.propertyportal.my';
    let canonicalUrl = domain + '/';
    if (project) {
      canonicalUrl = `${domain}/project/${project.id}`;
    } else if (areaActive) {
      canonicalUrl = `${domain}/area/${areaSlug}`;
    } else if (tab && tab !== 'home') {
      canonicalUrl = `${domain}/${tab}`;
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Inject Multilingual hreflang alternate links
    const updateLinkTag = (rel: string, hreflang: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"][hreflang="${hreflang}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        element.setAttribute('hreflang', hreflang);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // hreflang tags removed: there is no separate language URL, so alternates would only point back to this page.

    // Google Site Verification
    const gVerification = (import.meta as any).env?.VITE_GOOGLE_VERIFICATION || 'OtvCDokPku59DVDdwVyIkzsYLFiRlNtEq0s9ANEcpyo';
    updateMetaTag('google-site-verification', gVerification);

    // OpenGraph / Facebook Tags
    updateMetaTag('og:site_name', 'Malaysia Homes | propertyportal.my', true);
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:type', 'website', true);
    updateMetaTag('og:url', canonicalUrl, true);
    updateMetaTag('og:locale', lang === 'zh' ? 'zh_CN' : 'en_US', true);
    updateMetaTag('og:locale:alternate', lang === 'zh' ? 'en_US' : 'zh_CN', true);

    if (project && project.image) {
      updateMetaTag('og:image', project.image, true);
      updateMetaTag('og:image:width', '1200', true);
      updateMetaTag('og:image:height', '675', true);
      updateMetaTag('og:image:alt', `${project.name} ${project.area} ${project.developer}`, true);
    } else {
      const defaultImg = `${domain}/og_preview.jpg`;
      updateMetaTag('og:image', defaultImg, true);
      updateMetaTag('og:image:width', '1200', true);
      updateMetaTag('og:image:height', '675', true);
      updateMetaTag('og:image:alt', 'Malaysia Homes Property Portal', true);
    }

    // Twitter Tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    if (project) {
      updateMetaTag('twitter:label1', 'Developer Price');
      updateMetaTag('twitter:data1', `RM ${project.priceMin?.toLocaleString() || 'Contact'}`);
      updateMetaTag('twitter:label2', 'Location');
      updateMetaTag('twitter:data2', `${project.area}, ${project.state}`);
    }

    // 2. SCHEMA.ORG RICH SNIPPETS STRUCTURED DATA (JSON-LD)
    const jsonLdGraph: any[] = [];

    // A. WebSite & SearchAction Schema (Google Sitelinks Searchbox Specification)
    jsonLdGraph.push({
      '@type': 'WebSite',
      '@id': `${domain}/#website`,
      'url': domain,
      'name': 'Malaysia Homes',
      'alternateName': 'propertyportal.my',
      'description': 'Malaysia New Launch Condominiums and Landed Property Portal',
      'inLanguage': ['en', 'zh-Hans'],
      'potentialAction': {
        '@type': 'SearchAction',
        'target': {
          '@type': 'EntryPoint',
          'urlTemplate': `${domain}/residences?search={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    });

    // B. Organization / RealEstateAgent Schema
    jsonLdGraph.push({
      '@type': 'RealEstateAgent',
      '@id': `${domain}/#agency`,
      'name': 'Malaysia Homes',
      'url': domain,
      'logo': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=300&q=80',
      'image': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'description': description,
      'telephone': '+60108278932',
      'sameAs': ['https://www.youtube.com/@shyanyee', 'https://www.instagram.com/shyanyee/', 'https://www.facebook.com/shyanyeeconsultant/', 'https://wa.me/60108278932'],
      'priceRange': 'MYR 300,000 - MYR 5,000,000',
      'currenciesAccepted': 'MYR, SGD, USD, CNY, HKD, AUD, GBP, EUR',
      'openingHours': 'Mo-Su 09:00-21:00',
      'contactPoint': {
        '@type': 'ContactPoint',
        'telephone': '+60108278932',
        'contactType': 'sales',
        'areaServed': 'MY',
        'availableLanguage': ['English', 'Chinese', 'Malay']
      },
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': 'Kuala Lumpur',
        'addressRegion': 'Wilayah Persekutuan',
        'addressCountry': 'MY'
      },
      'areaServed': ['Kwasa Damansara', 'Petaling Jaya', 'Subang Jaya', 'Puchong', 'Bukit Jalil', 'Bangsar', 'KL City Centre', 'Johor Bahru', 'Selangor', 'Kuala Lumpur', 'Johor'],
      'knowsAbout': activeProjectsList.map(p => p.name)
    });

    // C. BreadcrumbList Schema
    const breadcrumbList = [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': `${domain}/`
      }
    ];

    if (project) {
      breadcrumbList.push({
        '@type': 'ListItem',
        'position': 2,
        'name': 'Properties',
        'item': `${domain}/residences`
      });
      breadcrumbList.push({
        '@type': 'ListItem',
        'position': 3,
        'name': project.name,
        'item': `${domain}/project/${project.id}`
      });
    } else if (tab && tab !== 'home') {
      const tabNames: Record<string, string> = {
        compare: 'Compare Properties',
        guide: 'Buying Guide',
        residences: 'Residences',
        map: 'Property Map',
        calculators: 'Calculators',
        favorites: 'Saved Favorites',
        admin: 'Admin Dashboard'
      };
      breadcrumbList.push({
        '@type': 'ListItem',
        'position': 2,
        'name': tabNames[tab] || tab,
        'item': `${domain}/${tab}`
      });
    }

    jsonLdGraph.push({
      '@type': 'BreadcrumbList',
      '@id': `${canonicalUrl}#breadcrumb`,
      'itemListElement': breadcrumbList
    });

    // D. Item-Specific Schema (Single Property vs Real Estate Offer Collection)
    if (project) {
      // Single property/residence schema
      jsonLdGraph.push({
        '@type': project.propertyType === 'Landed' ? ['SingleFamilyResidence', 'Product'] : ['ApartmentComplex', 'Product'],
        '@id': `${canonicalUrl}#project`,
        'name': `${project.name} ${project.area}`,
        'alternateName': `${project.name} by ${project.developer}`,
        'description': project.description || description,
        'url': canonicalUrl,
        'image': project.gallery && project.gallery.length > 0 ? project.gallery : [project.image || ''],
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': `${project.area}, ${project.state}`,
          'addressLocality': project.area,
          'addressRegion': project.state,
          'addressCountry': 'MY'
        },
        'geo': {
          '@type': 'GeoCoordinates',
          'latitude': project.latitude,
          'longitude': project.longitude
        },
        'offers': {
          '@type': 'AggregateOffer',
          'priceCurrency': 'MYR',
          'lowPrice': project.priceMin,
          'highPrice': project.priceMax,
          'offerCount': '1',
          'priceValuedAs': 'MYR',
          'availability': 'https://schema.org/InStock',
          'url': canonicalUrl,
          'seller': {
            '@type': 'RealEstateAgent',
            'name': 'Malaysia Homes',
            'telephone': '+60108278932'
          }
        },
        'numberOfRooms': project.bedrooms,
        'priceRange': `MYR ${project.priceMin.toLocaleString()} - MYR ${project.priceMax.toLocaleString()}`,
        'currenciesAccepted': 'MYR, SGD, USD, CNY, HKD, AUD, GBP, EUR',
        'amenityFeature': [
          {
            '@type': 'LocationFeatureSpecification',
            'name': 'Tenure',
            'value': project.tenure
          },
          {
            '@type': 'LocationFeatureSpecification',
            'name': 'Developer',
            'value': project.developer
          },
          {
            '@type': 'LocationFeatureSpecification',
            'name': 'Area',
            'value': project.area
          },
          {
            '@type': 'LocationFeatureSpecification',
            'name': 'Completion Year',
            'value': String(project.completionYear)
          },
          {
            '@type': 'LocationFeatureSpecification',
            'name': 'Property Type',
            'value': project.propertyType
          },
          {
            '@type': 'LocationFeatureSpecification',
            'name': 'Built-Up Range',
            'value': `${project.sizeMin} sqft - ${project.sizeMax} sqft`
          }
        ]
      });

      // Project FAQ schema removed here: the questions were never shown on the page, which Google's FAQ policy does not allow.
      // A visible per-project FAQ (with matching schema) is added server-side in a later step.
    } else if (tab === 'guide') {
      // FAQPage Rich Snippet Schema for Buying Guide
      jsonLdGraph.push({
        '@type': 'FAQPage',
        '@id': `${canonicalUrl}#faq`,
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'Can foreigners buy property in Malaysia?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Yes, foreigners can buy property in Malaysia subject to minimum price thresholds set by state authorities (typically RM 1,000,000 in Kuala Lumpur and Selangor for most residential properties).'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is Real Property Gains Tax (RPGT) in Malaysia?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'RPGT is a tax levied on the net profit derived from the disposal of real property. For Malaysian citizens, RPGT is 30% in year 1-3, 20% in year 4, 15% in year 5, and 0% after 5 years.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What are the main costs when buying a property in Malaysia?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Main costs include stamp duty on Memorandum of Transfer (MOT), legal fees for Sales & Purchase Agreement (SPA), loan agreement legal fees and stamp duty, and valuation fees.'
            }
          }
        ]
      });
    }

    const fullSchemaMarkup = {
      '@context': 'https://schema.org',
      '@graph': jsonLdGraph
    };

    // Insert or update script tag
    let scriptTag = document.getElementById('seo-jsonld-schema');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'seo-jsonld-schema';
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(fullSchemaMarkup, null, 2);

    return () => {};
  }, [project, tab, lang, projects, area]);

  return null;
}
