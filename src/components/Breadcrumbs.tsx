import React from 'react';
import { Home, ChevronRight } from 'lucide-react';
import { Project } from '../types';

interface BreadcrumbsProps {
  tab: string;
  setTab: (tab: string) => void;
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  lang: 'en' | 'zh';
}

export default function Breadcrumbs({
  tab,
  setTab,
  selectedProject,
  setSelectedProject,
  lang,
}: BreadcrumbsProps) {
  // Translations for tab names in Breadcrumbs
  const tabNames: Record<string, { en: string; zh: string }> = {
    home: { en: 'Home', zh: '首页' },
    residences: { en: 'Explore Residences', zh: '甄选华邸' },
    favorites: { en: 'Saved Collection', zh: '我的收藏' },
    compare: { en: 'Compare Properties', zh: '对比分析' },
    calculators: { en: 'Property Calculators', zh: '房产计算器' },
    guide: { en: 'Buying Guide', zh: '置业指南' },
    map: { en: 'Interactive Map', zh: '互动地图' },
    admin: { en: 'CRM & System Panel', zh: '开发商系统' },
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedProject(null);
    setTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabClick = (e: React.MouseEvent, targetTab: string) => {
    e.preventDefault();
    setSelectedProject(null);
    setTab(targetTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Build the breadcrumb paths
  const items = [];

  // 1. Home is always the root item
  items.push({
    name: lang === 'en' ? 'Home' : '首页',
    url: 'https://propertyportal.my/',
    onClick: handleHomeClick,
  });

  // 2. Active Tab item (if not Home, or if selectedProject is set)
  // Even if we are looking at a project, we want to know what tab we came from (e.g. residences)
  const currentTab = tabNames[tab] ? tab : 'home';
  if (currentTab !== 'home' || selectedProject) {
    const parentTab = currentTab === 'home' && selectedProject ? 'residences' : currentTab;
    const tabLabel = tabNames[parentTab]?.[lang] || parentTab;
    items.push({
      name: tabLabel,
      url: `https://propertyportal.my/${parentTab}`,
      onClick: (e: React.MouseEvent) => handleTabClick(e, parentTab),
    });
  }

  // 3. Project Detail item (if selected)
  if (selectedProject) {
    items.push({
      name: selectedProject.name,
      url: `https://propertyportal.my/project/${selectedProject.id}`,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        // Keep active
      },
    });
  }

  return (
    <div className="bg-[#FAF8F5]/80 border-b border-[#ebdcb9]/40 backdrop-blur-xs py-3 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <nav 
          aria-label="Breadcrumb" 
          id="seo-breadcrumbs"
          className="flex flex-wrap items-center text-[11px] text-stone-500 font-bold"
          itemScope 
          itemType="https://schema.org/BreadcrumbList"
        >
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <React.Fragment key={index}>
                {index > 0 && (
                  <ChevronRight className="h-3 w-3 mx-2 text-stone-300 shrink-0" aria-hidden="true" />
                )}
                <span 
                  itemProp="itemListElement" 
                  itemScope 
                  itemType="https://schema.org/ListItem"
                  className="flex items-center"
                >
                  {isLast ? (
                    <span 
                      itemProp="name" 
                      className="text-stone-900 font-extrabold truncate max-w-[200px] sm:max-w-[400px]"
                    >
                      {item.name}
                    </span>
                  ) : (
                    <a
                      itemProp="item"
                      href={item.url}
                      onClick={item.onClick}
                      className="flex items-center hover:text-teal-800 transition-colors cursor-pointer"
                    >
                      {index === 0 && <Home className="h-3 w-3 mr-1 text-stone-400 shrink-0" />}
                      <span itemProp="name">{item.name}</span>
                    </a>
                  )}
                  <meta itemProp="position" content={(index + 1).toString()} />
                </span>
              </React.Fragment>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
