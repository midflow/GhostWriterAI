# Ghostwriter Design System

## Design Philosophy

**Modern, Clean, Productive** - The design reflects the app's purpose: helping users communicate efficiently without overthinking. The interface should feel lightweight, responsive, and encouraging.

### Core Principles

1. **Clarity First** - Every element serves a purpose. No decorative clutter.
2. **Progressive Disclosure** - Show essential information first, details on demand.
3. **Immediate Feedback** - Users should feel the app responding to their actions.
4. **Accessibility** - WCAG AA compliant. High contrast, readable fonts, keyboard navigation.

---

## Color Palette

### Primary Colors

| Color | Hex | Usage | Purpose |
|-------|-----|-------|---------|
| **Primary Blue** | `#007AFF` | Buttons, links, active states | Main action color |
| **Success Green** | `#34C759` | Positive feedback, saved states | Confirmation |
| **Warning Orange** | `#FF9500` | Alerts, important info | Caution |
| **Error Red** | `#FF3B30` | Errors, destructive actions | Danger |

### Neutral Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **Background** | `#FFFFFF` | Main background |
| **Surface** | `#F8F9FA` | Cards, containers |
| **Border** | `#E5E7EB` | Dividers, borders |
| **Text Primary** | `#1F2937` | Main text |
| **Text Secondary** | `#6B7280` | Secondary text, labels |
| **Text Tertiary** | `#9CA3AF` | Disabled, hints |

### Tone Colors (for tone selection)

| Tone | Color | Hex |
|------|-------|-----|
| Friendly | Warm Orange | `#FF9500` |
| Professional | Cool Blue | `#0084FF` |
| Assertive | Bold Red | `#FF3B30` |
| Apologetic | Soft Purple | `#AF52DE` |
| Casual | Vibrant Green | `#34C759` |

---

## Typography

### Font Stack

```
Primary Font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
Monospace: "SF Mono", Monaco, "Cascadia Code", monospace
```

### Type Scale

| Style | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| **Display** | 32px | 700 | 40px | Screen titles |
| **Heading 1** | 24px | 700 | 32px | Section titles |
| **Heading 2** | 20px | 600 | 28px | Subsection titles |
| **Body Large** | 16px | 400 | 24px | Primary body text |
| **Body Regular** | 14px | 400 | 20px | Secondary text |
| **Label** | 12px | 500 | 16px | Labels, badges |
| **Caption** | 11px | 400 | 16px | Helper text |

### Font Weights

- **Regular (400)** - Body text, descriptions
- **Medium (500)** - Labels, secondary headings
- **Semibold (600)** - Section titles
- **Bold (700)** - Main headings, CTAs

---

## Spacing System

All spacing uses 4px base unit for consistency.

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Minimal spacing |
| `sm` | 8px | Compact spacing |
| `md` | 12px | Standard spacing |
| `lg` | 16px | Generous spacing |
| `xl` | 24px | Large spacing |
| `2xl` | 32px | Extra large spacing |
| `3xl` | 48px | Massive spacing |

### Padding & Margin

- **Screen padding**: 16px (lg)
- **Card padding**: 16px (lg)
- **Button padding**: 12px vertical, 16px horizontal
- **Input padding**: 12px
- **Section gap**: 24px (xl)

---

## Component Library

### Buttons

#### Primary Button
- Background: Primary Blue (#007AFF)
- Text: White
- Padding: 12px 16px
- Border Radius: 8px
- Font: Body Large, Bold
- States: Default, Hover (darker blue), Pressed, Disabled (opacity 0.5)

#### Secondary Button
- Background: Surface (#F8F9FA)
- Text: Primary Blue
- Border: 1px solid Border (#E5E7EB)
- Padding: 12px 16px
- Border Radius: 8px
- States: Default, Hover (darker background), Pressed, Disabled

#### Tertiary Button
- Background: Transparent
- Text: Primary Blue
- Padding: 12px 16px
- States: Default, Hover (light blue background), Pressed

### Input Fields

- **Height**: 44px (touch-friendly)
- **Padding**: 12px
- **Border**: 1px solid Border (#E5E7EB)
- **Border Radius**: 8px
- **Font**: Body Regular
- **Focus State**: Blue border (2px), shadow
- **Placeholder**: Text Tertiary color
- **Error State**: Red border, error message below

### Cards

- **Background**: White
- **Border**: 1px solid Border (#E5E7EB)
- **Border Radius**: 12px
- **Padding**: 16px
- **Shadow**: 0px 1px 3px rgba(0,0,0,0.1)
- **Hover**: Shadow increases to 0px 4px 6px rgba(0,0,0,0.1)

### Badges/Tags

- **Padding**: 6px 12px
- **Border Radius**: 20px (fully rounded)
- **Font**: Label
- **Background**: Surface
- **Text**: Text Primary
- **Variants**: Default, Success, Warning, Error

### Loading States

- **Spinner**: Animated circular progress (Primary Blue)
- **Skeleton**: Light gray placeholder (Surface color)
- **Duration**: 1.5 seconds per rotation

### Modals/Dialogs

- **Overlay**: Transparent black (40% opacity)
- **Modal Background**: White
- **Border Radius**: 16px
- **Padding**: 24px
- **Shadow**: 0px 20px 25px rgba(0,0,0,0.15)
- **Max Width**: 90% of screen, max 500px

---

## Animations & Transitions

### Timing

- **Fast**: 150ms (micro-interactions)
- **Standard**: 300ms (screen transitions)
- **Slow**: 500ms (complex animations)

### Easing Functions

- **Ease In Out**: Cubic Bezier (0.4, 0, 0.2, 1) - Standard transitions
- **Ease Out**: Cubic Bezier (0, 0, 0.2, 1) - Entrance animations
- **Ease In**: Cubic Bezier (0.4, 0, 1, 1) - Exit animations

### Common Animations

1. **Fade In** - Opacity 0 → 1 (300ms ease-out)
2. **Slide Up** - Transform translateY(20px) → 0 (300ms ease-out)
3. **Scale** - Transform scale(0.95) → 1 (200ms ease-out)
4. **Button Press** - Scale(0.98) on press, scale(1) on release
5. **Loading Spinner** - Rotate 360° (1.5s linear, infinite)

---

## Responsive Design

### Breakpoints

- **Mobile**: 320px - 480px
- **Tablet**: 481px - 768px
- **Desktop**: 769px+

### Safe Areas

- **iPhone notch**: Top padding 44px
- **Android status bar**: Top padding 24px
- **Bottom navigation**: Bottom padding 60px

### Touch Targets

- **Minimum size**: 44x44px (accessibility)
- **Recommended spacing**: 8px between targets

---

## Accessibility

### Color Contrast

- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text**: Minimum 3:1 contrast ratio
- **UI components**: Minimum 3:1 contrast ratio

### Focus Indicators

- **Focus ring**: 2px solid Primary Blue
- **Offset**: 2px from element
- **Visible on all interactive elements**

### Text

- **Minimum font size**: 12px
- **Line height**: 1.5x font size minimum
- **Letter spacing**: 0.5px for body text

### Keyboard Navigation

- **Tab order**: Logical, left-to-right, top-to-bottom
- **Focus visible**: Always visible
- **Escape key**: Close modals and dropdowns
- **Enter key**: Submit forms, activate buttons

---

## Dark Mode (Optional Future)

When implementing dark mode:

| Element | Light | Dark |
|---------|-------|------|
| Background | #FFFFFF | #1F2937 |
| Surface | #F8F9FA | #374151 |
| Text Primary | #1F2937 | #FFFFFF |
| Text Secondary | #6B7280 | #D1D5DB |
| Border | #E5E7EB | #4B5563 |

---

## Implementation Checklist

- [ ] Create color constants in app
- [ ] Create typography scale (font sizes, weights)
- [ ] Create spacing scale (padding, margin)
- [ ] Build reusable button components
- [ ] Build reusable input components
- [ ] Build card component
- [ ] Build badge/tag component
- [ ] Implement animations library
- [ ] Test accessibility (contrast, keyboard nav)
- [ ] Test on multiple devices
- [ ] Document component usage

---

## Resources

- **Design Tools**: Figma, Adobe XD
- **Icon Library**: SF Symbols (iOS), Material Icons (Android)
- **Animation**: React Native Animated API, Reanimated
- **Accessibility**: WCAG 2.1 AA Guidelines

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-24 | Initial design system |

