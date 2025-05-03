# McShop - Self-Service Terminal

A modern web application built with Vue 3, TypeScript, and Vite that simulates a McDonald's self-service terminal.

## Features

- Browse products with images, prices, and descriptions
- View product details
- Add products to cart
- Manage cart quantities
- Checkout process with customer information
- Payment options (immediate or on pickup)
- Order confirmation with order number
- Responsive design
- TypeScript support
- State management with Pinia
- Vue Router for navigation

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd mcshop
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory (optional):
```env
VITE_API_BASE_URL=your-api-url
```

## Development

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building for Production

To build the application for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment

The application is configured for deployment on Vercel. Simply connect your repository to Vercel and it will automatically deploy your application.

## API Integration

The application includes a mock API for development purposes. To use a real API:

1. Set the `VITE_API_BASE_URL` environment variable to your API endpoint
2. Ensure your API implements the following endpoints:
   - GET `/products` - Returns an array of products
   - POST `/orders` - Accepts order data and returns an order number

## Project Structure

```
src/
  ├── components/     # Reusable components
  ├── views/         # Page components
  ├── stores/        # Pinia stores
  ├── services/      # API services
  ├── types/         # TypeScript types
  ├── router/        # Vue Router configuration
  ├── App.vue        # Root component
  └── main.ts        # Application entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
