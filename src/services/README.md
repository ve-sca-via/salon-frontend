# Services Architecture

This folder contains all data service layers for the application.

## Structure

```
services/
├── data/                    # ⭐ USE THESE IN YOUR COMPONENTS
│   ├── index.js            # Main export (import from here)
│   ├── salonDataService.js
│   ├── authDataService.js
│   └── bookingDataService.js
│
├── supabase/               # Supabase implementations (don't import directly)
│   ├── salonService.js
│   ├── authService.js
│   └── bookingService.js
│
└── api.js                  # Existing API service (Axios)
```

## Usage

### ✅ CORRECT - Import from data services

```javascript
import { getAllSalons, getSalonById } from "@/services/data";
```

### ❌ WRONG - Don't import from supabase directly

```javascript
import { getAllSalons } from "@/services/supabase/salonService"; // DON'T DO THIS
```

## How It Works

1. **Data Services** (`data/`) are smart wrappers that check configuration
2. If Supabase is enabled → calls Supabase service
3. If Supabase is disabled → uses mock data
4. Your components don't need to know which one is being used

## Configuration

Toggle data source in `src/config/dataSource.js`:

```javascript
export const USE_SUPABASE = false; // Change to true for Supabase
```

## Benefits

- 🔄 **Easy switching** between mock and real data
- 🛡️ **No breaking changes** to existing code
- 🧪 **Easy testing** with mock data
- 🚀 **Production ready** with Supabase
- 📦 **Future proof** for FastAPI migration

## See Also

- `SUPABASE_SETUP.md` - How to set up Supabase
- `MIGRATION_GUIDE.md` - How to update your code
