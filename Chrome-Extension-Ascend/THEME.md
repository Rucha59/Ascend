# Ascend Theme System
## Deep Seafoam (Light) + Forest Green (Dark)

**File:** `theme.md`  
**Product:** Ascend Chrome Extension  
**Theme modes:** Light and Dark  
**Design direction:** Modern, high-contrast, nature-inspired productivity UI

---

## 1. Theme overview

Ascend uses two coordinated green themes:

- **Deep Seafoam** is the light theme: fresh, bright, calm, and focused. It uses cool mint-tinted backgrounds, crisp white surfaces, deep green typography, and a saturated seafoam/emerald accent.
- **Forest Green** is the dark theme: rich, immersive, grounded, and comfortable in low-light environments. It uses layered pine-green surfaces, pale mint text, and a brighter green accent for clear interaction states.

Both modes share the same semantic design tokens and component behavior. Only the token values change when the mode changes.

### Design principles

1. **One dominant accent:** Use the primary green for the most important action and active state. Do not make every element green.
2. **Strong contrast:** Body text must remain highly legible. Use deep green text in light mode and pale mint text in dark mode.
3. **Layered surfaces:** Separate the page, cards, and elevated controls using distinct surface colors and subtle borders.
4. **Meaningful color:** Reserve success, warning, and danger colors for their semantic purpose.
5. **Quiet decoration:** Use illustrations and decorative shapes sparingly so tasks and habits remain the focus.

---

## 2. Core palettes

### 2.1 Deep Seafoam — Light mode

| Token | Hex | Intended use |
|---|---|---|
| `--color-primary` | `#187D62` | Primary buttons, active navigation, progress fills |
| `--color-primary-hover` | `#126A53` | Hover state for primary actions |
| `--color-primary-pressed` | `#075440` | Pressed state |
| `--color-primary-soft` | `#A5CDB8` | Selected chips, subtle accent surfaces |
| `--color-primary-subtle` | `#DDECE5` | Selected backgrounds, soft highlights |
| `--color-page` | `#DDECE5` | Main popup/page background |
| `--color-surface` | `#FFFFFF` | Cards, menus, dialogs |
| `--color-surface-raised` | `#F8FCF9` | Raised cards, input backgrounds where needed |
| `--color-surface-muted` | `#EAF3EE` | Secondary panels and inactive tracks |
| `--color-text` | `#123D32` | Main headings and body text |
| `--color-text-secondary` | `#456B5D` | Supporting text and descriptions |
| `--color-text-muted` | `#668579` | Metadata, placeholders, timestamps |
| `--color-border` | `#C5DCD0` | Card outlines and dividers |
| `--color-border-strong` | `#8FB7A3` | Focused or emphasized outlines |
| `--color-icon` | `#285D50` | Default icons |
| `--color-on-primary` | `#FFFFFF` | Text/icons on primary buttons |
| `--color-accent-warm` | `#E2B65A` | Rare highlights, badges, illustrations |

**Light-mode feel:** The overall canvas is cool mint (`#DDECE5`), while cards are white. The saturated primary green (`#187D62`) should be visually prominent against these surfaces.

### 2.2 Forest Green — Dark mode

Use a deep pine base with clearly separated green surfaces. Avoid using pure black.

| Token | Hex | Intended use |
|---|---|---|
| `--color-primary` | `#35B887` | Primary buttons, active navigation, progress fills |
| `--color-primary-hover` | `#48C797` | Hover state for primary actions |
| `--color-primary-pressed` | `#238F69` | Pressed state |
| `--color-primary-soft` | `#1D634D` | Selected chips and subtle accent surfaces |
| `--color-primary-subtle` | `#164B3D` | Selected backgrounds and soft highlights |
| `--color-page` | `#0D2924` | Main popup/page background |
| `--color-surface` | `#12372F` | Cards, menus, dialogs |
| `--color-surface-raised` | `#19463A` | Raised cards, popovers and elevated controls |
| `--color-surface-muted` | `#1A4036` | Secondary panels and inactive tracks |
| `--color-text` | `#E8F4ED` | Main headings and body text |
| `--color-text-secondary` | `#B7D2C4` | Supporting text and descriptions |
| `--color-text-muted` | `#8EAD9E` | Metadata, placeholders, timestamps |
| `--color-border` | `#285747` | Card outlines and dividers |
| `--color-border-strong` | `#3D765F` | Focused or emphasized outlines |
| `--color-icon` | `#B7DCC9` | Default icons |
| `--color-on-primary` | `#062B20` | Text/icons on bright primary buttons |
| `--color-accent-warm` | `#E2B65A` | Rare highlights, badges, illustrations |

**Dark-mode feel:** The page uses deep forest green (`#0D2924`), cards are a lighter pine (`#12372F`), and elevated surfaces are lighter again (`#19463A`). The bright mint-green primary (`#35B887`) provides the main contrast.

---

## 3. Semantic status colors

Status colors should remain consistent in both modes. They must not be confused with the primary brand accent.

| Semantic token | Light mode | Dark mode | Use |
|---|---|---|---|
| Success | `#287A52` | `#75D6A0` | Completed habits, successful actions |
| Warning | `#9A6500` | `#F0C66B` | Due soon, attention needed |
| Danger | `#B83F43` | `#FF8585` | Delete, overdue, destructive errors |
| Info | `#286B9A` | `#83BDEB` | Tips, neutral information |
| Success surface | `#E4F2E8` | `#174A38` | Success banners and badges |
| Warning surface | `#FBF0D7` | `#51401F` | Warning banners and badges |
| Danger surface | `#F9E6E5` | `#542B2D` | Error banners and badges |
| Info surface | `#E5F0F8` | `#1B3D52` | Informational banners and badges |

Use the semantic foreground on its corresponding semantic surface. Do not use status colors as decorative accents.

---

## 4. Typography

Use the system font stack for a fast, native-feeling Chrome extension UI.

```css
font-family:
  Inter,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

If Inter is bundled with the extension, use it as the first choice. Otherwise, the system fallback is acceptable.

| Style | Size | Weight | Line height | Usage |
|---|---:|---:|---:|---|
| Display | 24px | 700 | 1.2 | Main greeting or prominent total |
| Page heading | 20px | 700 | 1.25 | Main section title |
| Card heading | 15px | 650 | 1.3 | Card titles |
| Body | 14px | 400 | 1.45 | Tasks, habits, descriptions |
| Button | 14px | 600 | 1.2 | Buttons and primary actions |
| Label | 12px | 600 | 1.3 | Form labels and compact headings |
| Caption | 11px | 400 | 1.35 | Metadata, dates and helper text |

Avoid using muted text colors for important instructions or essential task information.

---

## 5. Shape, spacing and elevation

### Radius

| Token | Value | Usage |
|---|---:|---|
| `--radius-sm` | `6px` | Small chips, compact controls |
| `--radius-md` | `10px` | Inputs, buttons |
| `--radius-lg` | `14px` | Cards |
| `--radius-xl` | `18px` | Main panels and dialogs |
| `--radius-pill` | `999px` | Pills and progress tracks |

### Spacing

Use a 4px base spacing scale.

| Token | Value |
|---|---:|
| `--space-1` | `4px` |
| `--space-2` | `8px` |
| `--space-3` | `12px` |
| `--space-4` | `16px` |
| `--space-5` | `20px` |
| `--space-6` | `24px` |
| `--space-8` | `32px` |

### Shadows

Use restrained shadows. The border should do most of the work, especially in dark mode.

```css
/* Light mode */
--shadow-card: 0 2px 10px rgba(18, 61, 50, 0.06);
--shadow-popover: 0 8px 24px rgba(18, 61, 50, 0.14);

/* Dark mode */
--shadow-card: 0 2px 12px rgba(0, 0, 0, 0.16);
--shadow-popover: 0 10px 28px rgba(0, 0, 0, 0.30);
```

---

## 6. Component styling

### Main page
- Use `--color-page` for the popup/side panel background.
- Keep the main content width and layout consistent between modes.
- Use the same spacing and component dimensions in both modes.
- Avoid large saturated blocks behind the entire interface.

### Cards
- Use `--color-surface` as the default card background.
- Apply a 1px `--color-border` outline.
- Use `--radius-lg` and `--shadow-card`.
- Use `--color-surface-raised` only for nested or elevated content.
- Keep card headings in `--color-text`.

### Primary buttons
- Background: `--color-primary`.
- Text/icon: `--color-on-primary`.
- Hover: `--color-primary-hover`.
- Active/pressed: `--color-primary-pressed`.
- Border radius: `--radius-md`.
- Use a subtle 150–200ms background and transform transition.
- Primary buttons should be reserved for the main action in a view.

### Secondary buttons
- Background: transparent or `--color-surface`.
- Text: `--color-text`.
- Border: `--color-border`.
- Hover background: `--color-primary-subtle`.
- Do not give secondary buttons the same visual weight as primary buttons.

### Inputs
- Background: `--color-surface-raised`.
- Text: `--color-text`.
- Placeholder: `--color-text-muted`.
- Border: `--color-border`.
- Focus border: `--color-primary`.
- Add a visible focus ring using the primary color with transparency.
- Never communicate validation errors using color alone; include an error message or icon.

### Checkboxes and task completion
- Unchecked: transparent or surface background with `--color-border-strong` outline.
- Checked: `--color-primary` background with `--color-on-primary` checkmark.
- Completed task text: `--color-text-muted`, optionally with line-through.
- Keep the task title readable; do not fade the entire completed row excessively.

### Progress bars
- Track: `--color-surface-muted`.
- Fill: `--color-primary`.
- Track height: 6–8px.
- Use a rounded pill shape.
- Animate progress changes over 250–400ms.
- Show the numeric percentage or completed count as text; do not rely on the bar alone.

### Navigation
- Inactive icon and label: `--color-text-muted`.
- Active icon and label: `--color-primary`.
- Active state may use a small `--color-primary-subtle` background.
- Keep active navigation distinguishable through both color and shape/weight.

### Badges
- Default: `--color-surface-muted` background with `--color-text-secondary` text.
- In-progress: `--color-primary-subtle` background with `--color-primary` or `--color-text` text, ensuring sufficient contrast.
- Success, warning, danger and info badges must use the semantic tokens in section 3.

### Empty states and illustrations
- Use simple flat illustrations with deep green outlines and a small number of palette colors.
- Use primary green for the main subject, soft mint for secondary shapes, and warm gold only for small highlights.
- Avoid large illustrations that push important tasks below the fold.
- Keep illustrations consistent between light and dark modes; adjust outlines and background shapes for legibility.

---

## 7. Motion and interaction

Use motion to provide feedback, not decoration.

| Interaction | Recommended motion |
|---|---|
| Button hover | 150ms ease; slight lift of 1px |
| Button press | 100ms ease; scale to `0.98` |
| Checkbox completion | 180–220ms; checkmark draw or short pop |
| Progress update | 250–400ms ease-out |
| Card hover | 160ms ease; subtle border/shadow change |
| Toast notification | 180ms fade/slide in; 150ms out |
| Milestone completion | One brief celebratory animation |

Respect `prefers-reduced-motion: reduce`. When reduced motion is enabled, remove non-essential transforms and use immediate or very short opacity changes.

---

## 8. CSS implementation tokens

```css
/* Deep Seafoam — Light mode */
:root,
[data-theme="light"] {
  color-scheme: light;

  --color-primary: #187D62;
  --color-primary-hover: #126A53;
  --color-primary-pressed: #075440;
  --color-primary-soft: #A5CDB8;
  --color-primary-subtle: #DDECE5;

  --color-page: #DDECE5;
  --color-surface: #FFFFFF;
  --color-surface-raised: #F8FCF9;
  --color-surface-muted: #EAF3EE;

  --color-text: #123D32;
  --color-text-secondary: #456B5D;
  --color-text-muted: #668579;

  --color-border: #C5DCD0;
  --color-border-strong: #8FB7A3;
  --color-icon: #285D50;
  --color-on-primary: #FFFFFF;
  --color-accent-warm: #E2B65A;

  --color-success: #287A52;
  --color-warning: #9A6500;
  --color-danger: #B83F43;
  --color-info: #286B9A;
  --color-success-surface: #E4F2E8;
  --color-warning-surface: #FBF0D7;
  --color-danger-surface: #F9E6E5;
  --color-info-surface: #E5F0F8;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 18px;
  --radius-pill: 999px;

  --shadow-card: 0 2px 10px rgba(18, 61, 50, 0.06);
  --shadow-popover: 0 8px 24px rgba(18, 61, 50, 0.14);
}

/* Forest Green — Dark mode */
[data-theme="dark"] {
  color-scheme: dark;

  --color-primary: #35B887;
  --color-primary-hover: #48C797;
  --color-primary-pressed: #238F69;
  --color-primary-soft: #1D634D;
  --color-primary-subtle: #164B3D;

  --color-page: #0D2924;
  --color-surface: #12372F;
  --color-surface-raised: #19463A;
  --color-surface-muted: #1A4036;

  --color-text: #E8F4ED;
  --color-text-secondary: #B7D2C4;
  --color-text-muted: #8EAD9E;

  --color-border: #285747;
  --color-border-strong: #3D765F;
  --color-icon: #B7DCC9;
  --color-on-primary: #062B20;
  --color-accent-warm: #E2B65A;

  --color-success: #75D6A0;
  --color-warning: #F0C66B;
  --color-danger: #FF8585;
  --color-info: #83BDEB;
  --color-success-surface: #174A38;
  --color-warning-surface: #51401F;
  --color-danger-surface: #542B2D;
  --color-info-surface: #1B3D52;

  --shadow-card: 0 2px 12px rgba(0, 0, 0, 0.16);
  --shadow-popover: 0 10px 28px rgba(0, 0, 0, 0.30);
}
```

---

## 9. Theme switching behavior

Support three user preferences:
- **Light:** Always use Deep Seafoam.
- **Dark:** Always use Forest Green.
- **System:** Follow the operating system's `prefers-color-scheme` setting.
