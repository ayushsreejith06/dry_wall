# Database Explanation - How It Works

## 🗄️ Current Setup: **LOCAL SQLite Database**

### Where is the data stored?

**Right now, your database is stored LOCALLY on your computer**, not in the cloud.

- **Location**: `C:\Users\ayush_6b\Desktop\Personal\dry_wall\drywall_robot.db`
- **Type**: SQLite (a file-based database)
- **Size**: Currently ~36 KB (will grow as you add more data)

---

## 📁 How SQLite Works

### What is SQLite?
- SQLite is a **file-based database** - it's just a single file on your computer
- No server needed - it runs directly in your application
- Perfect for development and small applications
- **Data persists** - it's saved to disk, so it survives server restarts

### The Database File
```
drywall_robot.db  ← This single file contains ALL your data:
                    - Users table
                    - Projects table  
                    - Floor Plan Files table
```

---

## 🔄 How Data Flow Works

### When You Register a New User:

1. **Frontend** (Browser)
   ```
   User fills form → Clicks "Register" 
   → Sends POST request to /auth/register
   ```

2. **Backend** (FastAPI Server)
   ```
   Receives request → Validates data
   → UserService.create_user()
   → Hashes password with bcrypt
   → Opens database connection
   ```

3. **Database** (SQLite File)
   ```
   SQLAlchemy writes to drywall_robot.db
   → Creates new row in "users" table
   → Saves: username, password_hash, name, email, etc.
   ```

4. **Response**
   ```
   Database confirms save → Returns user data
   → Frontend receives response → User logged in
   ```

---

## 💾 What Gets Stored

### Users Table
Every time you register, a new row is added:
```
id | username | password_hash                    | name           | email
---|----------|----------------------------------|----------------|---------------
1  | alex     | $2b$12$abc123... (hashed)       | Alex Contractor| alex@...
2  | operator | $2b$12$def456... (hashed)       | Robot Operator | operator@...
3  | admin    | $2b$12$ghi789... (hashed)       | System Admin   | admin@...
4  | newuser  | $2b$12$xyz999... (hashed)       | New User       | new@...
```

**Important**: Passwords are **NEVER stored in plain text** - they're hashed with bcrypt!

### Projects Table
```
id | title              | location        | user_id | completed
---|--------------------|-----------------|---------|----------
1  | Atrium North Walls | Building 3      | NULL    | false
2  | Mechanical Room    | Annex Basement  | NULL    | false
```

---

## 🌐 Is It in the Cloud? **NO - Currently Local Only**

### Current Status: **LOCAL DATABASE**
- ✅ Stored on **YOUR computer** only
- ✅ Only accessible when **your server is running**
- ✅ Data is **persistent** (survives restarts)
- ❌ **NOT accessible from other devices**
- ❌ **NOT backed up automatically**
- ❌ **NOT in the cloud**

### What This Means:
- If you delete `drywall_robot.db` → **All data is lost**
- If you move to another computer → **Data doesn't come with you**
- If your computer crashes → **Data might be lost** (unless you backup)

---

## 🚀 How to Move to Cloud (Future)

### Option 1: PostgreSQL on Cloud Provider
**Examples**: AWS RDS, Google Cloud SQL, Heroku Postgres, Railway, Supabase

**What changes:**
```python
# Current (local):
DATABASE_URL = "sqlite:///./drywall_robot.db"

# Cloud (example):
DATABASE_URL = "postgresql://user:pass@cloud-server.com/dbname"
```

**Benefits:**
- ✅ Accessible from anywhere
- ✅ Automatic backups
- ✅ Multiple users can access
- ✅ Scales better

### Option 2: SQLite in Cloud Storage
**Examples**: Store `drywall_robot.db` in AWS S3, Google Cloud Storage

**Benefits:**
- ✅ Simple migration (same database type)
- ✅ Can sync file across devices
- ⚠️ More complex setup

---

## 🔍 How to Verify Your Data

### Check the Database File:
```bash
# On Windows:
dir drywall_robot.db

# The file exists and grows as you add data
```

### View Database Contents:
You can use tools like:
- **DB Browser for SQLite** (free, GUI)
- **SQLite CLI** (command line)
- **VS Code extensions** (SQLite Viewer)

### Example Query:
```sql
SELECT username, name, email FROM users;
```

---

## 📊 Current Database Status

**File**: `drywall_robot.db`
- **Location**: Project root directory
- **Size**: ~36 KB (as of now)
- **Tables**: 3 (users, projects, floor_plan_files)
- **Users**: 3 demo users + any you've registered
- **Projects**: 2 demo projects + any you've created

---

## 🔐 Security Notes

### What's Secure:
- ✅ Passwords are **hashed** (bcrypt) - can't be read
- ✅ SQL injection protected (SQLAlchemy handles this)
- ✅ Input validation (Pydantic models)

### What to Consider:
- ⚠️ Database file is **not encrypted** (if someone gets the file, they can read it)
- ⚠️ For production, use **environment variables** for database credentials
- ⚠️ **Backup regularly** if using local database

---

## 🎯 Summary

**Current Setup:**
- 📁 **Local SQLite file** (`drywall_robot.db`)
- 💻 **Stored on your computer**
- 🔄 **Persists across server restarts**
- ❌ **NOT in the cloud**
- ❌ **NOT accessible from other devices**

**To Move to Cloud:**
- Change `DATABASE_URL` to a cloud database connection string
- Same code works! (SQLAlchemy handles the difference)
- No frontend changes needed

---

## 💡 Quick Test

Try this to see your data:
1. Register a new user
2. Check `drywall_robot.db` file size (it should increase)
3. Restart your server
4. Try logging in with that user → **It still works!** (data persisted)

This proves the database is working and storing data locally! 🎉



