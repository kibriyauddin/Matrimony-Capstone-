# MySQL Database Setup Guide

## Option 1: Install MySQL Server (Recommended for Production)

### Step 1: Download and Install MySQL
1. Go to https://dev.mysql.com/downloads/mysql/
2. Download MySQL Community Server for Windows
3. Run the installer and follow the setup wizard
4. Choose "Developer Default" setup type
5. Set a root password (remember this!)

### Step 2: Install MySQL Workbench (Optional but Recommended)
1. Download from https://dev.mysql.com/downloads/workbench/
2. Install for easier database management

### Step 3: Configure Environment Variables
1. Copy `backend/.env.example` to `backend/.env`
2. Update the database configuration:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_root_password
DB_NAME=event_planner
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_random
NODE_ENV=development
```

### Step 4: Create Database and Tables
1. Open MySQL Workbench or MySQL Command Line
2. Run the SQL script from `database/schema.sql`

## Option 2: Use XAMPP (Easier for Development)

### Step 1: Download and Install XAMPP
1. Go to https://www.apachefriends.org/download.html
2. Download XAMPP for Windows
3. Install XAMPP

### Step 2: Start MySQL Service
1. Open XAMPP Control Panel
2. Start "MySQL" service
3. Click "Admin" next to MySQL to open phpMyAdmin

### Step 3: Create Database
1. In phpMyAdmin, click "New" to create a database
2. Name it `event_planner`
3. Go to SQL tab and paste the content from `database/schema.sql`
4. Click "Go" to execute

### Step 4: Configure Environment
1. Copy `backend/.env.example` to `backend/.env`
2. Update with XAMPP MySQL settings:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=event_planner
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_random
NODE_ENV=development
```

## Option 3: Use Docker (If you have Docker)

### Step 1: Create Docker Compose File
```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: event_planner
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql

volumes:
  mysql_data:
```

### Step 2: Run Docker Container
```bash
docker-compose up -d
```

### Step 3: Configure Environment
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=event_planner
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_random
NODE_ENV=development
```

## After Setup - Test the Connection

1. Navigate to backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Start the server: `npm run dev`
4. Look for: "Database connected successfully" in the console

## Default Admin Account
After successful setup, you can login with:
- **Email**: admin@eventplanner.com
- **Password**: admin123

## Troubleshooting

### Connection Issues
- Make sure MySQL service is running
- Check if port 3306 is available
- Verify credentials in .env file

### Permission Issues
- Make sure MySQL user has proper permissions
- Try connecting with MySQL Workbench first

### Schema Issues
- Make sure the database `event_planner` exists
- Run the schema.sql file to create tables

## Benefits of MySQL vs Mock Database

✅ **Real Data Persistence**: Data survives server restarts
✅ **Better Performance**: Optimized queries and indexing
✅ **Data Integrity**: Foreign key constraints and validation
✅ **Scalability**: Can handle large amounts of data
✅ **Production Ready**: Suitable for real-world deployment
✅ **Advanced Features**: Transactions, backups, replication