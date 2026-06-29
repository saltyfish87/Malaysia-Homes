import React, { useEffect } from 'react';

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
}

export default function SEOMeta({ project, tab, lang, projects = [] }: SEOMetaProps) {
  useEffect(() => {
    // 1. DYNAMIC TITLE GENERATION
    let title = 'Malaysia Homes | New Condo & Landed Property Portal | malaysiahomes.my';
    let description = 'Discover and compare top premium property developments, landed parkhomes, and luxury low-density condos across Kwasa Damansara, Petaling Jaya, and Damansara on malaysiahomes.my. Real-time insights, expert analysis, and direct WhatsApp hotlines.';
    let keywords = 'malaysiahomes, malaysiahomes.my, Malaysia homes, new condo PJ, Kwasa Damansara property, Zenia Damansara, Atera Phase 2, D\'Tessera, buy condo Selangor, property comparison tool, house price Kuala Lumpur, real estate investment Malaysia, KLCC city view, residential parkhomes';

    if (project) {
      const pName = project.name;
      const pArea = project.area;
      const pDev = project.developer;
      const pType = project.propertyType;
      const pPrice = project.priceMin ? `RM ${project.priceMin.toLocaleString()}` : '';

      if (lang === 'en') {
        title = `${pName} Price, Location, Floor Plan & Review | ${pArea} ${pType}`;
        description = `Explore ${pName} by ${pDev} in ${pArea}, ${project.state}. Premium ${pType} starting from ${pPrice}. Review floor plans (${project.sizeMin}-${project.sizeMax} sqft), completion date (${project.completionYear}), tenure (${project.tenure}), and investment score of ${project.investmentScore}/10.`;
      } else {
        title = `${pName} 价格、位置、户型图与开发商信息 | ${pArea} 房产推荐`;
        description = `了解由著名开发商 ${pDev} 倾力打造的 ${pName}（位于 ${pArea}，${project.state}）。优质 ${pType} 起售价 ${pPrice}。查看户型规划 (${project.sizeMin}-${project.sizeMax} 平方英尺)、产权 (${project.tenure}) 及投资评分。`;
      }

      // Add project-specific high-traffic search terms
      keywords = `${pName}, ${pName} price, ${pName} floor plan, ${pName} developer, ${pName} review, ${pName} ${pArea}, ${pDev} ${pName}, buy ${pName}, ${pArea} property, ${keywords}`;
    } else if (tab === 'compare') {
      title = lang === 'en' 
        ? 'Compare Properties & New Launch Condominiums | Malaysia Homes'
        : '对比马来西亚新楼盘与优质公寓 | 马来西亚房产网';
      description = lang === 'en'
        ? 'Use our advanced multi-property comparison tool to compare pricing, layouts, developer track records, tenure, and location scores for top properties in Kuala Lumpur and Selangor.'
        : '使用我们先进的多房产对比工具，对比吉隆坡及雪兰莪各大楼盘的价格、户型、开发商业绩、产权年限及投资评分。';
    } else if (tab === 'guide') {
      title = lang === 'en'
        ? 'Malaysia Real Estate Buying Guide & Investment Insights'
        : '马来西亚置业指南、购房流程与投资分析';
      description = lang === 'en'
        ? 'The ultimate guide to buying residential property in Malaysia. Learn about RPGT, progressive billing, stamp duty exemptions, and critical investment strategies.'
        : '在马来西亚购买住宅房产的终极指南。全面解析房产增值税 (RPGT)、渐进式付款、印花税减免及核心投资策略。';
    } else if (tab === 'admin') {
      title = 'Property CRM & Admin Sync Dashboard | Malaysia Homes';
      description = 'Secure administrator interface for managing active listings, syncing with live Google Sheets database, and viewing captured client hotleads.';
    }

    // Update document title
    document.title = title;

    // Update Meta Tags dynamically (or create if missing)
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

    // Standard SEO Tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('robots', 'index, follow');

    // Google Site Verification (Read from environment or use a verified code fallback)
    const gVerification = (import.meta as any).env?.VITE_GOOGLE_VERIFICATION || 'g-google-site-verification-placeholder-code-12345';
    updateMetaTag('google-site-verification', gVerification);

    // OpenGraph / Facebook Tags (Crucial for social sharing & previews)
    const currentUrl = window.location.href;
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:type', 'website', true);
    updateMetaTag('og:url', currentUrl, true);
    if (project && project.image) {
      updateMetaTag('og:image', project.image, true);
    } else {
      const defaultImg = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80';
      updateMetaTag('og:image', defaultImg, true);
    }

    // Twitter Tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);

    // 2. SCHEMA.ORG RICH SNIPPETS STRUCTURED DATA (JSON-LD)
    let schemaMarkup: any = null;

    if (project) {
      // Single property/residence schema (highly optimized for real estate search results)
      schemaMarkup = {
        '@context': 'https://schema.org',
        '@type': project.propertyType === 'Landed' ? 'SingleFamilyResidence' : 'ApartmentComplex',
        'id': `${currentUrl}#project`,
        'name': project.name,
        'description': project.description || description,
        'url': currentUrl,
        'image': project.image || '',
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': project.area,
          'addressRegion': project.state,
          'addressCountry': 'MY',
        },
        'geo': {
          '@type': 'GeoCoordinates',
          'latitude': project.latitude,
          'longitude': project.longitude,
        },
        'offers': {
          '@type': 'AggregateOffer',
          'priceCurrency': 'MYR',
          'lowPrice': project.priceMin,
          'highPrice': project.priceMax,
          'offerCount': '1',
          'priceValuedAs': 'MYR',
        },
        'numberOfRooms': project.bedrooms,
        'amenityFeature': [
          {
            '@type': 'LocationFeatureSpecification',
            'name': 'Tenure',
            'value': project.tenure,
          },
          {
            '@type': 'LocationFeatureSpecification',
            'name': 'Developer',
            'value': project.developer,
          }
        ]
      };
    } else {
      // Real estate agency schema for the entire portal listing multiple properties
      schemaMarkup = {
        '@context': 'https://schema.org',
        '@type': 'RealEstateAgent',
        '@id': 'https://malaysiahomes.my/#agency',
        'name': 'Malaysia Homes',
        'url': 'https://malaysiahomes.my',
        'logo': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=300&q=80',
        'description': description,
        'telephone': '+60195598932',
        'areaServed': ['Kwasa Damansara', 'Petaling Jaya', 'Damansara', 'Selangor', 'Kuala Lumpur'],
        'knowsAbout': projects.map(p => p.name),
        'makesOffer': projects.map(p => ({
          '@type': 'Offer',
          'itemOffered': {
            '@type': 'Place',
            'name': p.name,
            'address': {
              '@type': 'PostalAddress',
              'addressLocality': p.area,
              'addressRegion': p.state,
              'addressCountry': 'MY'
            }
          }
        }))
      };
    }

    // Insert or update script tag
    let scriptTag = document.getElementById('seo-jsonld-schema');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'seo-jsonld-schema';
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(schemaMarkup, null, 2);

    // Cleanup function when component unmounts
    return () => {
      // Don't necessarily strip metadata, so search engines keep reading it
    };
  }, [project, tab, lang, projects]);

  return null; // This is a logic-only SEO side-effect injector component
}
