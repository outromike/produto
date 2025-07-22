# **App Name**: Product Lookup

## Core Features:

- Secure Login: User authentication via token-based system, verifying credentials against a `users.json` file for secure access to product data.
- Product Search: Displays a search bar allowing users to find products by SKU, description, or category.
- Advanced Filtering: Offers dynamic filtering options for refining product searches by unit (ITJ/JVL), ABC classification, and packaging type (UNIDADE/MASTER).
- Product Grid: Presents product information in an accessible grid format, enhanced with pagination for improved navigation.
- Barcode Copy: Enables users to copy product bar codes for easy sharing or reference.
- AI Product Suggestions: An AI tool helps the user locate alternative or similar items by intuitively parsing product attributes. If the tool decides that matches cannot be found based on available information, the system will offer other search options.
- Screen Transitions: Smooth transitions on the screen provide a delightful user experience

## Style Guidelines:

- Primary color: HSL(210, 60%, 50%) – a vibrant blue, converted to Hex: #4784FF for a modern, trustworthy feel.
- Background color: HSL(210, 20%, 95%) – a very light blue-tinted gray, converted to Hex: #F2F4FF providing a clean backdrop.
- Accent color: HSL(180, 50%, 50%) – a teal leaning more towards green, converted to Hex: #40BFBF offering a fresh contrast.
- Body font: 'Inter' sans-serif for clear and readable text.
- Headline font: 'Space Grotesk' sans-serif for a tech-forward feel.
- Modern line icons (Lucide-react or React Icons) for visual representation of product attributes.
- Cards with rounded borders and subtle shadows for an engaging interface.
- Light animations (Framer Motion) for a smooth user experience (e.g., card hover effects, screen transitions).