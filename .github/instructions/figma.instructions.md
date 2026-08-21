# Figma MCP Integration Guidelines

## Overview

This guide covers how to use Figma MCP (Model Context Protocol) server to integrate design and code for the TacoHouse project.

**Current State**: Project uses component-based design in code (shadcn/ui + Tailwind). Figma integration is **optional** for:

- Creating visual mockups of new features
- Maintaining design system documentation
- Design-to-code workflows
- Component library management

---

## When to Use Figma MCP

### ✅ Good Use Cases

1. **New Feature Design**
   - Designer creates mockup in Figma
   - Developer uses `get_design_context` to extract component layout
   - Maps existing shadcn/ui components to design

2. **Design System Updates**
   - Update colors/spacing in Figma
   - Export tokens to frontend
   - Regenerate component variants

3. **Component Documentation**
   - Store visual examples in Figma
   - Use Code Connect to map Figma to React components
   - Auto-document component props

4. **Cross-Team Handoff**
   - Designers maintain Figma file
   - Developers reference design specs
   - Reduce design-dev miscommunication

### ❌ Skip Figma For

- Simple CRUD layouts (use Tailwind directly)
- Routine component iterations
- Emergency bug fixes
- Backend-only changes

---

## Setup: Creating a Design File

### 1. Create or Link Figma File

```bash
# Option A: Use existing TacoHouse Figma file
# Link: figma.com/design/[fileKey]/TacoHouse

# Option B: Create new file for specific feature
# Example: Payments Module Designs
```

### 2. Organize Figma Structure

**Recommended Structure**:

```
TacoHouse Design System (root file)
├── 📄 Foundations
│   ├── Colors
│   ├── Typography
│   └── Spacing
├── 📄 Components
│   ├── Forms (Room, Building, Bill)
│   ├── Tables (Rooms, Bills, Rentals)
│   ├── Dialogs (Confirm, Forms)
│   └── Cards (RoomCard, BillCard)
├── 📄 Pages
│   ├── Dashboard
│   ├── Rooms Management
│   ├── Bills & Payments
│   └── Maintenance
└── 📄 Screens
    ├── Mobile mockups
    └── Responsive variations
```

### 3. Link Figma Components to shadcn/ui

When designing:

- Use Figma's component system
- Name components to match React components:
  - Figma: `Button/Primary` → React: `Button` with `variant="primary"`
  - Figma: `Input/Text` → React: `Input` component
  - Figma: `Dialog/Form` → React: `Dialog` + form inside

---

## Design-to-Code Workflow

### Step 1: Get Design Context

When you have a Figma design ready:

```typescript
// Use this in Copilot to extract design info:
// Input: Figma file URL or fileKey + nodeId
// Output: Component structure, layout, properties

// Example Figma URL:
// figma.com/design/abc123/TacoHouse?node-id=142:2045
// Extract: fileKey='abc123', nodeId='142:2045'
```

### Step 2: Map to Existing Components

**Use existing shadcn/ui components**:

```typescript
// Design: "Room Form" → Code: React Hook Form + shadcn/ui

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField } from '@/components/ui/form';

export function RoomForm() {
  const form = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
  });

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="number"
        render={({ field }) => (
          <div className="space-y-2">
            <label>Room Number</label>
            <Input {...field} placeholder="101" />
          </div>
        )}
      />
      <Button type="submit">Create Room</Button>
    </Form>
  );
}
```

### Step 3: Match Tailwind Styling

**From Figma design to Tailwind**:

```typescript
// Figma: Box with 16px padding, rounded corners, light gray background
// Tailwind:
<div className="p-4 rounded-lg bg-gray-50">
  {/* content */}
</div>

// Figma: Grid with 4 columns, 16px gap
// Tailwind:
<div className="grid grid-cols-4 gap-4">
  {/* items */}
</div>
```


---

## Design Tokens (Future Enhancement)

### Export from Figma

When design system becomes complex:

1. **Define variables in Figma**:
   - Colors: `Primary`, `Secondary`, `Neutral`
   - Spacing: `xs`, `sm`, `md`, `lg`
   - Typography: `Heading1`, `Body`, `Caption`

2. **Export as CSS Variables**:

   ```css
   :root {
     --color-primary: #4f46e5;
     --color-secondary: #7c3aed;
     --spacing-sm: 0.5rem;
     --spacing-md: 1rem;
     --font-heading: "Inter", sans-serif;
   }
   ```

3. **Use in Tailwind**:
   ```typescript
   // tailwind.config.ts
   export default {
     theme: {
       colors: {
         primary: "var(--color-primary)",
         secondary: "var(--color-secondary)",
       },
     },
   };
   ```

---

## Figma + Code Workflow Example

### Scenario: Add Payment Confirmation Screen

1. **Designer**: Creates mockup in Figma
   - Layout: Card with success icon, amount, date
   - Components: Button (Download Receipt), Button (Back)
   - Colors: Green success state, neutral grays

2. **Developer**: Get design context

   ```typescript
   // Extract: 3-column layout, use Card + Button + Icon
   // Check: Colors match Tailwind theme
   ```

3. **Implement in React**:

   ```typescript
   'use client';
   import { Card } from '@/components/ui/card';
   import { Button } from '@/components/ui/button';
   import { CheckCircle } from 'lucide-react';

   export function PaymentConfirmation({ payment }) {
     return (
       <Card className="max-w-md mx-auto p-6 text-center">
         <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
         <h2 className="text-xl font-bold">Payment Successful</h2>
         <p className="text-gray-600 mt-2">
           Amount: {payment.amount} VND
         </p>
         <p className="text-sm text-gray-500">Date: {payment.date}</p>
         <div className="flex gap-2 mt-6">
           <Button variant="secondary" onClick={downloadReceipt}>
             Download Receipt
           </Button>
           <Button onClick={goBack}>Back to Bills</Button>
         </div>
       </Card>
     );
   }
   ```

4. **Optional**: Link in Code Connect
   - Figma design stays source of truth for visuals
   - Developers update React component
   - Code Connect shows the mapping

---

## Best Practices

✅ **Do**:

- Keep Figma file organized and up-to-date
- Use component variants for different states (hover, disabled, loading)
- Document component props in Figma
- Link related Figma components to React components
- Version designs (separate branches or files for iterations)

❌ **Don't**:

- Create Figma mockups without planning implementation
- Over-design simple CRUD forms (Tailwind is fast enough)
- Forget to update Figma after code changes
- Use Figma components that don't map to React equivalents
- Store implementation details in Figma (that's code's job)

---

## Tools & Resources

**MCP Server Features**:

- `get_design_context` - Extract component structure from design
- `get_screenshot` - Get visual rendering of design
- `generate_figma_design` - Generate Figma from code (reverse direction)
- `upload_assets` - Upload design assets to Figma
- `get_code_connect_map` - View Figma↔React mappings

**Figma Plugins**:

- Figma to React Code - Auto-generate React from Figma
- Design Tokens - Export design variables
- Storybook - Integrate Figma with component library

**Documentation**:

- [Figma MCP Server Docs](figma.com/developers/api)
- [Code Connect Guide](figma.com/developers/code-connect)
- [Design Token Format](design-tokens.github.io)

---

## Current Project State

**TacoHouse Design System**:

- ✅ shadcn/ui (40+ base components)
- ✅ Tailwind CSS v4 (utility-first styling)
- ✅ Custom form components (React Hook Form integration)
