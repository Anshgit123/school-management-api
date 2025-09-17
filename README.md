# School Management API (Node.js + Express + MySQL)

## Setup
1. Clone repo
2. Run `npm install`
3. Create database using SQL:

```sql
CREATE DATABASE IF NOT EXISTS school_mgmt;
USE school_mgmt;
CREATE TABLE IF NOT EXISTS schools (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(500) NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

4. Copy `.env.example` → `.env` and add your DB credentials.
5. Run locally:
```bash
npm run dev
```

## Endpoints
### POST `/addSchool`
Add a new school.
```json
{
  "name": "Greenfield School",
  "address": "123 Park Lane",
  "latitude": 12.9716,
  "longitude": 77.5946
}
```

### GET `/listSchools?lat=12.9716&lng=77.5946`
Returns all schools sorted by proximity.
