# GoldBill Pro - Professional Gold Trading System

## Overview

GoldBill Pro is a comprehensive gold trading and invoice management system designed for jewelry businesses and gold dealers. The application provides tools for customer management, gold purity calculations, professional invoice generation, and transaction history tracking. Built with modern web technologies, it offers a professional interface for managing gold-related business operations with features like real-time gold calculations, customizable invoicing, and detailed customer records.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type-safe development
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

### Backend Architecture
- **Runtime**: Node.js with Express.js REST API server
- **Language**: TypeScript with ES modules for modern JavaScript features
- **API Pattern**: RESTful endpoints with JSON responses
- **Error Handling**: Centralized error middleware with structured error responses
- **Request Logging**: Custom middleware for API request/response logging

### Data Storage Solutions
- **Database**: PostgreSQL with Neon serverless database hosting
- **ORM**: Drizzle ORM for type-safe database queries and schema management
- **Schema Definition**: Shared schema between client and server using Drizzle-Zod
- **Connection**: Connection pooling with @neondatabase/serverless driver
- **Migrations**: Drizzle Kit for database schema migrations

### Database Schema Design
- **Customers Table**: Stores customer information with unique customer IDs, contact details, and addresses
- **Gold Calculations Table**: Records gold weight, purity percentages, rates, and calculated values
- **Invoices Table**: Contains invoice details with JSON-stored line items, tax calculations, and status tracking
- **Relationships**: Foreign key relationships between customers and their calculations/invoices

### Authentication and Authorization
- Currently implemented without authentication (single-user system)
- Session management structure in place for future multi-user implementation
- No role-based access control implemented

### Development and Deployment
- **Development**: Hot module replacement with Vite dev server
- **Production Build**: Separate client and server builds with esbuild for server bundling
- **Environment**: Environment-based configuration for database connections
- **Asset Management**: Vite handles static asset optimization and bundling

### Business Logic Architecture
- **Gold Calculations**: Precise decimal calculations for gold purity and value computations
- **Invoice Generation**: Dynamic invoice creation with tax calculations and professional formatting
- **Customer Management**: Search and filtering capabilities with pagination
- **Dashboard Analytics**: Real-time statistics and business metrics

### Code Organization
- **Monorepo Structure**: Client, server, and shared code in single repository
- **Shared Types**: Common TypeScript interfaces and schemas between frontend and backend
- **Component Architecture**: Reusable UI components with consistent styling patterns
- **API Layer**: Centralized API request handling with React Query integration

## External Dependencies

### Database and Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database toolkit for PostgreSQL interactions

### UI and Styling
- **Radix UI**: Headless component primitives for accessibility and customization
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Icon library for consistent iconography
- **shadcn/ui**: Pre-built component library with Radix UI and Tailwind CSS

### Development Tools
- **Vite**: Build tool with TypeScript support and hot module replacement
- **ESBuild**: Fast JavaScript bundler for production server builds
- **TypeScript**: Static type checking for development safety

### Data Management
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Form state management with validation
- **Zod**: Runtime type validation and schema definition
- **date-fns**: Date manipulation and formatting utilities

### Server Dependencies
- **Express.js**: Web application framework for REST API
- **ws**: WebSocket library for Neon database connections
- **connect-pg-simple**: PostgreSQL session store for future authentication

### Build and Runtime
- **tsx**: TypeScript execution for development server
- **PostCSS**: CSS processing with Autoprefixer for vendor prefixes
- **Class Variance Authority**: Utility for conditional CSS class composition