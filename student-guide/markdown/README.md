# SQL Server Administration — Day 1 Student Guide

**Course:** Microsoft SQL Server Administration (2-Day Instructor-Led)  
**Audience:** Junior to mid-level DBAs and IT staff  
**Environment:** SQL Server 2019/2022 · SSMS 19 · Windows Server 2019/2022

---

## Training Scenario

All labs are connected through a single real-world story: you have just been hired as the first DBA at **NovaMart**, a growing retail chain.
Read the full scenario before starting Day 1: [Scenario.md](Scenario.md)

---

## How to Use This Guide

Each module file contains:
- **Learning Objectives** — what you will be able to do by the end
- **Concept sections** — explanation with T-SQL examples and screenshots guidance
- **Knowledge Check** — 5 questions to self-test before the lab
- **Lab** — step-by-step hands-on exercise with validation checklist and troubleshooting

Work through each module in order. The labs build on each other — objects created in one lab are used in subsequent labs.

---

## Day 1 Modules

| # | Module | Duration | Lab |
|---|---|---|---|
| 01 | [SQL Server Overview & Architecture](Module-01-SQL-Server-Overview-and-Architecture.md) | 90 min | Explore SSMS & connect to instance |
| 02 | [Installing & Configuring SQL Server](Module-02-Installing-and-Configuring-SQL-Server.md) | 120 min | Configure services, TCP/IP & remote connectivity |
| 03 | [Database Creation & Management](Module-03-Database-Creation-and-Management.md) | 90 min | Create, modify & delete databases |
| 04 | [Tables & Data Management](Module-04-Tables-and-Data-Management.md) | 90 min | Create tables, apply constraints & run CRUD |
| 05 | [Security & User Management](Module-05-Security-and-User-Management.md) | 90 min | Create login, map user & test access control |

---

## Lab Dependencies

```
Lab 01 (read-only — no objects created)
    │
    ▼
Lab 02 (configures services/TCP — no DB objects)
    │
    ▼
Lab 03 ── creates: NovaMart_Test, NovaMart
    │
    ▼
Lab 04 ── creates: dbo.Department, dbo.Employee  (inside NovaMart)
    │
    ▼
Lab 05 ── uses:    NovaMart, dbo.Department, dbo.Employee
          creates: login LabReader, user LabReader
          cleans up at end
```

---

## Quick T-SQL Reference

### Connect and navigate
```sql
SELECT @@VERSION;                         -- Instance version
SELECT @@SERVERNAME;                      -- Server name
SELECT name FROM sys.databases;           -- List all databases
USE NovaMart;                             -- Switch database context
```

### Databases
```sql
CREATE DATABASE MyDB;                     -- Minimal create
DROP DATABASE MyDB;                       -- Permanent delete
ALTER DATABASE MyDB SET RECOVERY FULL;   -- Change recovery model
SELECT name, recovery_model_desc FROM sys.databases;
```

### Tables and data
```sql
SELECT * FROM INFORMATION_SCHEMA.TABLES; -- List tables in current DB
SELECT TOP 10 * FROM dbo.Employee;       -- Quick data preview
SELECT COUNT(*) FROM dbo.Employee;       -- Row count
```

### Security
```sql
-- Who am I connected as?
SELECT SYSTEM_USER, USER_NAME(), IS_SRVROLEMEMBER('sysadmin');

-- What roles do I have in the current database?
SELECT IS_MEMBER('db_datareader'), IS_MEMBER('db_datawriter');

-- List all logins
SELECT name, type_desc, is_disabled FROM sys.server_principals
WHERE type IN ('S','U','G');
```

---

## Lab Environment Checklist

Before starting labs, confirm:

- [ ] SQL Server service is Running (check in SQL Server Configuration Manager)
- [ ] SQL Server Agent is Running
- [ ] TCP/IP is Enabled (required from Lab 02 onward)
- [ ] You are connected in SSMS with a sysadmin login
- [ ] `NovaMart` database exists (from Lab 03 onward)
- [ ] `dbo.Department` and `dbo.Employee` tables exist (from Lab 04 onward)

---

## Common Error Reference

| Error | Meaning | Quick fix |
|---|---|---|
| Login failed for user | Wrong credentials or login disabled | Check `sys.server_principals` — verify login exists and `is_disabled = 0` |
| Cannot connect to server | Service not running or firewall blocking | Start SQL Server service; check port 1433 is open |
| Object already exists | Table or database with that name exists | `DROP` it first, or use a different name |
| INSERT conflicted with FOREIGN KEY | Referenced row doesn't exist in parent table | Insert the parent row first |
| INSERT conflicted with CHECK constraint | Value violates the check expression | Review the CHECK constraint definition |
| The database principal owns a schema | Trying to drop a user who owns a schema | Reassign schema: `ALTER AUTHORIZATION ON SCHEMA::dbo TO dbo` |
| Cannot drop — currently logged in | Another session is using the object | Kill the session or close the other SSMS window |
