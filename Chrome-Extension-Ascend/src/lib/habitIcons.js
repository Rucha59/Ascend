import {
  Dumbbell,
  BookMarked,
  Droplet,
  Brain,
  Code2,
  Ban,
  Clock,
  Sun,
  Moon,
  Heart,
  Coffee,
  Music,
  PenLine,
  Flame,
  Circle,
  Footprints,
  Apple,
  Sparkles,
} from "lucide-react";

export const ICON_OPTIONS = [
  { name: "Droplet", Icon: Droplet, label: "Water" },
  { name: "Dumbbell", Icon: Dumbbell, label: "Fitness" },
  { name: "BookMarked", Icon: BookMarked, label: "Reading" },
  { name: "Brain", Icon: Brain, label: "Mind" },
  { name: "Footprints", Icon: Footprints, label: "Walk" },
  { name: "Code2", Icon: Code2, label: "Code" },
  { name: "Coffee", Icon: Coffee, label: "Coffee" },
  { name: "Sun", Icon: Sun, label: "Morning" },
  { name: "Moon", Icon: Moon, label: "Sleep" },
  { name: "Heart", Icon: Heart, label: "Health" },
  { name: "Music", Icon: Music, label: "Music" },
  { name: "PenLine", Icon: PenLine, label: "Journal" },
  { name: "Flame", Icon: Flame, label: "Streak" },
  { name: "Apple", Icon: Apple, label: "Nutrition" },
  { name: "Clock", Icon: Clock, label: "Focus" },
  { name: "Sparkles", Icon: Sparkles, label: "Habit" },
];

const ICON_MAP = Object.fromEntries(ICON_OPTIONS.map(({ name, Icon }) => [name, Icon]));

export function getHabitIcon(name) {
  return ICON_MAP[name] || Circle;
}

export const COLOR_OPTIONS = [
  { name: "Seafoam", value: "#187D62" },
  { name: "Emerald", value: "#35B887" },
  { name: "Warm Gold", value: "#E2B65A" },
  { name: "Sky Blue", value: "#286B9A" },
  { name: "Berry", value: "#B83F43" },
  { name: "Sage", value: "#8FB7A3" },
];
