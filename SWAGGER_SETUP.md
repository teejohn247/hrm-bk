# Swagger API Documentation Setup

## 📍 Swagger URL

Once configured, Swagger UI will be available at:

**Swagger UI:** `http://localhost:8800/api-docs`  
**Swagger JSON:** `http://localhost:8800/api-docs.json`

---

## 🚀 Setup Instructions

### Step 1: Install Required Package

You need to install `swagger-jsdoc`:

```bash
npm install swagger-jsdoc --save
```

### Step 2: Configuration Already Added

I've already added the Swagger configuration to your `app.js` file. The setup includes:

- ✅ Swagger UI at `/api-docs`
- ✅ Swagger JSON at `/api-docs.json`
- ✅ JWT Bearer authentication support
- ✅ Server configuration for localhost:8800

### Step 3: Restart Your Server

After installing `swagger-jsdoc`, restart your server:

```bash
npm start
```

You should see:
```
Server has started. 8800
Swagger UI available at: http://localhost:8800/api-docs
```

### Step 4: Access Swagger UI

Open your browser and navigate to:
```
http://localhost:8800/api-docs
```

---

## 📝 Adding API Documentation

To document your API endpoints, add JSDoc comments to your route files. Here's an example:

### Example: Documenting the Sign In Endpoint

In `routes/adminRoute.js` or your controller:

```javascript
/**
 * @swagger
 * /api/v1/signIn:
 *   post:
 *     summary: User login (Company or Employee)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: testcompany@example.com
 *               password:
 *                 type: string
 *                 example: TestPass123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: object
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *       400:
 *         description: Invalid credentials
 */
router.post('/signIn', signin);
```

### Example: Documenting Announcement Endpoint

```javascript
/**
 * @swagger
 * /api/v1/announcements:
 *   post:
 *     summary: Create a new announcement
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - announcementType
 *             properties:
 *               title:
 *                 type: string
 *                 example: Company Meeting
 *               content:
 *                 type: string
 *                 example: All hands meeting on Friday
 *               announcementType:
 *                 type: string
 *                 enum: [all, department, individual]
 *                 example: all
 *               departments:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Engineering", "Marketing"]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 example: high
 *     responses:
 *       200:
 *         description: Announcement created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/announcements', auth, createAnnouncement);
```

---

## 🔐 Authentication in Swagger

1. **Login First**: Use the `/api/v1/signIn` endpoint to get a JWT token
2. **Authorize**: Click the "Authorize" button in Swagger UI
3. **Enter Token**: Paste your JWT token (without "Bearer" prefix)
4. **Test Endpoints**: All protected endpoints will now use your token

---

## 📚 Current Status

✅ **Swagger UI Setup**: Configured  
✅ **JWT Authentication**: Configured  
✅ **Base URL**: `http://localhost:8800/api/v1`  
⏳ **API Documentation**: Needs to be added to routes/controllers  

---

## 🎯 Quick Test

1. Install: `npm install swagger-jsdoc --save`
2. Restart server: `npm start`
3. Visit: `http://localhost:8800/api-docs`
4. You should see the Swagger UI interface

---

## 📖 Documentation Structure

The Swagger setup will scan these files for documentation:
- `./routes/*.js` - Route files
- `./controller/**/*.js` - Controller files

Add `@swagger` JSDoc comments to document your endpoints.

---

## 🔧 Customization

You can customize the Swagger UI by modifying the configuration in `app.js`:

```javascript
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'ACEALL ERP API Documentation',
  customfavIcon: '/favicon.ico' // Optional: Add your favicon
}));
```

---

## 📝 Example: Complete Endpoint Documentation

```javascript
/**
 * @swagger
 * components:
 *   schemas:
 *     Announcement:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - announcementType
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID
 *         title:
 *           type: string
 *           description: Announcement title
 *         content:
 *           type: string
 *           description: Announcement content
 *         announcementType:
 *           type: string
 *           enum: [all, department, individual]
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/announcements:
 *   get:
 *     summary: Get all announcements
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of announcements
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Announcement'
 */
```

---

## 🆘 Troubleshooting

### Swagger UI not loading?
- Make sure `swagger-jsdoc` is installed: `npm install swagger-jsdoc --save`
- Check server is running on port 8800
- Verify the route: `http://localhost:8800/api-docs`

### No endpoints showing?
- Add `@swagger` JSDoc comments to your routes
- Check that file paths in `swaggerOptions.apis` are correct
- Restart the server after adding documentation

### Authentication not working?
- Make sure you're using the "Authorize" button in Swagger UI
- Token should be the JWT string (without "Bearer" prefix)
- Token expires after 30 days - get a new one by logging in again

---

## 📍 Summary

**Swagger URL:** `http://localhost:8800/api-docs`

**Next Steps:**
1. Install: `npm install swagger-jsdoc --save`
2. Restart server
3. Visit the URL above
4. Start documenting your endpoints with JSDoc comments
