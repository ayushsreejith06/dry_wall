# Database Quick Reference

## 📋 What Needs a Database

### ✅ **Users** (HIGH PRIORITY)
- **Current**: In-memory list in `UserService`
- **Needs**: Persistent storage, password hashing
- **Fields**: id, username, password_hash, name, email, business_name, business_address, phone, is_active

### ✅ **Projects** (HIGH PRIORITY)  
- **Current**: In-memory list in `ProjectService`
- **Needs**: Persistent storage, link to users
- **Fields**: id, title, location, location_data (address/lat/lng), floor_plan_files, notes, completed, user_id

### ✅ **Floor Plan Files** (MEDIUM PRIORITY)
- **Current**: JSON array in Project model
- **Needs**: Separate table for better normalization
- **Fields**: id, project_id, filename, file_type, file_path, file_size, uploaded_at

### ⚠️ **Robot State** (OPTIONAL - Future)
- **Current**: In-memory in simulator
- **Needs**: Only if you want history/audit logs
- **Skip for now**

### ⚠️ **Sessions/Auth** (MEDIUM PRIORITY)
- **Current**: Frontend localStorage only
- **Needs**: Backend session management (can use JWT without DB initially)

---

## 🎯 Quick Start (3 Steps)

### 1. Install Dependencies
```bash
pip install sqlalchemy alembic bcrypt python-jose[cryptography] passlib[bcrypt]
```

### 2. Create Database Files
- `backend/database.py` - Database connection
- `backend/models/database_models.py` - SQLAlchemy models
- `backend/init_db.py` - Initialize tables
- `backend/seed_data.py` - Seed demo users

### 3. Update Services
- Update `UserService` to use database
- Update `ProjectService` to use database  
- Update routes to inject `db: Session = Depends(get_db)`

---

## 📁 File Structure After Setup

```
backend/
├── database.py              # NEW: DB connection & session
├── init_db.py              # NEW: Initialize tables
├── seed_data.py            # NEW: Seed demo data
├── models/
│   ├── database_models.py  # NEW: SQLAlchemy models
│   ├── user.py            # Keep: Pydantic models
│   └── project.py         # Keep: Pydantic models
├── services/
│   ├── user_service.py    # UPDATE: Use database
│   └── project_service.py # UPDATE: Use database
└── routes/
    ├── users.py           # UPDATE: Add Depends(get_db)
    ├── projects.py        # UPDATE: Add Depends(get_db)
    └── auth.py            # NEW: Login endpoint
```

---

## 🔑 Key Changes Summary

### Before (In-Memory)
```python
class UserService:
    def __init__(self):
        self._users: List[User] = []
```

### After (Database)
```python
class UserService:
    def __init__(self, db: Session):
        self.db = db
```

### Route Changes
```python
# Before
user_service = UserService()

# After  
@router.get("/users/me")
async def get_current_user(db: Session = Depends(get_db)):
    user_service = UserService(db)
    # ...
```

---

## 🗄️ Database Choice

**Development**: SQLite (single file, no setup)
- File: `drywall_robot.db`
- No server needed
- Perfect for local dev

**Production**: PostgreSQL (when ready)
- Just change `DATABASE_URL` env variable
- Same code works!

---

## 🔐 Security Improvements

1. **Password Hashing**: Use bcrypt (never store plain text)
2. **SQL Injection**: SQLAlchemy handles automatically
3. **Input Validation**: Already using Pydantic ✅

---

## 📚 Full Documentation

- **Overview**: `DATABASE_SETUP_GUIDE.md`
- **Step-by-Step**: `DATABASE_IMPLEMENTATION.md`
- **This File**: Quick reference

---

## ⚡ Next Steps

1. Read `DATABASE_SETUP_GUIDE.md` for full breakdown
2. Follow `DATABASE_IMPLEMENTATION.md` for code
3. Test with existing frontend (no changes needed!)


