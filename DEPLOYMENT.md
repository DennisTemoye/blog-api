# Railway Deployment Guide

This Express.js application is configured for deployment on Railway.

## Prerequisites

1. Railway account (https://railway.app)
2. Git repository with your code

## Deployment Steps

### 1. Connect to Railway

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account and select this repository

### 2. Add MySQL Database

1. In your Railway project, click "New"
2. Select "Database" → "MySQL"
3. Railway will automatically provision a MySQL database
4. The database connection variables will be automatically set as environment variables

### 3. Configure Environment Variables

Railway will automatically set these environment variables from your MySQL database:

- `MYSQLHOST`
- `MYSQLUSER`
- `MYSQLPASSWORD`
- `MYSQLDATABASE`
- `MYSQLPORT`
- `PORT`

### 4. Deploy

1. Railway will automatically detect this is a Node.js application
2. It will install dependencies and start the application
3. The deployment will use the `start` script from `package.json`

## Environment Variables

The application uses these environment variables:

| Variable        | Description                       | Railway Auto-Set |
| --------------- | --------------------------------- | ---------------- |
| `MYSQLHOST`     | MySQL host                        | ✅               |
| `MYSQLUSER`     | MySQL username                    | ✅               |
| `MYSQLPASSWORD` | MySQL password                    | ✅               |
| `MYSQLDATABASE` | MySQL database name               | ✅               |
| `MYSQLPORT`     | MySQL port                        | ✅               |
| `PORT`          | Application port                  | ✅               |
| `NODE_ENV`      | Environment (set to 'production') | ❌               |

## Health Check

The application includes a health check endpoint at `/health` that Railway uses to verify the application is running correctly.

## API Documentation

Once deployed, your API documentation will be available at:
`https://your-app-name.railway.app/api-docs`

## Troubleshooting

1. **Database Connection Issues**: Ensure the MySQL database is provisioned and the environment variables are set correctly
2. **Port Issues**: Railway automatically sets the PORT environment variable
3. **Build Issues**: Check the Railway logs for any dependency installation problems

## Local Development

For local development, copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Then update the `.env` file with your local MySQL credentials.
