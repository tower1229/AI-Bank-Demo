# Frontend UI Design Specification

This document defines the visual and structural design guidelines for the AI Bank Demo web console. It is based on the provided reference design (Airwallex style) to ensure a modern, clean, and enterprise-grade fintech user interface.

## 1. Overall Vibe & Layout

- **Style**: Enterprise Fintech Dashboard. Clean, professional, high-contrast.
- **Layout Structure**: 
  - **Left Sidebar**: Fixed, dark theme navigation.
  - **Main Content**: Scrollable, light theme background with distinct card-based content areas.
  - **Top Navigation/Header**: Optional context tabs/breadcrumbs above the main content.

## 2. Color Palette

### 2.1 Sidebar (Dark Theme)
- **Sidebar Background**: `#111111` (Very Dark Gray / Near Black)
- **Sidebar Text (Default)**: `#9CA3AF` (Tailwind `gray-400`)
- **Sidebar Text (Active/Hover)**: `#FFFFFF` (White)
- **Sidebar Active Indicator**: Orange `#FF5A00` (Used for brand logo and active tab left border)

### 2.2 Main Content (Light Theme)
- **App Background**: `#F9FAFB` (Tailwind `gray-50`)
- **Surface/Card Background**: `#FFFFFF` (White)
- **Primary Text (Headings, Values)**: `#111827` (Tailwind `gray-900`)
- **Secondary Text (Labels, Table Headers)**: `#6B7280` (Tailwind `gray-500`)
- **Borders & Dividers**: `#E5E7EB` (Tailwind `gray-200`)

### 2.3 Accents & Semantic Colors
- **Primary Action (Buttons, Links)**: Purple `#7C3AED` (Tailwind `violet-600`) - Used for primary actions like "New transfer".
- **Primary Action Hover**: `#6D28D9` (Tailwind `violet-700`)
- **Success / Positive Status**: 
  - Background: `#D1FAE5` (Tailwind `emerald-100`)
  - Text: `#065F46` (Tailwind `emerald-800`)
  - *Example: "Paid" or "Completed" badges.*
- **Error / Destructive**: Red `#DC2626` (Tailwind `red-600`)

## 3. Typography

- **Font Family**: Modern Sans-Serif (e.g., `Inter`, `Roboto`, or system fonts).
- **Headings**: Semi-bold to bold.
- **Data Values (e.g., Balances)**: Large, bold, highly legible (e.g., `text-2xl font-bold`).
- **Table Headers**: Small, medium weight, gray text (e.g., `text-xs font-medium text-gray-500`).

## 4. Component Styles

### 4.1 Panels & Cards
- **Background**: White
- **Border Radius**: `8px` (`rounded-lg`)
- **Shadow/Border**: Subtle shadow (`shadow-sm`) or soft border (`border border-gray-200`).
- **Padding**: Generous internal padding (e.g., `p-6` or `p-8`).

### 4.2 Tables
- **Header Row**: No background or very light gray, text left-aligned, distinct bottom border.
- **Data Rows**: Clear horizontal dividers (`border-b border-gray-100`), adequate vertical padding (`py-4`). Subtle hover state (`hover:bg-gray-50`).

### 4.3 Buttons
- **Primary**: Solid purple background, white text, rounded corners (`rounded-md`), no border.
- **Secondary**: White background, light gray border (`border-gray-300`), dark text, rounded corners.
- **Ghost/Tertiary**: Transparent background, colored or dark text, hover effect.

### 4.4 Inputs & Filters
- **Style**: Outline style, light gray border (`border-gray-300`).
- **Radius**: `rounded-md`.
- **Icons**: Often include leading icons (e.g., search icon, calendar icon) in a muted gray color.

## 5. Development Implementation (Tailwind CSS)

When implementing these styles, prefer using **Tailwind CSS** utility classes as they map perfectly to this design system. 

*Example Tailwind Mapping:*
- Sidebar: `bg-[#111111] text-gray-400`
- Main Canvas: `bg-gray-50`
- Cards: `bg-white rounded-lg shadow-sm border border-gray-200 p-6`
- Primary Button: `bg-violet-600 hover:bg-violet-700 text-white rounded-md px-4 py-2`
- Status Badge (Success): `bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-medium`

---
*Note: Always refer to this document for styling decisions to ensure visual consistency across the bank web console.*
