# 🍷 Piero’s Cellar — Brand Style Guide

This guide defines the visual identity for **Piero’s Cellar**, blending the themes of **masonry** and **wine craftsmanship**.  
Use this document as a reference for maintaining consistent design throughout the app and related materials.

---

## 🪨 Logo

### Primary Logo
- **Layout:** Stone archway with wine bottle silhouette beneath.
- **Color Palette:** Burgundy and stone gray.
- **Font:** Cinzel (serif, inspired by Roman stone engravings).
- **Usage:** Default logo for splash screens, headers, and website branding.

**Assets**
- `logo_primary_vertical.png` — arch with text below
- `logo_primary_horizontal.png` — text on the right
- `logo_mark.png` — icon only (no text)

**Minimum Size:**
- Icon-only: 64x64px
- With text: 150px wide minimum

**Spacing:**  
Leave at least one “stone block” worth of padding (1× the logo’s arch stone width) on all sides.

---

## 🎨 Color Palette

| Name | Hex | Usage |
|------|------|--------|
| Burgundy | `#722F37` | Primary (bottle, text) |
| Stone Gray | `#7A7A7A` | Masonry and accent |
| Sandstone Beige | `#D4C6AA` | Background or light elements |
| Dark Slate | `#2F2F2F` | Text or high contrast areas |
| Olive Green | `#6A7B4E` | Optional vine accent |

Example usage:

```tsx
// colors.ts
export const colors = {
  burgundy: "#722F37",
  stoneGray: "#7A7A7A",
  sandstone: "#D4C6AA",
  slate: "#2F2F2F",
  olive: "#6A7B4E",
};
