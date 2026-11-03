import { BookOpen, Heart, House, ListTree, Puzzle, Shirt, Sparkles, Tablet, Volleyball } from 'lucide-react';

const ICONS = { tablet: Tablet, shirt: Shirt, house: House, volleyball: Volleyball, sparkles: Sparkles, heart: Heart, 'book-open': BookOpen, puzzle: Puzzle };

export const categoryIcon = (name) => ICONS[name] ?? ListTree;

// The same request everywhere, so the menus, sidebar and search share one call.
export const ALL_CATEGORIES_PATH = '/categories?limit=100';
