# Swagger API Documentation Setup

This guide explains how Swagger documentation has been integrated into your Express.js project and how to use it effectively.

## What's Been Added

### 1. Dependencies

- `swagger-jsdoc`: Generates OpenAPI specification from JSDoc comments
- `swagger-ui-express`: Serves the Swagger UI interface

### 2. Configuration Files

- `swagger.js`: Main Swagger configuration file
- Updated `index.js`: Integrated Swagger UI endpoint
- Updated route files: Added comprehensive API documentation

## How to Access the Documentation

1. Start your server:

   ```bash
   npm start
   # or
   npm run dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000/api-docs
   ```

You'll see a beautiful, interactive API documentation interface where you can:

- Browse all available endpoints
- Test API calls directly from the browser
- View request/response schemas
- See example requests and responses

## Documentation Structure

### API Endpoints Documented

- **Courses API** (`/api/courses`): Full CRUD operations
- **Users API** (`/api/users`): User management and authentication

### Documentation Features

- **OpenAPI 3.0** specification
- **Interactive testing** - Try API calls directly from the docs
- **Request/Response schemas** with examples
- **Error responses** documented
- **Authentication** support (Bearer token)
- **Tagged endpoints** for better organization

## How to Add Documentation to New Routes

### 1. Basic Endpoint Documentation

```javascript
/**
 * @swagger
 * /api/your-endpoint:
 *   get:
 *     summary: Brief description
 *     description: Detailed description
 *     tags: [YourTag]
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: string
 */
```

### 2. With Request Body

```javascript
/**
 * @swagger
 * /api/your-endpoint:
 *   post:
 *     summary: Create something
 *     tags: [YourTag]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/YourSchema'
 *     responses:
 *       201:
 *         description: Created successfully
 */
```

### 3. With Path Parameters

```javascript
/**
 * @swagger
 * /api/your-endpoint/{id}:
 *   get:
 *     summary: Get by ID
 *     tags: [YourTag]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The item ID
 *     responses:
 *       200:
 *         description: Success
 */
```

### 4. Define Schemas

```javascript
/**
 * @swagger
 * components:
 *   schemas:
 *     YourSchema:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id
 *         name:
 *           type: string
 *           description: The item name
 *         created_at:
 *           type: string
 *           format: date-time
 */
```

## Best Practices

### 1. Use Tags for Organization

Group related endpoints using tags:

```javascript
tags: [Users, Authentication, Admin];
```

### 2. Provide Examples

Always include example requests and responses:

```javascript
example: name: "Example Item";
description: "This is an example";
```

### 3. Document All Response Codes

Don't just document 200 responses:

```javascript
responses:
  200:
    description: Success
  400:
    description: Bad request
  401:
    description: Unauthorized
  404:
    description: Not found
  500:
    description: Server error
```

### 4. Use Schema References

Define reusable schemas and reference them:

```javascript
schema: $ref: "#/components/schemas/User";
```

## Customization Options

### 1. Modify Swagger Configuration

Edit `swagger.js` to customize:

- API title and version
- Server URLs
- Security schemes
- Default responses

### 2. Customize Swagger UI

In `index.js`, you can customize the UI:

```javascript
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Your API Documentation",
    customfavIcon: "/favicon.ico",
    swaggerOptions: {
      persistAuthorization: true,
    },
  })
);
```

### 3. Add Authentication

For protected endpoints, add security requirements:

```javascript
security:
  - bearerAuth: []
```

## Testing Your APIs

1. **Interactive Testing**: Use the "Try it out" button in Swagger UI
2. **Request Validation**: Swagger validates your requests before sending
3. **Response Inspection**: View actual responses with status codes
4. **Authentication**: Add Bearer tokens for protected endpoints

## Troubleshooting

### Common Issues

1. **Documentation not showing up**:

   - Check that your route files are included in the `apis` array in `swagger.js`
   - Ensure JSDoc comments are properly formatted

2. **Swagger UI not loading**:

   - Verify that `swagger-ui-express` is installed
   - Check that the `/api-docs` route is properly configured

3. **Schemas not appearing**:
   - Make sure schema definitions are in the correct format
   - Check that references use the correct path

### Debug Mode

Enable debug logging by adding to your `index.js`:

```javascript
const debug = require("debug")("app:swagger");
debug("Swagger specs:", JSON.stringify(swaggerSpecs, null, 2));
```

## Next Steps

1. **Document remaining routes**: Add Swagger comments to all your API endpoints
2. **Add authentication**: Implement JWT or other auth schemes
3. **Environment-specific docs**: Configure different servers for dev/staging/prod
4. **API versioning**: Add version information to your documentation
5. **Export documentation**: Generate static documentation files for distribution

## Resources

- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [Swagger JSDoc Documentation](https://github.com/Surnet/swagger-jsdoc)
- [Swagger UI Express Documentation](https://github.com/scottie1984/swagger-ui-express)
- [Swagger Editor](https://editor.swagger.io/) - Online editor for testing OpenAPI specs
