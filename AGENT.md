# BookMySpace AI Implementation Guide

You are an AI programming assistant helping to build **BookMySpace**, a university room booking system.
This project uses the following monolithic architecture, schemas, and instructions. Follow them strictly.

## Stack & Config
- **Backend Framework**: Express.js
- **Database**: MySQL.
- **ORM**: Sequelize (`sequelize-cli` to handle migrations and seeders).
- **Template Engine**: EJS.
- **Styling**: Tailwind CSS.
- **Auth**: `express-session`, `connect-session-sequelize`, `bcryptjs`.
- **Uploads**: `multer` for handling PDF document uploads.
- **Client-Side Libraries**: FullCalendar (via CDN) for date selection.

## Database Schemas (Sequelize)

Generate Sequelize models and migrations exactly as follows:

1. **User**
   - id (UUID or auto-increment, PK)
   - name (String, required)
   - email (String, required, unique)
   - password (String, hashed)
   - phone_number (String)
   - gender (Boolean)
   - role (Enum: 'admin', 'user')
   - timestamps (createdAt, updatedAt)

2. **Space**
   - id (auto-increment, PK)
   - name (String)
   - description (Text)
   - capacity (Integer)
   - image_url (String)
   - status (Enum: 'active', 'inactive', 'maintenance')
   - timestamps (createdAt, updatedAt)

3. **Booking**
   - id (auto-increment, PK)
   - UserId (Foreign Key -> User.id)
   - SpaceId (Foreign Key -> Space.id)
   - activity_name (String)
   - start_time (Datetime)
   - end_time (Datetime)
   - borrow_letter_url (String, path to uploaded PDF)
   - status (Enum: 'pending', 'confirmed', 'cancelled', 'rejected')
   - validated_at (Datetime, nullable)
   - rejection_reason (String, nullable)
   - submission_date (Datetime, set to current time when created)
   - timestamps (createdAt, updatedAt)

4. **Notification**
   - id (auto-increment, PK)
   - UserId (Foreign Key -> User.id)
   - message (Text)
   - is_read (Boolean, default: false)
   - timestamps (createdAt, updatedAt)

## Core Features to Implement
- **Authentication**: Registration requires Name, Email, Password, and Password Confirmation. Implement Login and Logout. Passwords must be hashed with bcrypt.
- **Admin Roles**: Protect admin routes using an authorization middleware. Admins perform CRUD on spaces and can approve/reject bookings.
- **User Booking Flow**: Embeds FullCalendar natively on the EJS page to select time windows. Before creating a booking, verify there is no overlapping booking (status `pending` or `confirmed`) for the given time slot. If successful, handle the upload of the PDF borrow letter via Multer and save the path to `borrow_letter_url`.
- **Dashboards**: Tailwind CSS styled pages. Users see "My Bookings" and "Notifications". Admins see system stats, spaces CRUD, and global booking queues.

## Folder Structure
```text
bookmyspace/
├── config/              # Database & Preline/Tailwind config
├── controllers/         # Express route handlers
├── middlewares/         # Auth guards ('requiresAuth', 'requiresAdmin'), error handlers, Multer setup
├── models/              # Sequelize models & associations
├── public/              # Static assets, Tailwind compiled CSS, uploads/
├── routes/              # Express Router definitions
├── views/               # EJS Templates
│   ├── layouts/         # Base layout files
│   ├── pages/           # Pages (home, login, dashboard, space-list, calendar)
│   └── partials/        # Reusable EJS components
├── .env                 # Environment variables
├── package.json         
├── server.js            # Express application entry
└── tailwind.config.js   # Tailwind config
```

## Step-by-Step Execution Plan
When the user asks you to start, please implement in the following sequence:
1. **Setup**: Initialize the monolithic project structure, write `package.json`, set up Tailwind, and create the baseline Express server in `server.js`.
2. **Database**: Configure DB, initialize Sequelize, write Migrations and Models for User, Space, Booking, and Notification. Create a seeder to instantiate a default Admin.
3. **Session & Auth**: Build User auth controllers (Login, Register). Implement session management and route-gaurding middleware.
4. **Admin Space CRUD**: Write controller, routes, and EJS views for managing spaces. Include an image upload placeholder or basic Multer integration.
5. **Booking Flow**: Build the space listing endpoint and integrate FullCalendar. Code the robust backend booking logic (`activity_name`, prevent overlaps, handle the PDF upload via Multer).
6. **Dashboard & Polish**: Implement Admin booking management (Approve/Reject changes `status` and sets `validated_at`/`rejection_reason`) and trigger row creation in Notifications when status changes.

---

## Coding Patterns & Conventions

Follow these patterns exactly when adding new code. They match the existing scaffold.

### File Naming
- **camelCase** for all JS files: `userController.js`, `authRoutes.js`, `errorHandler.js`
- **lowercase** for model files: `user.js`, `space.js`, `booking.js`
- Migrations: `YYYYMMDDHHMMSS-description.js` (e.g., `20260418000001-create-users.js`)
- Seeders: `YYYYMMDDHHMMSS-description.js` (e.g., `20260418000001-seed-admin-user.js`)

### Controller Pattern
Controllers export an **object with methods**. Each method matches a route handler.

```js
// controllers/exampleController.js
const { ModelName } = require('../models');

const exampleController = {
  /**
   * GET /example
   * Brief description of what this does.
   */
  index: async (req, res, next) => {
    try {
      const items = await ModelName.findAll();
      res.render('pages/example', { title: 'Example Page', items });
    } catch (error) {
      next(error); // Always pass errors to the global error handler
    }
  },

  /**
   * POST /example
   * Brief description.
   */
  store: async (req, res, next) => {
    try {
      const { field1, field2 } = req.body;
      await ModelName.create({ field1, field2 });
      res.redirect('/example');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = exampleController;
```

### Route Pattern
Routes are defined in `routes/index.js`. Group routes by feature with comments.

```js
// routes/index.js
const express = require('express');
const router = express.Router();
const { requiresAuth, requiresAdmin } = require('../middlewares/auth');

const pageController = require('../controllers/pageController');
const authController = require('../controllers/authController');
const spaceController = require('../controllers/spaceController');

// ─── Public Pages ────────────────────────────────────────
router.get('/', pageController.home);

// ─── Auth ────────────────────────────────────────────────
router.get('/login', authController.loginPage);
router.post('/login', authController.login);
router.get('/register', authController.registerPage);
router.post('/register', authController.register);
router.get('/logout', authController.logout);

// ─── Admin: Spaces ──────────────────────────────────────
router.get('/admin/spaces', requiresAuth, requiresAdmin, spaceController.index);
router.post('/admin/spaces', requiresAuth, requiresAdmin, spaceController.store);

module.exports = router;
```

### Model Pattern
Models use the class-based Sequelize pattern with `associate()` for relationships.

```js
// models/example.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Example extends Model {
    static associate(models) {
      // Define associations here:
      // Example.belongsTo(models.User, { foreignKey: 'UserId' });
      // Example.hasMany(models.Child, { foreignKey: 'ExampleId', onDelete: 'CASCADE' });
    }
  }

  Example.init(
    {
      fieldName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Example',
    }
  );

  return Example;
};
```

### Migration Pattern
Migrations use `queryInterface.createTable` with explicit column definitions including `createdAt` and `updatedAt`.

```js
// migrations/YYYYMMDDHHMMSS-create-examples.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Examples', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      // ... columns
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Examples');
  },
};
```

### View (EJS) Pattern
Pages use the layout wrapper. Content is passed as a template literal to the layout's `body` variable.

```ejs
<%- include('../layouts/main', { body: `

<section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <h1 class="text-3xl font-bold text-gray-900">Page Title</h1>
  <!-- Page content here -->
</section>

` }) %>
```

**Layout** (`views/layouts/main.ejs`) provides:
- `<head>` with fonts, meta, and compiled Tailwind CSS
- `<%- include('../partials/navbar') %>`
- `<main><%- body %></main>`
- Preline UI CDN script

### Middleware Pattern
Export individual functions or an object. Always use `next()` or `next(error)`.

```js
// middlewares/example.js
const exampleMiddleware = (req, res, next) => {
  // Check or modify request
  if (!someCondition) {
    return res.status(403).render('pages/error', {
      title: 'Forbidden',
      message: 'Access denied.',
    });
  }
  next();
};

module.exports = exampleMiddleware;
// or: module.exports = { middlewareA, middlewareB };
```

### Upload (Multer) Pattern
Uploads go to `uploads/` at the project root (NOT inside `public/`). Use the pre-configured multer instance:

```js
// Using the upload middleware in a route:
const upload = require('../middlewares/upload');

router.post('/bookings', requiresAuth, upload.single('borrow_letter'), bookingController.store);
// Access the file path via: req.file.path
```

**Upload config summary:**
- **Destination**: `uploads/borrow-letters/`
- **Allowed types**: `application/pdf` only
- **Max size**: 5MB
- **Field name**: `borrow_letter`

### Error Handling Pattern
- Controllers: wrap logic in `try/catch`, call `next(error)` in the catch block.
- The global `errorHandler` middleware renders `pages/error` with the error message.
- Never send raw error stacks to the client in production.

### Styling Conventions
- Use **Tailwind CSS utility classes** directly in EJS files.
- Max content width: `max-w-6xl mx-auto px-4 sm:px-6 lg:px-8`
- Font: **Inter** (loaded via Google Fonts CDN in layout)
- Primary color: `primary-600` (blue, defined in `tailwind.config.js`)
- Use pure Tailwind CSS for dynamic/interactive UI elements.
- Responsive: mobile-first approach (`sm:`, `md:`, `lg:` breakpoints)

### NPM Scripts Reference
```bash
npm run dev          # Start with nodemon (hot-reload)
npm run start        # Start for production
npm run css:build    # Compile Tailwind CSS (one-time)
npm run css:watch    # Watch & recompile Tailwind on changes
npm run db:migrate   # Run pending migrations
npm run db:seed      # Run all seeders
npm run db:reset     # Undo all migrations, re-migrate, and re-seed
```
