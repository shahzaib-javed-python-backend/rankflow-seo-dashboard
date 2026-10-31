import {
  FileText, MapPin, Video, Image, HelpCircle, BookOpen, Link2, Star, type LucideIcon,
} from 'lucide-react';
import type { SerpFeature } from '@/types';

export const serpFeatureIcon: Record<SerpFeature, LucideIcon> = {
  'featured-snippet': FileText,
  'local-pack': MapPin,
  video: Video,
  image: Image,
  'people-also-ask': HelpCircle,
  'knowledge-panel': BookOpen,
  sitelinks: Link2,
  reviews: Star,
};

export const serpFeatureColor: Record<SerpFeature, string> = {
  'featured-snippet': 'text-sky-400 bg-sky-500/10',
  'local-pack': 'text-brand-400 bg-brand-500/10',
  video: 'text-rose-400 bg-rose-500/10',
  image: 'text-violet-400 bg-violet-500/10',
  'people-also-ask': 'text-amber-400 bg-amber-500/10',
  'knowledge-panel': 'text-emerald-400 bg-emerald-500/10',
  sitelinks: 'text-indigo-400 bg-indigo-500/10',
  reviews: 'text-yellow-400 bg-yellow-500/10',
};
