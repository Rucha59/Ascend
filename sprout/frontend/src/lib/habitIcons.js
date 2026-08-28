import { Dumbbell, BookMarked, Droplet, Brain, Code2, Ban, Clock, Sun, Moon, Heart, Coffee, Music, PenLine, Flame, Circle } from "lucide-react";

export const ICON_OPTIONS = [
  { name: "Dumbbell", Icon: Dumbbell },
  { name: "BookMarked", Icon: BookMarked },
  { name: "Droplet", Icon: Droplet },
  { name: "Brain", Icon: Brain },
  { name: "Code2", Icon: Code2 },
  { name: "Ban", Icon: Ban },
  { name: "Clock", Icon: Clock },
  { name: "Sun", Icon: Sun },
  { name: "Moon", Icon: Moon },
  { name: "Heart", Icon: Heart },
  { name: "Coffee", Icon: Coffee },
  { name: "Music", Icon: Music },
  { name: "PenLine", Icon: PenLine },
  { name: "Flame", Icon: Flame },
];

const ICON_MAP = Object.fromEntries(ICON_OPTIONS.map(({ name, Icon }) => [name, Icon]));

/** Falls back to a plain circle for any icon name the frontend doesn't recognize. */
export function getHabitIcon(name) {
  return ICON_MAP[name] || Circle;
}

export const COLOR_OPTIONS = [
  { name: "Peach", value: "#FF8B6B" },
  { name: "Teal", value: "#4FC9A8" },
  { name: "Moss", value: "#8FBE7A" },
  { name: "Sky", value: "#8FA6FF" },
  { name: "Rose", value: "#FF88AA" },
];
