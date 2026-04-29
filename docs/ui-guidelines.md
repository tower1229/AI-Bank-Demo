# Frontend UI Design Specification

This document defines the visual and structural design guidelines for the AI Bank Demo web console. It is based on the provided reference design (Airwallex style) to ensure a modern, clean, and enterprise-grade fintech user interface.

## 1. Overall Vibe & Layout

- **Style**: Enterprise Fintech Dashboard. Clean, professional, high-contrast.
- **Layout Structure**: 
  - **Left Sidebar**: Fixed, dark theme navigation. Logo and brand name are placed at the absolute bottom.
  - **Main Content**: Scrollable, light theme background with distinct card-based content areas.
  - **Top Header**: Minimal header, often using sub-tabs (like "Summary", "Settings") rather than giant page titles.

## 2. Color Palette

### 2.1 Sidebar (Dark Theme)
- **Sidebar Background**: `#111111` (Very Dark Gray / Near Black)
- **Sidebar Text (Default)**: `#9CA3AF` (Tailwind `gray-400`)
- **Sidebar Text (Active/Hover)**: `#FFFFFF` (White)
- **Sidebar Active Indicator**: Orange `#FF5A00` (Used for brand logo and active tab left border or text)
- **Sidebar Active Background**: `#1F1F1F` (Slightly lighter dark gray)

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
- **Data Values (e.g., Balances)**: Large, bold, highly legible (e.g., `text-2xl font-bold` or `text-3xl`).
- **Table Headers**: Small, medium weight, gray text (e.g., `text-xs font-medium text-gray-500`).

## 4. Component Styles

### 4.1 Panels & Cards
- **Background**: White
- **Border Radius**: `8px` (`rounded-lg`)
- **Shadow/Border**: Subtle shadow (`shadow-sm`) or soft border (`border border-gray-200`).
- **Padding**: Generous internal padding (e.g., `p-6`).

### 4.2 Tables
- **Header Row**: No background, text left-aligned, distinct bottom border. Use `text-xs uppercase`.
- **Data Rows**: Clear horizontal dividers (`border-b border-gray-100`), adequate vertical padding (`py-4`). Subtle hover state (`hover:bg-gray-50`).
- **Checkboxes**: Often present on the left of table rows for selection.

### 4.3 Buttons
- **Primary**: Solid purple background, white text, rounded corners (`rounded-md`), no border. Min-height `36px` or `40px`.
- **Secondary**: White background, light gray border (`border-gray-300`), dark text, rounded corners.
- **Ghost/Tertiary**: Transparent background, colored or dark text, hover effect.

### 4.4 Navigation Tabs (Main Content)
- **Page Header**: Use one compact shell header per route: a small breadcrumb row above a single page title with the section icon. Do not stack breadcrumbs, a text back link, and a tab-style title in the same header.
- **Top Sub-tabs**: Use horizontal sub-tabs only when a single business record has multiple peer views. Do not use a one-item tab merely to repeat the current page title.
- **Breadcrumbs and Back Navigation**: The app shell owns breadcrumbs for every nested route. The parent breadcrumb is the return path; create/detail pages must not implement separate duplicate back links inside the page body.
- **Parent Highlighting**: Sidebar navigation must keep the parent section highlighted for nested routes such as `/client-book/:customerId`, `/payments/new`, and `/investment-orders/new`.

### 4.5 Page Structure and Routing
- **List/Queue Pages**: Operational pages such as client books, onboarding queues, payment instructions, product shelves, and audit logs should prioritize existing records in tables or searchable lists. Do not place create/edit forms or detail panels beside the list on the same route.
- **Workflow Context**: Do not combine unrelated lists merely because a form will eventually need both. For example, Investment Orders should start from a Product Shelf table with a `Book order` action per product; funding account selection belongs inside the order-entry route.
- **Operational Landing Pages**: A transaction function should land on its operational record list. For example, Payments should show payment/transfer instruction history first; funding account lookup belongs inside the payment creation flow or a separate account selector, not as the primary landing-page content.
- **Detail Pages**: Record details must open on a dedicated route, usually `<section-route>/<id>`. For example, client portfolio details use `/client-book/:customerId`, not a side-by-side panel next to the client list.
- **Create/Edit Pages**: New data entry flows must open on a dedicated route, usually `<section-route>/new` for create flows and `<section-route>/<id>/edit` for edits when implemented.
- **Primary Actions**: List pages should expose one clear primary action in the page header or table toolbar, such as `New application`, `New payment`, or `New order`, linking to the dedicated form route.
- **Form Width**: Dedicated create/edit pages should use a constrained single-column form container (`max-w-3xl`) with Cancel and final Submit/Book/Execute actions.
- **Form Section Titles**: Do not repeat the page title inside the form card. The card header should name the business section, such as `Applicant Profile`, `Transfer Details`, or `Order Details`.
- **Client Selection**: Operator-facing forms must ask for client names, not account numbers or internal ids. Use a typeahead dropdown while the operator types, show matching client names with risk/balance context, and let the service layer resolve the selected client to the underlying USD account.
- **Route Naming**: Use private-banking domain routes and labels. Current standards are `/dashboard`, `/client-lifecycle`, `/client-lifecycle/new`, `/client-book`, `/client-book/:customerId`, `/payments`, `/payments/new`, `/investment-orders`, `/investment-orders/new`, and `/audit-log`.
- **Backwards Compatibility**: If route names are changed, keep redirects from old demo routes so shared links continue to work.

## 5. Development Implementation (Tailwind CSS)

When implementing these styles, prefer using **Tailwind CSS** utility classes as they map perfectly to this design system. 

*Example Tailwind Mapping:*
- Sidebar: `bg-[#111111] text-gray-400`
- Sidebar Logo Area: Placed at `mt-auto` (bottom of flex column).
- Main Canvas: `bg-gray-50`
- Cards: `bg-white rounded-lg shadow-sm border border-gray-200 p-6`
- Primary Button: `bg-violet-600 hover:bg-violet-700 text-white rounded-md px-4 py-2`
- Status Badge (Success): `bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md text-xs font-medium` (Notice it's slightly rounded `rounded-md` in Airwallex, not fully pill-shaped).

---
*Note: Always refer to this document for styling decisions to ensure visual consistency across the bank web console.*
