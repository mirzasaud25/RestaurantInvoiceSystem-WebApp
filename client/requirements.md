## Packages
framer-motion | For smooth animations in the POS cart and modals
lucide-react | For high-quality icons

## Notes
- The app uses a local React Context to store Cashier session details (Name, ID, Counter).
- The dashboard automatically creates an invoice on the backend when the first item is clicked for a new sale.
- Calculations for subtotal, tax, and discount are processed live on the frontend to ensure a snappy user experience before final checkout.
- Currency is formatted generically, assuming the `price` field integers represent base currency units (e.g. dollars or rupees).
