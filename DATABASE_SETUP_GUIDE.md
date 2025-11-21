# Database Setup Guide

## 📊 Database Requirements Breakdown

### 1. **Users Table** ✅ HIGH PRIORITY
**Current State**: Stored in memory (`UserService._users` list)
**Why Database**: User data must persist across server restarts, passwords need secure storage

**Fields Needed**:
- `id` (Primary Key, Auto-increment)
- `username` (Unique, String)
- `password_hash` (String) - **Currently missing!** Passwords are stored in plain text
- `name` (String)
- `email` (String, Optional, Unique)
- `business_name` (String, Optional)
- `business_address` (String, Optional)
- `phone` (String, Optional)
- `is_active` (Boolean, Default: True)
- `created_at` (DateTime, Optional)
- `updated_at` (DateTime, Optional)

**Relationships**:
- One user can have many projects (future: `projects.user_id`)

---

### 2. **Projects Table** ✅ HIGH PRIORITY
**Current State**: Stored in memory (`ProjectService._projects` list)
**Why Database**: Projects are core business data, must persist

**Fields Needed**:
- `id` (Primary Key, Auto-increment)
- `title` (String)
- `location` (String)
- `location_address` (String, Optional) - from `location_data.address`
- `location_latitude` (Float, Optional) - from `location_data.latitude`
- `location_longitude` (Float, Optional) - from `location_data.longitude`
- `notes` (Text, Optional)
- `completed` (Boolean, Default: False)
- `user_id` (Foreign Key → Users.id, Optional) - **Currently missing!** Should link to owner
- `created_at` (DateTime, Optional)
- `updated_at` (DateTime, Optional)

**Relationships**:
- Many projects belong to one user (via `user_id`)

**Related Tables**:
- `floor_plan_files` (see below)

---

### 3. **Floor Plan Files Table** ✅ MEDIUM PRIORITY
**Current State**: Stored as JSON array in `Project.floor_plan_files`
**Why Database**: Better normalization, easier file management

**Fields Needed**:
- `id` (Primary Key, Auto-increment)
- `project_id` (Foreign Key → Projects.id)
- `filename` (String)
- `file_type` (String) - "dwg" or "pdf"
- `file_path` (String) - path on filesystem
- `uploaded_at` (DateTime)
- `file_size` (Integer, Optional) - bytes

**Relationships**:
- Many floor plan files belong to one project

---

### 4. **Robot State/History** ⚠️ OPTIONAL (Future)
**Current State**: In-memory in `RobotSimulator`
**Why Database**: Could be useful for:
- Historical robot position/status tracking
- Audit logs of commands
- Performance analytics
- Error history

**Potential Tables**:
- `robot_sessions` - Track robot operation sessions
- `robot_commands` - Log all commands sent to robot
- `robot_state_history` - Periodic snapshots of robot state

**Recommendation**: Skip for now, add later if needed

---

### 5. **Authentication/Sessions** ⚠️ MEDIUM PRIORITY
**Current State**: Frontend-only (localStorage), no backend auth
**Why Database**: For proper authentication, you'll need:
- Session tokens
- Password reset tokens
- Login history

**Potential Tables**:
- `sessions` - Active user sessions
- `password_reset_tokens` - For password reset flow

**Recommendation**: Can start simple with JWT tokens (no DB needed), add session table later if needed

---

## 🗄️ Recommended Database: SQLite (Development) → PostgreSQL (Production)

### Why SQLite First?
- ✅ No server setup required
- ✅ Single file database
- ✅ Perfect for development
- ✅ Easy to migrate to PostgreSQL later
- ✅ Built into Python (no extra dependencies)

### Why PostgreSQL Later?
- ✅ Better for production
- ✅ Concurrent access
- ✅ Advanced features
- ✅ Better performance at scale

---

## 🛠️ Implementation Plan

### Step 1: Choose ORM
**Recommended: SQLAlchemy** (most popular Python ORM)
- Works with SQLite and PostgreSQL
- Great FastAPI integration
- Type-safe models

### Step 2: Database Schema
Create tables for:
1. ✅ Users
2. ✅ Projects  
3. ✅ Floor Plan Files

### Step 3: Migration Strategy
- Replace in-memory services with database queries
- Keep same API interface (routes don't need to change much)
- Add password hashing (bcrypt)

### Step 4: Authentication
- Add password hashing to user creation
- Create login endpoint that validates against database
- Return JWT token or session ID

---

## 📋 Quick Start Checklist

- [ ] Install SQLAlchemy and database driver
- [ ] Create database models (SQLAlchemy)
- [ ] Set up database connection
- [ ] Create migration script (or use Alembic)
- [ ] Update UserService to use database
- [ ] Update ProjectService to use database
- [ ] Add password hashing (bcrypt)
- [ ] Create login endpoint with database validation
- [ ] Test all CRUD operations
- [ ] Add user_id to projects (link projects to users)

---

## 🔐 Security Considerations

1. **Password Hashing**: Use `bcrypt` or `argon2` - NEVER store plain text
2. **SQL Injection**: SQLAlchemy handles this automatically
3. **Input Validation**: Already using Pydantic models ✅
4. **File Uploads**: Validate file types and sizes (already doing this ✅)

---

## 📝 Next Steps

See the implementation guide below for step-by-step instructions.



