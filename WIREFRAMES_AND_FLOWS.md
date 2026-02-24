# Ghostwriter - Wireframes & User Flows

## User Journey Overview

The Ghostwriter app follows a simple, intuitive user journey: **Authenticate → Input → Generate → Save → Analyze**. Each step is designed to minimize friction and maximize clarity.

---

## Screen 1: Login Screen

### Purpose
Allow existing users to authenticate and access their account and history.

### Layout Structure

```
┌─────────────────────────────┐
│         [Status Bar]        │
├─────────────────────────────┤
│                             │
│           [Logo]            │  (Blue 'G' icon, 80x80px)
│                             │
│      "Ghostwriter"          │  (Display font, 32px, centered)
│                             │
├─────────────────────────────┤
│                             │
│  ┌───────────────────────┐  │
│  │ Email                 │  │  (Input field, 44px height)
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ Password              │  │  (Input field, 44px height)
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │     Login Button      │  │  (Primary button, full width)
│  └───────────────────────┘  │
│                             │
│  "Don't have an account?    │  (Caption + link)
│   Register"                 │
│                             │
└─────────────────────────────┘
```

### Key Elements

| Element | Specs | Notes |
|---------|-------|-------|
| **Logo** | 80x80px, Blue (#007AFF) | Centered, top padding 48px |
| **Title** | 32px, Bold, Centered | "Ghostwriter" |
| **Email Input** | 44px height, Full width | Placeholder: "Email" |
| **Password Input** | 44px height, Full width | Placeholder: "Password", masked text |
| **Login Button** | 44px height, Full width | Primary Blue, white text |
| **Register Link** | 14px, Blue text | Centered at bottom |

### Interactions

- **Email input focus**: Blue border (2px), shadow
- **Password input focus**: Blue border (2px), shadow
- **Login button press**: Scale 0.98, then scale 1.0 (200ms)
- **Register link tap**: Navigate to Register screen
- **Loading state**: Show spinner inside button, disable input fields

### Validation

- Email: Valid email format (RFC 5322)
- Password: Minimum 6 characters
- Error messages: Red text below input field

---

## Screen 2: Home Screen

### Purpose
Allow users to input a message and select a tone for AI suggestion generation.

### Layout Structure

```
┌─────────────────────────────┐
│  [Status Bar]               │
├─────────────────────────────┤
│ 👻 Ghostwriter        [⚙️]  │  (Header with logo, settings icon)
├─────────────────────────────┤
│                             │
│  "What do you need to       │  (Heading 1, 24px)
│   reply to?"                │
│                             │
│  ┌───────────────────────┐  │
│  │ Paste the message     │  │  (Text area, 100px height)
│  │ here...               │  │
│  │                       │  │
│  └───────────────────────┘  │
│                             │
│  "Choose a tone:"           │  (Heading 2, 20px)
│                             │
│  ┌─────────────┐ ┌────────┐ │
│  │ 🟠 Friendly │ │ 🔵 Prof│ │  (Tone buttons, 2 columns)
│  │ Warm &      │ │ Formal │ │
│  │ approach.   │ │ & poli.│ │
│  └─────────────┘ └────────┘ │
│                             │
│  ┌─────────────┐ ┌────────┐ │
│  │ 🔴 Assertive│ │ 🟣 Apol│ │
│  │ Confident & │ │ Sorry &│ │
│  │ direct      │ │ underst│ │
│  └─────────────┘ └────────┘ │
│                             │
│  ┌──────────────────────┐   │
│  │ 🟢 Casual            │   │  (Full width, last button)
│  │ Relaxed & informal   │   │
│  └──────────────────────┘   │
│                             │
│  ┌───────────────────────┐  │
│  │ Generate Suggestions  │  │  (Primary button, full width)
│  └───────────────────────┘  │
│                             │
└─────────────────────────────┘
```

### Key Elements

| Element | Specs | Notes |
|---------|-------|-------|
| **Header** | 56px height | Logo (32px) + Settings icon |
| **Heading** | 24px, Bold | "What do you need to reply to?" |
| **Text Area** | 100px height, Full width | Placeholder text, multiline |
| **Tone Label** | 20px, Semibold | "Choose a tone:" |
| **Tone Buttons** | 44px height, 2 columns | 5 buttons total, colored backgrounds |
| **Generate Button** | 44px height, Full width | Primary Blue |

### Tone Button Details

Each tone button has:
- **Color**: Unique color (Friendly=Orange, Professional=Blue, Assertive=Red, Apologetic=Purple, Casual=Green)
- **Icon**: Emoji or icon representation
- **Text**: Tone name + short description
- **Selected state**: Darker background, white border (2px)
- **Hover state**: Slightly darker background

### Interactions

- **Text area focus**: Blue border (2px), shadow
- **Tone button tap**: Select tone, show visual feedback (border)
- **Generate button tap**: Validate inputs, show loading state, navigate to Result screen
- **Settings icon tap**: Navigate to Settings screen

### Validation

- Message: Minimum 5 characters
- Tone: Must be selected
- Error: Show toast notification if validation fails

---

## Screen 3: Result Screen

### Purpose
Display AI-generated reply suggestions and allow users to copy or save them.

### Layout Structure

```
┌─────────────────────────────┐
│  [Status Bar]               │
├─────────────────────────────┤
│ 👻 Ghostwriter        [←]   │  (Header with back button)
├─────────────────────────────┤
│                             │
│  "Original Message"         │  (Label, 12px, gray)
│  ┌───────────────────────┐  │
│  │ Running a little late.│  │  (Light gray background)
│  │ I'll be there in 10   │  │
│  │ minutes.              │  │
│  └───────────────────────┘  │
│                             │
│  ┌─────────────────────┐    │
│  │ 🟠 Friendly Tone    │    │  (Tone badge)
│  └─────────────────────┘    │
│                             │
│  "Suggestions"              │  (Heading 2, 20px)
│                             │
│  ┌───────────────────────┐  │
│  │ Hey there! Running a  │  │  (Suggestion 1)
│  │ bit late, but I'll be │  │
│  │ there in about 10     │  │
│  │ minutes.              │  │
│  │                       │  │
│  │ [Copy]        [Save]  │  │  (Action buttons)
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ Just a heads up, I'm  │  │  (Suggestion 2)
│  │ running a little      │  │
│  │ behind. I'll be there │  │
│  │ in 10 minutes!        │  │
│  │                       │  │
│  │ [Copy]        [Save]  │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ Sorry! I'm running    │  │  (Suggestion 3)
│  │ late, but I'll be     │  │
│  │ there in around 10    │  │
│  │ minutes.              │  │
│  │                       │  │
│  │ [Copy]        [Save]  │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ Generate Another      │  │  (Secondary button)
│  └───────────────────────┘  │
│                             │
└─────────────────────────────┘
```

### Key Elements

| Element | Specs | Notes |
|---------|-------|-------|
| **Original Message Box** | Full width, light gray bg | Read-only, 60px min height |
| **Tone Badge** | 32px height, colored | Shows selected tone |
| **Suggestion Card** | Full width, white bg, border | 80px min height |
| **Suggestion Text** | 14px, regular | Body text, left-aligned |
| **Copy Button** | 36px height, outlined | Secondary style |
| **Save Button** | 36px height, primary | Blue background |
| **Generate Again Button** | 44px height, secondary | Full width |

### Interactions

- **Copy button tap**: Copy text to clipboard, show "Copied!" toast (1.5s)
- **Save button tap**: Save message to history, show "Saved!" toast
- **Generate Again button tap**: Navigate back to Home screen
- **Back button tap**: Navigate back to Home screen
- **Suggestion card swipe**: Optional - swipe to reveal more actions

### Loading State

While generating suggestions:
- Show spinner in center of screen
- Disable all buttons
- Show "Generating suggestions..." message

---

## Screen 4: History Screen

### Purpose
Display user's saved messages and allow searching, filtering, and viewing details.

### Layout Structure

```
┌─────────────────────────────┐
│  [Status Bar]               │
├─────────────────────────────┤
│ 👻 Ghostwriter        [⚙️]  │  (Header)
├─────────────────────────────┤
│                             │
│  "History"                  │  (Heading 1, 24px)
│                             │
│  ┌───────────────────────┐  │
│  │ 🔍 Search...          │  │  (Search bar, 44px height)
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ Hey! Just wanted to   │  │  (Message card 1)
│  │ say thank you for...  │  │
│  │ 🟠 Friendly   Feb 24  │  │
│  │                [View] │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ Please review the     │  │  (Message card 2)
│  │ attached report and   │  │
│  │ 🔵 Professional Feb24 │  │
│  │                [View] │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ Had a great time      │  │  (Message card 3)
│  │ catching up with you! │  │
│  │ 🟠 Friendly   Feb 24  │  │
│  │                [View] │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ As per our discussion,│  │  (Message card 4)
│  │ here is the updated.. │  │
│  │ 🔵 Professional Feb24 │  │
│  │                [View] │  │
│  └───────────────────────┘  │
│                             │
│  [Home] [History] [Analytics]  (Bottom navigation)
│                             │
└─────────────────────────────┘
```

### Key Elements

| Element | Specs | Notes |
|---------|-------|-------|
| **Search Bar** | 44px height, full width | Placeholder: "Search..." |
| **Message Card** | Full width, white bg, border | 80px min height |
| **Message Preview** | 14px, 2 lines max | Truncated with ellipsis |
| **Tone Badge** | 24px height, colored | Shows tone |
| **Date** | 12px, gray text | Format: "Feb 24" |
| **View Button** | 36px height, primary | Blue background |
| **Bottom Navigation** | 60px height | 3 tabs: Home, History, Analytics |

### Interactions

- **Search bar input**: Filter messages by text (real-time)
- **Tone badge tap**: Optional - filter by tone
- **View button tap**: Navigate to message detail screen (show full message + all suggestions)
- **Message card long press**: Show delete option
- **Bottom navigation**: Switch between screens

### Empty State

If no messages found:
- Show illustration (empty box icon)
- "No messages yet" heading
- "Start by generating suggestions on the Home screen" subtext

---

## Screen 5: Analytics Screen

### Purpose
Display usage statistics, cost estimation, and tone breakdown to help users understand their usage patterns.

### Layout Structure

```
┌─────────────────────────────┐
│  [Status Bar]               │
├─────────────────────────────┤
│ 👻 Ghostwriter        [⚙️]  │  (Header)
├─────────────────────────────┤
│                             │
│  "Analytics"                │  (Heading 1, 24px)
│                             │
│  ┌──────────────────────┐   │
│  │ 7 days          [▼]  │   │  (Date range selector)
│  └──────────────────────┘   │
│                             │
│  ┌──────────┐ ┌──────────┐  │
│  │ Total    │ │ Total    │  │  (Stat cards, 2 columns)
│  │Requests  │ │ Tokens   │  │
│  │   42     │ │ 12,450   │  │
│  └──────────┘ └──────────┘  │
│                             │
│  ┌──────────┐ ┌──────────┐  │
│  │ Avg      │ │ Est.     │  │
│  │Response  │ │ Cost     │  │
│  │ 1.2s     │ │ $0.15    │  │
│  └──────────┘ └──────────┘  │
│                             │
│  "Tone Breakdown"           │  (Heading 2, 20px)
│                             │
│  ┌───────────────────────┐  │
│  │      [Pie Chart]      │  │  (Chart, 200px height)
│  │  Friendly: 40%        │  │
│  │  Professional: 30%    │  │
│  │  Casual: 20%          │  │
│  │  Assertive: 7%        │  │
│  │  Apologetic: 3%       │  │
│  └───────────────────────┘  │
│                             │
│  [Home] [History] [Analytics]  (Bottom navigation)
│                             │
└─────────────────────────────┘
```

### Key Elements

| Element | Specs | Notes |
|---------|-------|-------|
| **Date Range Selector** | 44px height, full width | Dropdown: 7 days, 30 days, 90 days |
| **Stat Card** | 80px height, 2 columns | Light blue background |
| **Stat Label** | 12px, gray | "Total Requests" |
| **Stat Value** | 28px, bold, blue | Large number |
| **Pie Chart** | 200px height, full width | Colored segments with legend |
| **Legend Item** | 12px text | Tone name + percentage |
| **Bottom Navigation** | 60px height | 3 tabs |

### Interactions

- **Date range dropdown**: Change time period, update all stats
- **Pie chart segment tap**: Show detailed breakdown for that tone
- **Bottom navigation**: Switch between screens

### Data Points Displayed

1. **Total Requests** - Number of suggestions generated
2. **Total Tokens** - LLM tokens used (for cost estimation)
3. **Avg Response Time** - Average time to generate suggestions
4. **Est. Cost** - Estimated cost based on LLM pricing
5. **Tone Breakdown** - Pie chart showing tone distribution

---

## User Flow Diagram

```
┌─────────────┐
│   Start     │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Login/Register │
└────────┬────────┘
         │
         ▼
    ┌─────────────┐
    │ Home Screen │◄────────────────┐
    └────┬────────┘                 │
         │                          │
         │ (Input message + tone)   │
         │                          │
         ▼                          │
    ┌──────────────────┐            │
    │ Result Screen    │            │
    │ (3 suggestions)  │            │
    └────┬─────────────┘            │
         │                          │
         ├──► Copy ──► Clipboard    │
         │                          │
         ├──► Save ──► History      │
         │                          │
         └──► Generate Again ───────┘
         
    ┌──────────────┐
    │ History      │
    │ (View saved) │
    └──────────────┘
    
    ┌──────────────┐
    │ Analytics    │
    │ (View stats) │
    └──────────────┘
```

---

## Navigation Structure

### Bottom Tab Navigation (Persistent)

The app uses bottom tab navigation for main sections:

| Tab | Screen | Icon | Active Color |
|-----|--------|------|--------------|
| **Home** | Home | House | Blue (#007AFF) |
| **History** | History | Book | Blue (#007AFF) |
| **Analytics** | Analytics | Chart | Blue (#007AFF) |

### Header Navigation

- **Back button**: Available on Result screen
- **Settings icon**: Available on Home, History, Analytics screens
- **Logo**: Tappable on all screens to return to Home

---

## Responsive Behavior

### Mobile (320px - 480px)

- Full-width layouts
- Single column for buttons
- Stacked tone buttons (2 per row)
- Smaller padding (12px)

### Tablet (481px - 768px)

- Wider layouts with side padding
- 2-column layouts where appropriate
- Larger buttons with more spacing
- Increased padding (16px)

### Safe Areas

- **iPhone notch**: 44px top padding
- **Android status bar**: 24px top padding
- **Bottom navigation**: 60px + safe area

---

## Accessibility Considerations

### Focus Management

- Logical tab order: top-to-bottom, left-to-right
- Focus indicator: 2px blue ring around elements
- Visible on all interactive elements

### Color Contrast

- All text: 4.5:1 contrast ratio minimum
- Tone buttons: 3:1 contrast ratio minimum
- Icons: Accompanied by text labels

### Touch Targets

- Minimum 44x44px for all interactive elements
- 8px spacing between touch targets
- Large buttons for primary actions

### Text

- Minimum 12px font size
- 1.5x line height
- Clear, simple language

---

## Component Specifications

### Buttons

**Primary Button**
- Height: 44px
- Padding: 12px 16px
- Background: Blue (#007AFF)
- Text: White, 16px, Bold
- Border Radius: 8px
- States: Default, Hover (darker), Pressed (scale 0.98), Disabled (opacity 0.5)

**Secondary Button**
- Height: 44px
- Padding: 12px 16px
- Background: Light gray (#F8F9FA)
- Text: Blue (#007AFF), 16px, Bold
- Border: 1px solid Gray (#E5E7EB)
- Border Radius: 8px

### Input Fields

- Height: 44px
- Padding: 12px
- Border: 1px solid Gray (#E5E7EB)
- Border Radius: 8px
- Focus: Blue border (2px), shadow
- Font: 14px, regular

### Cards

- Background: White
- Border: 1px solid Gray (#E5E7EB)
- Border Radius: 12px
- Padding: 16px
- Shadow: 0px 1px 3px rgba(0,0,0,0.1)
- Hover: Shadow increases

---

## Implementation Priority

### Phase 1 (MVP - Week 1-2)
1. Login/Register screens
2. Home screen
3. Result screen
4. Basic navigation

### Phase 2 (Week 3-4)
1. History screen
2. Analytics screen
3. Bottom navigation
4. Search functionality

### Phase 3 (Week 5-6)
1. Animations
2. Loading states
3. Error handling
4. Polish & refinement

---

## Testing Checklist

- [ ] All screens render correctly on iPhone 12, 13, 14
- [ ] All screens render correctly on Android (various sizes)
- [ ] All buttons are tappable (44x44px minimum)
- [ ] All text is readable (12px minimum)
- [ ] All colors meet contrast requirements
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Loading states work
- [ ] Error messages display correctly
- [ ] Navigation flows work smoothly

