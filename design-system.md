# LinkedIn Sales Navigator Design System

A comprehensive design system guide for building prototypes aligned with LinkedIn Sales Navigator products.

---

## Table of Contents

1. [Overview](#overview)
2. [Design Principles](#design-principles)
3. [Color System](#color-system)
4. [Typography](#typography)
5. [Spacing & Layout](#spacing--layout)
6. [Component Library](#component-library)
7. [Patterns & Compositions](#patterns--compositions)
8. [Accessibility Guidelines](#accessibility-guidelines)

---

## Overview

LinkedIn Sales Navigator uses a clean, professional design language focused on data density, clarity, and efficient workflows for sales professionals. The design system prioritizes:

- **Information hierarchy** - Clear visual organization of complex sales data
- **Professional aesthetics** - Trustworthy, corporate-friendly appearance
- **Efficiency** - Dense layouts that maximize screen real estate
- **Consistency** - Unified patterns across the entire product

---

## Design Principles

### 1. Information Density
Sales professionals need to see multiple data points simultaneously. Design interfaces that present information efficiently without overwhelming users.

### 2. Professional Polish
Use LinkedIn's signature blue (#0A66C2) sparingly for primary actions and links. Maintain a clean, corporate aesthetic with generous use of white space within dense layouts.

### 3. Context-Aware Display
Provide relevant information based on user context. Show connections, CRM status, and engagement data contextually.

### 4. Progressive Disclosure
Start with essential information and allow users to reveal more details on demand using "Show more" links and expandable sections.

---

## Color System

### Brand Colors

```css
--linkedin-blue: #0A66C2;        /* Primary brand color */
--linkedin-blue-dark: #004182;   /* Hover states */
--linkedin-blue-light: #378FE9;  /* Accents */
```

### Semantic Colors

```css
/* Text Colors */
--text-primary: rgba(0, 0, 0, 0.9);      /* Main content */
--text-secondary: rgba(0, 0, 0, 0.75);   /* Supporting text */
--text-tertiary: rgba(0, 0, 0, 0.6);     /* Metadata, labels */
--text-disabled: rgba(0, 0, 0, 0.3);     /* Disabled states */

/* Success */
--success-primary: #2F7B15;              /* Success icons */
--success-background: #EDF3F8;           /* Success backgrounds */

/* Backgrounds */
--background-primary: #FFFFFF;           /* Main surfaces */
--background-secondary: #F3F2EF;         /* Page background */
--background-tertiary: #EDF3F8;          /* Subtle highlights */
--background-hover: #EDF3F8;             /* Hover states */
--background-selected: #EDF3F8;          /* Selected items */

/* Borders & Dividers */
--border-subtle: rgba(140, 140, 140, 0.2);
--border-standard: rgba(0, 0, 0, 0.08);
--border-emphasis: rgba(0, 0, 0, 0.3);

/* Tag Backgrounds */
--tag-background: rgba(0, 0, 0, 0.08);
--tag-beta: #DDE7F1;
--tag-crm: #EDF3F8;
```

### Usage Guidelines

- **LinkedIn Blue**: Use exclusively for primary CTAs, links, and brand elements
- **Text Colors**: Follow the hierarchy - primary for headlines, secondary for body, tertiary for metadata
- **Backgrounds**: Layer surfaces using subtle backgrounds to create depth
- **Borders**: Use subtle borders (0.2 opacity) for most UI elements

---

## Typography

### Font Families

```css
/* Display & Headlines */
--font-display: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Body Text */
--font-body: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Navigation */
--font-nav: 'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Branding */
--font-brand: 'Community Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Type Scale

```css
/* Display Sizes */
--text-display: 24px;        /* Page titles, entity names */
--text-heading: 20px;        /* Section headings */

/* Body Sizes */
--text-large: 16px;          /* Prominent body text */
--text-base: 14px;           /* Standard body text */
--text-small: 12px;          /* Metadata, tags */

/* Line Heights */
--leading-tight: 1.25;       /* Most text */
--leading-normal: 1.5;       /* Comfortable reading */

/* Letter Spacing */
--tracking-display: 0.36px;  /* 24px text */
--tracking-heading: 0.38px;  /* 20px text */
--tracking-body: -0.32px;    /* 16px text */
--tracking-small: -0.15px;   /* 14px and below */
```

### Typography Styles

#### Page Title
```css
font-family: 'SF Pro Display';
font-size: 24px;
font-weight: 600;
line-height: 1.25;
letter-spacing: 0.36px;
color: rgba(0, 0, 0, 0.9);
```

#### Section Heading
```css
font-family: 'SF Pro Display';
font-size: 20px;
font-weight: 600;
line-height: 1.25;
letter-spacing: 0.38px;
color: rgba(0, 0, 0, 0.9);
```

#### Body Text
```css
font-family: 'SF Pro Text';
font-size: 14px;
font-weight: 400;
line-height: 1.25;
letter-spacing: -0.15px;
color: rgba(0, 0, 0, 0.9);
```

#### Metadata Text
```css
font-family: 'SF Pro Text';
font-size: 14px;
font-weight: 400;
line-height: 1.25;
letter-spacing: -0.15px;
color: rgba(0, 0, 0, 0.6);
```

---

## Spacing & Layout

### Spacing Scale

```css
--space-2: 2px;
--space-4: 4px;
--space-8: 8px;
--space-12: 12px;
--space-16: 16px;
--space-24: 24px;
--space-32: 32px;
--space-48: 48px;
```

### Common Patterns

- **Card Padding**: 24px all sides
- **Tight Spacing**: 4px (inline elements, related items)
- **Standard Spacing**: 8px (list items, form fields)
- **Section Spacing**: 16px (between sections within cards)
- **Component Spacing**: 24px (between major components)

### Layout Grid

- **Sidebar Width**: 318px (left rail for lists)
- **Main Content**: Flexible, typically 586px - 800px
- **Panel Spacing**: 24px between columns
- **Max Container Width**: 1440px

---

## Component Library

### Buttons

#### Primary Button (Medium)
```tsx
<div className="bg-[#0a66c2] content-stretch flex items-center px-[16px] py-[7px] relative rounded-[16px]">
  <div className="content-stretch flex items-center justify-center relative shrink-0">
    <p className="font-['SF_Pro_Text:Semibold',sans-serif] leading-[1.25] not-italic relative shrink-0 text-[14px] text-white tracking-[-0.15px]">
      Button Text
    </p>
  </div>
</div>
```

**Key Characteristics:**
- Border-radius: 16px (fully rounded)
- Padding: 7px vertical, 16px horizontal
- Font: SF Pro Text Semibold 14px
- Background: LinkedIn Blue (#0A66C2)
- Text: White

#### Secondary Button
```tsx
<div className="content-stretch flex items-center px-[16px] py-[7px] relative rounded-[16px]">
  <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.3)] border-solid inset-0 pointer-events-none rounded-[16px]" />
  <div className="content-stretch flex items-center justify-center relative shrink-0">
    <p className="font-['SF_Pro_Text:Semibold',sans-serif] leading-[1.25] not-italic relative shrink-0 text-[14px] text-[rgba(0,0,0,0.75)] tracking-[-0.15px]">
      Button Text
    </p>
  </div>
</div>
```

**Key Characteristics:**
- Border-radius: 16px
- Border: 1px solid rgba(0, 0, 0, 0.3)
- Background: Transparent or white
- Text: rgba(0, 0, 0, 0.75)

#### Disabled Button
```tsx
<div className="bg-[rgba(0,0,0,0.08)] content-stretch flex items-center px-[16px] py-[7px] relative rounded-[16px]">
  <div className="content-stretch flex items-center justify-center relative shrink-0">
    <p className="font-['SF_Pro_Text:Semibold',sans-serif] leading-[1.25] not-italic relative shrink-0 text-[14px] text-[rgba(0,0,0,0.3)] tracking-[-0.15px]">
      Disabled Text
    </p>
  </div>
</div>
```

**Button Sizes:**
- Small: py-[7px]
- Medium: py-[7px] (same as small, differentiated by context)

---

### Tags & Badges

#### BETA Tag
```tsx
<div className="bg-[#dde7f1] content-stretch flex items-center px-[8px] py-[3px] relative rounded-[4px]">
  <p className="font-['SF_Pro_Text:Regular',sans-serif] leading-[1.25] not-italic relative shrink-0 text-[14px] text-[rgba(0,0,0,0.9)] tracking-[-0.15px]">
    BETA
  </p>
</div>
```

#### CRM Badge
```tsx
<div className="bg-[#edf3f8] content-stretch flex items-center px-[8px] py-[2px] relative rounded-[51px]">
  <div className="content-stretch flex gap-[4px] items-center">
    <div className="relative shrink-0 size-[16px]">
      {/* Check icon */}
    </div>
    <p className="font-['SF_Pro_Text:Semibold',sans-serif] leading-[1.25] text-[12px] text-[rgba(0,0,0,0.6)]">
      In CRM
    </p>
  </div>
</div>
```

#### Spotlight Tag
```tsx
<div className="bg-[#edf3f8] content-stretch flex gap-[8px] h-[28px] items-center px-[12px] py-[4px] relative rounded-[100px]">
  <p className="font-['SF_Pro_Text:Regular',sans-serif] leading-[1.25] text-[12px] text-[#38434f]">
    5 mutual connections
  </p>
</div>
```

#### Source Tag (Small)
```tsx
<div className="bg-[rgba(0,0,0,0.08)] content-stretch flex items-center px-[4px] py-px relative rounded-[4px]">
  <p className="font-['SF_Pro_Text:Regular',sans-serif] leading-[1.25] text-[14px] text-center tracking-[-0.15px]">
    <span className="text-[rgba(0,0,0,0.9)]">1. </span>
    <span className="text-[rgba(0,0,0,0.6)]">linkedin.com</span>
  </p>
</div>
```

**Tag Characteristics:**
- **BETA Tags**: Small radius (4px), blue background (#DDE7F1)
- **Spotlight Tags**: Fully rounded (100px), light blue background
- **Source Tags**: Small radius (4px), gray background
- **All Tags**: Use SF Pro Text, typically 12-14px

---

### Cards

#### Standard Card
```tsx
<div className="bg-white relative rounded-[8px]">
  <div aria-hidden="true" className="absolute border border-[rgba(140,140,140,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
  <div className="content-stretch flex flex-col p-[24px] relative">
    {/* Card content */}
  </div>
</div>
```

**Key Characteristics:**
- Background: White
- Border: 1px solid rgba(140, 140, 140, 0.2)
- Border-radius: 8px
- Padding: 24px
- Box-shadow: None (relies on subtle border)

#### Lead Tile (List Item)
```tsx
<div className="h-[111px] relative w-full">
  <div className="content-stretch flex gap-[4px] items-start p-[24px] relative size-full">
    {/* Avatar, name, title, company */}
  </div>
</div>
```

**Selected State:**
```tsx
<div className="bg-[#edf3f8] h-[111px] relative w-full">
  <div className="content-stretch flex gap-[4px] items-start p-[24px] relative size-full">
    {/* Content */}
  </div>
  <div className="absolute bg-[rgba(0,0,0,0.75)] h-[111px] left-0 top-0 w-[4px]" />
</div>
```

**Characteristics:**
- Height: 111px fixed
- Padding: 24px
- Selected: Light blue background + 4px left border (dark)
- Hover: Background changes to #EDF3F8

---

### Avatars & Entity Images

#### Entity Circle (Profile Photo)
```tsx
{/* Small - 24px */}
<div className="relative rounded-[1000px] size-[24px]">
  <img src="..." className="absolute inset-0 object-cover rounded-[1000px] size-full" />
</div>

{/* Medium - 48px */}
<div className="relative rounded-[1000px] size-[48px]">
  <img src="..." className="absolute inset-0 object-cover rounded-[1000px] size-full" />
</div>

{/* Large - 96px (with white border) */}
<div className="relative rounded-[1000px] size-[96px]">
  <img src="..." className="absolute inset-0 object-cover rounded-[1000px] size-full" />
  <div aria-hidden="true" className="absolute border-4 border-solid border-white inset-[-4px] rounded-[1004px]" />
</div>
```

#### Entity Square (Company Logo)
```tsx
{/* Extra Small - 24px */}
<div className="relative rounded-[8px] size-[24px]">
  <img src="..." className="absolute inset-0 object-cover rounded-[8px] size-full" />
</div>

{/* Medium - 48px */}
<div className="relative rounded-[6px] size-[48px]">
  <img src="..." className="absolute inset-0 object-cover rounded-[6px] size-full" />
</div>
```

**Overlapping Avatars:**
```tsx
<div className="content-stretch flex items-center pr-[12px]">
  <div className="mr-[-12px] relative rounded-[8px] size-[24px]">
    <img src="..." />
  </div>
  <div className="mr-[-12px] relative rounded-[8px] size-[24px]">
    <img src="..." />
  </div>
  <div className="mr-[-12px] relative rounded-[8px] size-[24px]">
    <img src="..." />
  </div>
</div>
```

**Avatar Sizes:**
- 24px: List items, tags, connections
- 48px: Lead tiles, standard cards
- 96px: Profile headers, featured content

**Border Radius:**
- Circles: 1000px (fully rounded)
- Squares: 6-8px

---

### Navigation

#### Top Navigation
```tsx
<div className="absolute bg-white inset-[0_0_53.33%_0] overflow-clip">
  {/* Height: 56px */}
  <div className="content-stretch flex gap-[4px] h-[56px] items-center">
    <div className="content-stretch flex h-full items-center px-[8px] py-[14px]">
      <p className="font-['Lato:SemiBold',sans-serif] text-[16px] text-[rgba(0,0,0,0.9)] tracking-[-0.15px]">
        Tab Name
      </p>
    </div>
  </div>
</div>
```

**Active Tab:**
```tsx
<div className="h-[55px] relative">
  <div className="content-stretch flex h-full items-center px-[8px]">
    <p className="font-['Lato:SemiBold',sans-serif] text-[16px] text-[rgba(0,0,0,0.75)]">
      Tab Name
    </p>
  </div>
  <div aria-hidden="true" className="absolute border-b-4 border-black border-solid inset-0 pointer-events-none" />
</div>
```

**Navigation Characteristics:**
- Height: 55-56px
- Font: Lato SemiBold 16px
- Active: 4px bottom border (black)
- Inactive: rgba(0, 0, 0, 0.75)
- Padding: 8px horizontal, 14px vertical

#### Breadcrumb
```tsx
<div className="content-stretch flex gap-[8px] items-center">
  <p className="font-['SF_Pro_Display:Semibold',sans-serif] text-[20px] text-[#0a66c2] tracking-[0.38px]">
    Leads
  </p>
  <div className="relative size-[9px]">
    {/* Chevron icon */}
  </div>
  <p className="font-['SF_Pro_Display:Semibold',sans-serif] text-[20px] text-[rgba(0,0,0,0.9)] tracking-[0.38px]">
    Sales Assistant recommendations
  </p>
</div>
```

---

### Dividers

#### Horizontal Divider
```tsx
<div className="bg-[rgba(0,0,0,0.08)] h-px w-full" />
```

#### Vertical Divider
```tsx
<div className="h-full relative w-px">
  <div className="absolute bg-[rgba(0,0,0,0.08)] bottom-0 left-1/2 top-0 w-px -translate-x-1/2" />
</div>
```

**Usage:**
- Thickness: 1px
- Color: rgba(0, 0, 0, 0.08)
- Full-width for horizontal, full-height for vertical

---

### Icons

#### Icon Sizes
- **16px**: Small icons (checkmarks, chevrons in text)
- **24px**: Standard UI icons (navigation, actions)
- **32px**: Large icons (profile photos in nav)

#### Icon Colors
- **Primary**: rgba(0, 0, 0, 0.6) - Default
- **Success**: #2F7B15 or #01754F
- **Disabled**: rgba(0, 0, 0, 0.3)
- **LinkedIn Blue**: #0A66C2

**Icon Implementation:**
```tsx
<div className="relative size-[16px]">
  <svg className="block size-full" fill="none" viewBox="0 0 16 16">
    <path d="..." fill="rgba(0, 0, 0, 0.6)" />
  </svg>
</div>
```

---

### Dropdowns & Selectors

#### Dropdown Trigger
```tsx
<div className="content-stretch flex gap-[16px] items-center">
  <div className="content-stretch flex flex-[1_0_0] flex-col gap-[2px]">
    <p className="font-['SF_Pro_Text:Regular',sans-serif] text-[14px] text-[rgba(0,0,0,0.6)]">
      FY25Q4 Accounts
    </p>
    <p className="font-['SF_Pro_Text:Semibold',sans-serif] text-[16px] text-[rgba(0,0,0,0.9)]">
      5 of 29 accounts
    </p>
  </div>
  <div className="relative size-[16px]">
    {/* Caret icon */}
  </div>
</div>
```

---

### Lists

#### List Container
```tsx
<div className="content-stretch flex flex-col items-start overflow-x-clip overflow-y-auto w-full">
  {/* List items */}
</div>
```

#### List Item (Lead Tile)
```tsx
<div className="content-stretch flex gap-[16px] items-center w-[270px]">
  <div className="relative rounded-[1000px] size-[48px]">
    <img src="..." className="absolute inset-0 object-cover rounded-[1000px] size-full" />
  </div>
  <div className="content-stretch flex flex-[1_0_0] flex-col gap-[2px]">
    <p className="font-['SF_Pro_Text:Semibold',sans-serif] text-[14px] text-[rgba(0,0,0,0.9)]">
      Name
    </p>
    <p className="font-['SF_Pro_Text:Regular',sans-serif] text-[14px] text-[rgba(0,0,0,0.9)] overflow-hidden text-ellipsis whitespace-nowrap">
      Title
    </p>
    <p className="font-['SF_Pro_Text:Regular',sans-serif] text-[14px] text-[rgba(0,0,0,0.6)] overflow-hidden text-ellipsis whitespace-nowrap">
      Company
    </p>
  </div>
</div>
```

**List Item States:**
- **Default**: White background
- **Hover**: #EDF3F8 background
- **Selected**: #EDF3F8 background + 4px left border

---

## Patterns & Compositions

### Lead Profile Header

A typical lead profile header includes:
1. **Cover Photo** (72px height, cropped)
2. **Profile Photo** (96px circle with white border)
3. **Name & Badge** (24px display text + network degree badge)
4. **Title & Company** (16px body text)
5. **Location** (14px metadata)
6. **Spotlight Tags** (connection count, recent activity)

```tsx
<div className="content-stretch flex flex-col gap-[16px] p-[24px]">
  {/* Cover photo - absolute positioned at top */}
  <div className="absolute h-[72px] left-0 right-0 top-0">
    <img src="..." className="absolute inset-0 object-cover" />
  </div>
  
  {/* Profile photo */}
  <div className="relative z-[1]">
    <div className="relative rounded-[1000px] size-[96px]">
      <img src="..." />
    </div>
  </div>
  
  {/* Name and metadata */}
  <div className="content-stretch flex flex-col gap-[4px]">
    <div className="content-stretch flex gap-[4px] items-center">
      <p className="font-['SF_Pro_Display:Semibold',sans-serif] text-[24px] tracking-[0.36px]">
        Name
      </p>
      <div className="content-stretch flex gap-[4px] items-center">
        <div className="bg-[rgba(0,0,0,0.3)] rounded-[1000px] size-[2px]" />
        <p className="text-[16px]">2nd</p>
      </div>
    </div>
    <p className="text-[16px]">Title @ Company</p>
    <p className="text-[14px] text-[rgba(0,0,0,0.6)]">Location</p>
  </div>
  
  {/* Spotlight tags */}
  <div className="content-start flex flex-wrap gap-[8px]">
    {/* Tags */}
  </div>
</div>
```

---

### Account List Selector

Displays account list with company logos and count:

```tsx
<div className="bg-white content-stretch flex h-[88px] items-center justify-between p-[24px] rounded-[8px]">
  <div className="content-stretch flex gap-[16px] items-center">
    {/* Overlapping company logos */}
    <div className="content-stretch flex items-center pr-[12px]">
      <div className="mr-[-12px] relative rounded-[8px] size-[24px]">
        <img src="logo1.png" />
      </div>
      <div className="mr-[-12px] relative rounded-[8px] size-[24px]">
        <img src="logo2.png" />
      </div>
      <div className="mr-[-12px] relative rounded-[8px] size-[24px]">
        <img src="logo3.png" />
      </div>
    </div>
    
    {/* Label */}
    <div className="content-stretch flex flex-col gap-[2px]">
      <p className="text-[14px] text-[rgba(0,0,0,0.6)]">FY25Q4 Accounts</p>
      <p className="text-[16px] font-semibold">5 of 29 accounts</p>
    </div>
    
    {/* Dropdown icon */}
    <div className="relative size-[16px]">{/* Caret */}</div>
  </div>
</div>
```

---

### Info Card with Disclaimer

For AI-generated content:

```tsx
<div className="content-stretch flex flex-col gap-[4px]">
  <p className="font-['SF_Pro_Display:Semibold',sans-serif] text-[20px] tracking-[0.38px]">
    Lead IQ
  </p>
  <p className="font-['SF_Pro_Text:Regular',sans-serif] text-[14px] tracking-[-0.15px]">
    <span className="text-[rgba(0,0,0,0.6)]">
      This feature is powered by AI and mistakes are possible. Please check the information for accuracy. 
    </span>
    <span className="font-['SF_Pro_Text:Semibold',sans-serif] text-[#0a66c2]">
      Learn more
    </span>
  </p>
</div>
```

---

### Role/Position Display

Standard format for work experience:

```tsx
<div className="content-stretch flex gap-[8px] items-start">
  {/* Company logo */}
  <div className="relative rounded-[6px] size-[48px]">
    <img src="..." />
  </div>
  
  {/* Text content */}
  <div className="content-stretch flex flex-col gap-[2px]">
    <p className="font-['SF_Pro_Text:Semibold',sans-serif] text-[16px] tracking-[-0.32px]">
      VP, Business Development
    </p>
    
    {/* Company and type */}
    <div className="content-center flex flex-wrap gap-[0px_8px] items-center">
      <p className="text-[14px]">Mintome.AI</p>
      <div className="bg-[rgba(0,0,0,0.3)] rounded-[1000px] size-[2px]" />
      <p className="text-[14px]">Full-time</p>
    </div>
    
    {/* Duration */}
    <div className="content-center flex flex-wrap gap-[0px_8px] items-center">
      <p className="text-[14px] text-[rgba(0,0,0,0.6)]">June 2021 - Present</p>
      <div className="bg-[rgba(0,0,0,0.3)] rounded-[1000px] size-[2px]" />
      <p className="text-[14px] text-[rgba(0,0,0,0.6)]">3 yrs 9 mos</p>
    </div>
    
    <p className="text-[14px] text-[rgba(0,0,0,0.6)]">Denver, CO</p>
  </div>
</div>
```

**Pattern Notes:**
- Use 2px dots as separators between metadata
- Keep consistent spacing (8px) for metadata items
- Always show duration in relative format (X yrs Y mos)

---

### Last Activity Card

```tsx
<div className="bg-white relative rounded-[8px]">
  <div aria-hidden="true" className="absolute border border-[rgba(140,140,140,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
  <div className="flex flex-row items-center size-full">
    <div className="content-stretch flex items-center p-[16px]">
      <p className="font-['SF_Pro_Text:Regular',sans-serif] text-[14px] tracking-[-0.15px]">
        You last viewed Lily on 3/7/2025
      </p>
    </div>
  </div>
</div>
```

---

## Accessibility Guidelines

### Color Contrast

All text must meet WCAG AA standards:
- **Large text (18px+)**: Minimum 3:1 contrast
- **Normal text**: Minimum 4.5:1 contrast

Our color system achieves:
- `rgba(0, 0, 0, 0.9)` on white: ~20:1 (Excellent)
- `rgba(0, 0, 0, 0.75)` on white: ~15:1 (Excellent)
- `rgba(0, 0, 0, 0.6)` on white: ~10:1 (Good)
- LinkedIn Blue on white: ~8:1 (Good)

### Focus States

Always include focus indicators:
```css
outline: 2px solid var(--linkedin-blue);
outline-offset: 2px;
```

### Screen Readers

- Use `aria-hidden="true"` for decorative elements (borders, dividers)
- Include proper `alt` text for images
- Use semantic HTML (nav, main, aside, article)
- Label interactive elements properly

### Keyboard Navigation

- Ensure all interactive elements are keyboard accessible
- Maintain logical tab order
- Provide keyboard shortcuts for common actions
- Support arrow key navigation in lists

---

## Implementation Examples

### Full Lead Tile Component

```tsx
export function LeadTile({ lead, isSelected }) {
  return (
    <div className={`h-[111px] relative w-full ${isSelected ? 'bg-[#edf3f8]' : ''}`}>
      <div className="content-stretch flex gap-[16px] items-center p-[24px] relative size-full">
        {/* Avatar */}
        <div className="relative rounded-[1000px] shrink-0 size-[48px]">
          <img 
            src={lead.avatar} 
            alt={lead.name}
            className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[1000px] size-full" 
          />
        </div>
        
        {/* Text content */}
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start justify-center leading-[1.25] min-h-px min-w-px not-italic text-[14px] tracking-[-0.15px]">
          <p className="font-['SF_Pro_Text:Semibold',sans-serif] relative shrink-0 text-[rgba(0,0,0,0.9)] w-full whitespace-pre-wrap">
            {lead.name}
          </p>
          <p className="font-['SF_Pro_Text:Regular',sans-serif] overflow-hidden relative shrink-0 text-[rgba(0,0,0,0.9)] text-ellipsis w-full whitespace-nowrap">
            {lead.title}
          </p>
          <p className="font-['SF_Pro_Text:Regular',sans-serif] overflow-hidden relative shrink-0 text-[rgba(0,0,0,0.6)] text-ellipsis w-full whitespace-nowrap">
            {lead.company}
          </p>
        </div>
        
        {/* Success indicator (if applicable) */}
        {lead.inCRM && (
          <div className="relative shrink-0 size-[16px]">
            <svg className="block size-full" fill="none" viewBox="0 0 14 14">
              <path d="..." fill="#01754F" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute bg-[rgba(0,0,0,0.75)] h-[111px] left-0 top-0 w-[4px]" />
      )}
    </div>
  );
}
```

---

## Best Practices

### Do's ✅

1. **Use the LinkedIn Blue sparingly** - Only for primary actions and links
2. **Maintain consistent spacing** - Follow the 8px grid system
3. **Show data density** - Sales professionals need lots of information
4. **Use subtle borders** - Avoid heavy shadows, use thin borders instead
5. **Provide context** - Show mutual connections, CRM status, activity
6. **Support progressive disclosure** - "Show more" links for additional details
7. **Include metadata separators** - Use 2px dots between metadata items
8. **Follow text hierarchy** - Primary (0.9), Secondary (0.75), Tertiary (0.6)

### Don'ts ❌

1. **Don't use heavy shadows** - LinkedIn design is flat with subtle depth
2. **Don't mix font families** - Stick to SF Pro Display/Text and Lato
3. **Don't ignore spacing system** - Always use multiples of 4px/8px
4. **Don't use LinkedIn Blue everywhere** - It loses impact when overused
5. **Don't hide important information** - Make key data visible at a glance
6. **Don't use non-semantic markup** - Use proper HTML elements
7. **Don't forget hover states** - Show feedback on interactive elements
8. **Don't use custom icons** - Use LinkedIn's icon system

---

## Component Checklist

When building new components, ensure:

- [ ] Colors match the defined palette
- [ ] Typography follows the scale and weights
- [ ] Spacing uses the defined scale (4px, 8px, 16px, 24px)
- [ ] Border radius is consistent (4px, 8px, 16px for buttons, 1000px for circles)
- [ ] Borders use rgba(140, 140, 140, 0.2) for subtle outlines
- [ ] Hover states are implemented (#EDF3F8 background)
- [ ] Selected states show 4px left border
- [ ] Focus states are visible and accessible
- [ ] Text has proper contrast (WCAG AA minimum)
- [ ] Images have alt text
- [ ] Decorative elements have aria-hidden="true"
- [ ] Component is keyboard accessible
- [ ] Responsive behavior is considered

---

## Resources & Tools

### Design Tokens
All design tokens are available in `/src/styles/theme.css`

### Component Library
Pre-built UI components are in `/src/app/components/ui/`

### Example Implementation
See `/src/imports/SmallerAgentPanelUpdatedCopy.tsx` for a complete example

### Fonts
- SF Pro Display & Text: System fonts on macOS/iOS
- Lato: Available via Google Fonts
- Community Pro: LinkedIn brand font (may require license)

---

## Version History

**Version 1.0** - February 2026
- Initial design system documentation
- Complete component library
- Accessibility guidelines
- Implementation examples

---

## Contributing

When contributing to this design system:

1. **Document new patterns** - Add examples and usage guidelines
2. **Maintain consistency** - Follow established conventions
3. **Consider accessibility** - Test with screen readers and keyboard
4. **Provide examples** - Include code snippets and visual references
5. **Update this guide** - Keep documentation current with changes

---

## Contact & Support

For questions or suggestions about this design system:
- Review the example component in `/src/imports/`
- Check existing UI components in `/src/app/components/ui/`
- Follow LinkedIn's official design guidelines
- Maintain brand consistency with LinkedIn Sales Navigator

---

*This design system is based on analysis of LinkedIn Sales Navigator interface patterns and is intended to help AI tools and developers build consistent, professional prototypes aligned with LinkedIn's design language.*
