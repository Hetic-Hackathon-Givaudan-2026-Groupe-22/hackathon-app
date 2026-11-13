import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Liens et navigation qui gardent la langue de l'URL (/fr/…, /en/…)
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
