# Architecture Overview

## Overview

This repository contains a full-stack web application called "Saraat AI", which appears to be a fitness and wellness tracking application. The application follows a client-server architecture with a React frontend and Node.js backend. It uses a PostgreSQL database for data storage and integrates with various external services for features like food analysis, exercise tracking, and payments.

The application allows users to track their diet, exercise, and wellness journey, providing features such as food scanning and analysis, exercise logging, nutritional calculations, and subscription management.

## System Architecture

Saraat AI follows a modern web application architecture with the following components:

1. **Frontend**: React-based single-page application (SPA) using TypeScript
2. **Backend**: Express.js server on Node.js with TypeScript
3. **Database**: PostgreSQL with Drizzle ORM for schema management and migrations
4. **Authentication**: Firebase Authentication (partial implementation)
5. **API Layer**: REST API endpoints for data exchange between frontend and backend
6. **External Integrations**: Stripe for payments, AI services for food image analysis

### Architecture Diagram

```
┌────────────────┐      ┌─────────────────┐      ┌────────────────┐
│                │      │                 │      │                │
│  React Client  │ <──> │  Express Server │ <──> │   PostgreSQL   │
│  (TypeScript)  │      │   (TypeScript)  │      │   Database     │
│                │      │                 │      │                │
└────────────────┘      └─────────────────┘      └────────────────┘
        │                       │                        
        │                       │                        
        ▼                       ▼                        
┌────────────────┐      ┌─────────────────┐             
│                │      │                 │             
│    Firebase    │      │  External APIs  │             
│ Authentication │      │  (Stripe, AI)   │             
│                │      │                 │             
└────────────────┘      └─────────────────┘             
```

## Key Components

### Frontend (Client)

The frontend is built with React and TypeScript, using a component-based architecture:

1. **Main Application Structure**:
   - Located in `client/src/` directory
   - Entry point: `main.tsx` and `App.tsx`
   - Uses React Router for navigation (`wouter` library)
   - Leverages the Shadcn UI component library with Tailwind CSS for styling

2. **Pages and Components**:
   - Pages are organized in `client/src/pages/` directory
   - Reusable UI components in `client/src/components/`
   - Feature-specific components within respective page directories

3. **State Management**:
   - React Context API for global state (`AuthContext`, `LanguageContext`, `DataSyncContext`)
   - React Query for server state management and data fetching
   - Local storage for persisting user preferences and temporary data

4. **API Communication**:
   - Custom `apiRequest` utility for standardized API calls
   - React Query for caching, refetching, and managing server state

### Backend (Server)

The backend is an Express.js application written in TypeScript:

1. **API Routes**:
   - Organized in `server/routes/` directory
   - Includes endpoints for food analysis, exercise tracking, payments, and user management
   - REST API design for client-server communication

2. **Database Interaction**:
   - Uses Drizzle ORM for database schema management and querying
   - Schema defined in `shared/schema.ts`
   - PostgreSQL connection through NeonDB's serverless client (`@neondatabase/serverless`)

3. **Business Logic**:
   - Services for food analysis, exercise calculations, and payment processing
   - Storage interface for data persistence operations

4. **Development Tools**:
   - Vite for development server and HMR
   - Custom middleware for serving static assets and handling development mode

### Database

The application uses PostgreSQL with Drizzle ORM:

1. **Schema**:
   - Defined in `shared/schema.ts`
   - Main tables: `users`, `meals`
   - Uses Zod for schema validation

2. **Connection**:
   - Uses NeonDB's serverless PostgreSQL client
   - Configuration via environment variables

3. **Migrations**:
   - Managed through Drizzle Kit
   - Migration scripts defined in `drizzle.config.ts`

### Authentication

The application implements authentication using Firebase:

1. **Firebase Authentication**:
   - Email/password and Google sign-in methods
   - User state managed through `AuthContext`
   - Firebase config in `client/src/lib/firebase.ts`

2. **User Management**:
   - User profiles stored in PostgreSQL
   - Firestore integration for real-time data (partially implemented)

## Data Flow

1. **Authentication Flow**:
   - User authentication through Firebase Auth
   - Creation of user profile in the database upon registration
   - JWT tokens for maintaining authenticated sessions

2. **Food Tracking Flow**:
   - User can manually log food or scan food with camera
   - Food images analyzed via AI services (Grok API)
   - Nutritional data calculated and stored in database
   - User interface updates to reflect new data

3. **Exercise Tracking Flow**:
   - User logs exercises through UI
   - System calculates calories burned based on exercise type, duration, and intensity
   - Exercise data stored in database
   - Analytics updated to reflect new exercise data

4. **Subscription/Payment Flow**:
   - User selects subscription plan (monthly/yearly)
   - Stripe Checkout Session created on server
   - User redirected to Stripe for payment
   - Webhook handling for payment confirmation

## External Dependencies

### Frontend Dependencies

1. **UI Components**:
   - Radix UI: Accessible component primitives
   - Shadcn UI: Component library based on Radix and Tailwind
   - Tailwind CSS: Utility-first CSS framework

2. **State Management & Data Fetching**:
   - TanStack Query (React Query): Server state management
   - React Hook Form: Form state management
   - Zod: Schema validation

3. **Routing & Navigation**:
   - Wouter: Lightweight router for React

### Backend Dependencies

1. **Server & Middleware**:
   - Express.js: Web server framework
   - CORS middleware: For cross-origin resource sharing
   - Body parser: For parsing request bodies

2. **Database**:
   - Drizzle ORM: Type-safe SQL query builder
   - NeonDB Serverless: PostgreSQL client

3. **External Services**:
   - Stripe: Payment processing
   - OpenAI/Grok: AI services for food and exercise analysis
   - Firebase: Authentication and data storage

## Deployment Strategy

The application is configured for deployment on Replit:

1. **Build Process**:
   - Frontend build with Vite (`vite build`)
   - Backend bundled with esbuild
   - Outputs to `dist/` directory

2. **Runtime Configuration**:
   - Environment variables for API keys and database connection
   - Production mode toggle via `NODE_ENV`

3. **Deployment Target**:
   - Configured for Cloud Run deployment through Replit
   - Uses Node.js 20 runtime

4. **Database Provisioning**:
   - PostgreSQL 16 configured in Replit
   - Database URL provided via environment variables

5. **Development Workflow**:
   - Development server with HMR
   - TypeScript type checking
   - Vite plugins for error overlays and development tools

## Future Considerations

1. **Offline Support**:
   - Implementing robust offline data storage and synchronization

2. **Performance Optimization**:
   - Code splitting for better initial load times
   - Optimizing image processing and storage

3. **Enhanced Security**:
   - Additional security measures for API endpoints
   - Rate limiting and request validation

4. **Scalability**:
   - Potential migration to serverless architecture for specific endpoints
   - Caching strategies for frequent data access patterns