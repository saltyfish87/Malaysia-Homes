/**
 * Extra project detail shown in the project view: unit types, key features, facilities,
 * nearby places and FAQs. The data comes from /api/project-seo/<id>, the same source the
 * server uses for the crawler-visible project page, so what Google reads and what a visitor
 * sees stay identical (the FAQ schema on the page must match visible questions).
 */
import React, { useEffect, useState } from 'react';
import { HelpCircle, ChevronDown, Layers, Sparkles, Waves, MapPin, PlayCircle } from 'lucide-react';

interface Amenity { category: string; name: string; distance?: string }
interface Layout { type: string; sqft?: number; beds?: string; baths?: string }
export interface ProjectSeoPayload {
  slug: string;
  name: string;
  record: null | {
    source: string; description?: string; keyFeatures: string[]; facilities: string[]; amenities: Amenity[]; layouts: Layout[];
    landSize?: string; unitsPerFloor?: string; lifts?: string; constructionPeriod?: string;
  };
  faqs: { q: string; a: string }[];
  review?: null | { url: string; zhUrl: string; video: boolean };
}

const cache = new Map<string, ProjectSeoPayload>();

export function ProjectFactsExtra({ projectId, lang }: { projectId: string; lang: 'en' | 'zh' }) {
  const [data, setData] = useState<ProjectSeoPayload | null>(cache.get(projectId) || null);
  const [open, setOpen] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    if (cache.has(projectId)) { setData(cache.get(projectId)!); return; }
    fetch(`/api/project-seo/${encodeURIComponent(projectId)}`)
      .then(r => (r.ok ? r.json() : null))
      .then((j: ProjectSeoPayload | null) => { if (!cancelled && j) { cache.set(projectId, j); setData(j); } })
      .catch(() => { /* optional content: stay silent */ });
    return () => { cancelled = true; };
  }, [projectId]);

  if (!data) return null;
  const rec = data.record;
  const t = (en: string, zh: string) => (lang === 'en' ? en : zh);
  const heading = (kicker: string, title: string) => (
    <div className="border-b border-slate-200 pb-3 dark:border-slate-800">
      <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-gold">{kicker}</span>
      <h2 className="font-display text-xl sm:text-2xl font-black mt-0.5 text-slate-900 dark:text-white uppercase">{title}</h2>
    </div>
  );
  const byCategory: Record<string, Amenity[]> = {};
  for (const a of rec?.amenities || []) (byCategory[a.category] ||= []).push(a);

  return (
    <>
      {rec && rec.layouts.length > 0 && (
        <section id="sec-unit-types" className="scroll-mt-24 space-y-4">
          {heading(t('Unit Types', '户型一览'), t('Unit types and built-up sizes', '户型与面积'))}
          <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-[10px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="text-left px-4 py-2.5"><Layers className="inline h-3.5 w-3.5 mr-1" />{t('Type', '户型')}</th>
                  <th className="text-left px-4 py-2.5">{t('Built-up', '实用面积')}</th>
                  <th className="text-left px-4 py-2.5">{t('Bedrooms', '房')}</th>
                  <th className="text-left px-4 py-2.5">{t('Bathrooms', '浴')}</th>
                </tr>
              </thead>
              <tbody>
                {rec.layouts.map((l, i) => (
                  <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-2.5 font-black text-slate-900 dark:text-slate-100">{l.type}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-700 dark:text-slate-300">{l.sqft ? `${l.sqft.toLocaleString()} sq ft` : '–'}</td>
                    <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">{l.beds || '–'}</td>
                    <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">{l.baths || '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-400 font-semibold">{t('Sizes and types from the developer sales kit; confirm the current unit availability with the sales team.', '资料来自发展商售楼资料，实际可售单位以销售团队确认为准。')}</p>
        </section>
      )}

      {rec && rec.keyFeatures.length > 0 && (
        <section id="sec-highlights" className="scroll-mt-24 space-y-4">
          {heading(t('Highlights', '项目亮点'), t(`Why choose ${data.name}`, `为什么选择 ${data.name}`))}
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {rec.keyFeatures.map((f, i) => (
              <li key={i} className="flex items-start gap-2 rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200">
                <Sparkles className="h-4 w-4 shrink-0 text-brand-gold mt-0.5" /><span>{f}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {rec && rec.facilities.length > 0 && (
        <section id="sec-facilities" className="scroll-mt-24 space-y-4">
          {heading(t('Facilities', '配套设施'), t('Facilities', '设施清单'))}
          <div className="flex flex-wrap gap-2">
            {rec.facilities.map((f, i) => (
              <span key={i} className="rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-200">
                <Waves className="inline h-3 w-3 mr-1" />{f}
              </span>
            ))}
          </div>
        </section>
      )}

      {rec && rec.amenities.length > 0 && (
        <section id="sec-nearby" className="scroll-mt-24 space-y-4">
          {heading(t('Location', '周边配套'), t('Nearby and connectivity', '交通与周边'))}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(byCategory).map(([cat, items]) => (
              <div key={cat} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2"><MapPin className="inline h-3 w-3 mr-1" />{cat}</div>
                <ul className="space-y-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {items.map((a, i) => <li key={i}>{a.name}{a.distance ? <span className="text-slate-400 font-medium"> · {a.distance}</span> : null}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.review && (
        <section id="sec-review" className="scroll-mt-24">
          <a href={lang === 'zh' ? data.review.zhUrl : data.review.url} target="_blank" rel="noopener" className="flex items-center gap-4 rounded-2xl border border-brand-gold/40 bg-amber-50/60 p-4 sm:p-5 transition hover:border-brand-gold dark:bg-amber-950/20">
            <PlayCircle className="h-9 w-9 shrink-0 text-brand-gold" />
            <span>
              <span className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-gold">{t('Agent insights', '经纪评测')}</span>
              <span className="block text-sm sm:text-base font-black text-slate-900 dark:text-white">{t(`Read the ${data.name} review: ${data.review.video ? 'video walkthrough, ' : ''}pros and cons`, `看 ${data.name} 评测：${data.review.video ? '看房视频、' : ''}优缺点与推荐户型`)}</span>
              <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">{t('By Yee Woei Shyan, REN 46305, on shyanyee.com', 'Yee Woei Shyan（REN 46305）撰写，shyanyee.com')}</span>
            </span>
          </a>
        </section>
      )}

      {data.faqs.length > 0 && (
        <section id="sec-faq" className="scroll-mt-24 space-y-4">
          {heading(t('FAQ', '常见问题'), t(`Questions about ${data.name}`, `关于 ${data.name} 的常见问题`))}
          <div className="space-y-2.5">
            {data.faqs.map((f, i) => (
              <div key={i} className="rounded-2xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900/40">
                <button type="button" onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-black text-slate-900 dark:text-slate-100">
                  <span className="flex items-start gap-2"><HelpCircle className="h-4 w-4 shrink-0 text-brand-gold mt-0.5" />{f.q}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} />
                </button>
                {open === i && <p className="px-4 pb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300 font-medium">{f.a}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export default ProjectFactsExtra;
