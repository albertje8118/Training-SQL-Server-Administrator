# Module 05: SQL Server Security & User Management

**Duration:** 90 minutes  
**Day:** 1 — Afternoon  
**Delivery:** Instructor-led with live SSMS and T-SQL demonstration

---

## Learning Objectives

By the end of this module you will be able to:

- [ ] Explain the difference between a SQL Server login and a database user
- [ ] Create a SQL Server login using both SSMS and T-SQL
- [ ] Map a database user to a login and grant access to a specific database
- [ ] Assign fixed server roles and fixed database roles
- [ ] Test access control by connecting to the instance as the new login

---

## Prerequisites

- Modules 01–04 completed
- `NovaMart` database with `Department` and `Employee` tables (from Module 04 Lab)
- SSMS connected with sysadmin rights

---

## 5.1 The Security Model: Two Layers

SQL Server enforces security at **two distinct layers**. This is the concept that confuses most beginners.

```
┌───────────────────────────────────────────────────────┐
│           SQL Server Instance                         │
│                                                       │
│  LOGIN  (authenticates who you are)                   │
│   └─ mapped to ──▶  DATABASE USER  (authorises        │
│                      access inside one database)      │
└───────────────────────────────────────────────────────┘
```

| Object | Layer | Lives in | Purpose |
|---|---|---|---|
| **Login** | Instance | `master` database | Proves identity to the SQL Server instance |
| **Database User** | Database | Each individual database | Grants access and permissions inside that database |

A login **without** a mapped database user cannot access that database (except through the `guest` account, which should be disabled).

---

## 5.2 Logins

A **login** is an instance-level security principal. It answers the question: *"Is this identity allowed to connect to the instance?"*

### Login types

| Type | Description |
|---|---|
| **SQL Server login** | Username and password stored in SQL Server. Works in Mixed Mode. |
| **Windows login** | Maps to a Windows local account or domain account. Recommended. |
| **Windows group login** | Maps to a Windows AD security group. All group members inherit access. |
| **Certificate-mapped login** | Used for service-broker endpoints and code signing. Advanced use. |

### Viewing existing logins

```sql
SELECT  name,
        type_desc,
        is_disabled,
        default_database_name
FROM    sys.server_principals
WHERE   type IN ('S', 'U', 'G')  -- SQL, Windows user, Windows group
ORDER   BY type_desc, name;
```

### The `sa` login

- `sa` (System Administrator) is a built-in SQL login that always maps to the `sysadmin` server role.
- It is created during installation and **disabled by default in Windows-Authentication-only mode**.
- In Mixed Mode, `sa` is enabled. **Always set a strong password for `sa`.**
- Best practice: rename `sa` and consider disabling it; use named accounts for administration.

---

## 5.3 Creating a Login

### Via SSMS

1. In Object Explorer, expand **Security → Logins**.
2. Right-click **Logins** → **New Login**.
3. Fill in:
   - **Login name:** `AppUser`
   - **SQL Server authentication** — set a password.
   - Uncheck **Enforce password expiration** (for a lab/service account).
   - **Default database:** `NovaMart`
4. Click **User Mapping** page:
   - Check `NovaMart`.
   - Under "Database role membership", check `db_datareader`.
5. Click **OK**.

### Via T-SQL

```sql
-- Create the login at the instance level
CREATE LOGIN AppUser
WITH PASSWORD = 'Str0ng!Passw0rd2024',
     CHECK_POLICY   = ON,       -- Enforce Windows password policy
     CHECK_EXPIRATION = OFF,    -- Don't force expiry (service account)
     DEFAULT_DATABASE = NovaMart;
```

| Option | Description |
|---|---|
| `CHECK_POLICY = ON` | Enforces Windows password complexity and lockout rules |
| `CHECK_EXPIRATION = ON` | Forces the user to change the password at the next login |
| `DEFAULT_DATABASE` | Database opened if none is specified in the connection string |

---

## 5.4 Database Users

A **database user** answers the question: *"What can this identity do inside this particular database?"*

### Mapping a user to a login

```sql
USE NovaMart;
GO

CREATE USER AppUser FOR LOGIN AppUser;
-- The user name and login name don't have to match, but it's cleaner if they do
```

### Orphaned users

An **orphaned user** is a database user whose linked login no longer exists (e.g., the login was dropped, or the database was restored to a different server). To detect and fix orphans:

```sql
-- Find orphaned users
USE NovaMart;
EXEC sp_change_users_login 'Report';

-- Re-link an orphaned user to a login with the same name
EXEC sp_change_users_login 'Auto_Fix', 'AppUser';
```

---

## 5.5 Server Roles

**Fixed server roles** are predefined roles at the instance level. They cannot be modified.

| Role | Permissions granted |
|---|---|
| `sysadmin` | Unlimited control over the entire instance |
| `serveradmin` | Change server configuration; shut down the service |
| `securityadmin` | Manage logins; grant and revoke server-level permissions |
| `dbcreator` | Create, alter, drop, and restore databases |
| `bulkadmin` | Run `BULK INSERT` statements |
| `diskadmin` | Manage disk files |
| `processadmin` | Terminate server processes |
| `setupadmin` | Manage linked servers |
| `public` | Minimum baseline role; every login is a member |

> **Warning:** `sysadmin` has no restrictions whatsoever. Assign it only to named DBA accounts — never to application service accounts.

### Add a login to a server role

```sql
-- Grant dbcreator to a login
ALTER SERVER ROLE dbcreator ADD MEMBER DevUser;

-- Remove a login from a server role
ALTER SERVER ROLE dbcreator DROP MEMBER DevUser;

-- View server role memberships
SELECT  r.name AS RoleName, m.name AS MemberName
FROM    sys.server_role_members rm
JOIN    sys.server_principals   r  ON rm.role_principal_id   = r.principal_id
JOIN    sys.server_principals   m  ON rm.member_principal_id = m.principal_id
ORDER   BY r.name, m.name;
```

---

## 5.6 Database Roles

**Fixed database roles** exist inside each database. They cannot be modified.

| Role | Permissions granted |
|---|---|
| `db_owner` | Full control over the database — can do everything including drop it |
| `db_accessadmin` | Add or remove database users |
| `db_securityadmin` | Manage role membership and object permissions |
| `db_ddladmin` | Run any DDL (CREATE, ALTER, DROP) — no data read |
| `db_backupoperator` | Back up the database |
| `db_datareader` | SELECT on all tables and views |
| `db_datawriter` | INSERT, UPDATE, DELETE on all tables |
| `db_denydatareader` | Explicitly deny SELECT on all tables |
| `db_denydatawriter` | Explicitly deny INSERT, UPDATE, DELETE on all tables |
| `public` | Minimum baseline; every user is a member |

### Assign a database role

```sql
USE NovaMart;
GO

-- Add AppUser to db_datareader
ALTER ROLE db_datareader ADD MEMBER AppUser;

-- Add AppUser to db_datawriter
ALTER ROLE db_datawriter ADD MEMBER AppUser;

-- Remove AppUser from db_datareader
ALTER ROLE db_datareader DROP MEMBER AppUser;
```

### Check current role membership

```sql
USE NovaMart;
GO

SELECT  r.name AS RoleName, m.name AS MemberName
FROM    sys.database_role_members rm
JOIN    sys.database_principals   r  ON rm.role_principal_id   = r.principal_id
JOIN    sys.database_principals   m  ON rm.member_principal_id = m.principal_id
ORDER   BY r.name, m.name;
```

---

## 5.7 Object-Level Permissions (GRANT / REVOKE / DENY)

Beyond roles, you can grant permissions on individual objects.

```sql
-- Allow AppUser to SELECT from one specific table
GRANT SELECT ON dbo.Employee TO AppUser;

-- Allow AppUser to run a stored procedure
GRANT EXECUTE ON dbo.usp_GetSalaryBand TO AppUser;

-- Remove a previously granted permission
REVOKE SELECT ON dbo.Employee FROM AppUser;

-- Explicitly deny SELECT (overrides any GRANT, even via role)
DENY SELECT ON dbo.Employee TO AppUser;
```

### Permission precedence

`DENY` **always wins** over `GRANT`, even if the user has `GRANT` via a role membership.

---

## 5.8 Testing Permissions

After configuring a login and user, always verify by connecting **as that login** and testing operations.

### How to test in SSMS

1. Open a **second SSMS window** (File → New → Database Engine Query).
2. In the connection dialog, use `AppUser` with its SQL Server password.
3. Run:

```sql
SELECT * FROM NovaMart.dbo.Employee;    -- Should succeed if db_datareader
INSERT INTO NovaMart.dbo.Department ... -- Should fail if only db_datareader
```

### Test permissions in the current session via T-SQL

```sql
-- Check if the current user is a member of a database role
SELECT IS_MEMBER('db_datareader')  AS IsDataReader;    -- 1 = yes, 0 = no
SELECT IS_MEMBER('db_datawriter')  AS IsDataWriter;

-- Show all permissions for a specific user
USE NovaMart;
SELECT * FROM fn_my_permissions(NULL, 'DATABASE');     -- permissions for current login
SELECT * FROM fn_my_permissions('dbo.Employee', 'OBJECT');  -- on a specific table
```

---

## 5.9 Disabling and Dropping Logins

### Disable a login (user can no longer connect; login still exists)

```sql
ALTER LOGIN AppUser DISABLE;
```

### Re-enable

```sql
ALTER LOGIN AppUser ENABLE;
```

### Change a login's password

```sql
ALTER LOGIN AppUser WITH PASSWORD = 'NewStr0ng!Pass2024';
```

### Drop a login permanently

```sql
-- Must drop the database user first (or it becomes orphaned)
USE NovaMart;
DROP USER AppUser;

USE master;
DROP LOGIN AppUser;
```

---

## 5.10 Authentication Mode Best Practices

| Scenario | Recommended mode |
|---|---|
| All users are on the same Active Directory domain | **Windows Authentication only** |
| Applications connect from non-Windows systems | **Mixed Mode** — use SQL logins for apps |
| Cloud or multi-domain environment | **Mixed Mode** |
| Development / lab with a single developer | Either — Windows Auth is simpler |

> **Never use `sa` for application connections.** Create a dedicated SQL login for each application with only the permissions it needs (principle of least privilege).

---

## Knowledge Check

1. You create a login `WebApp` but do not create a database user. Can `WebApp` run queries against `NovaMart`? Why?
2. Which server role would you assign to a DBA who needs to create and restore databases but must not manage logins or change server configuration?
3. An application only needs to read data from a database. Which database role is most appropriate?
4. A user is a member of `db_datareader` but you run `DENY SELECT ON dbo.Salary TO UserX`. Can UserX still SELECT from `dbo.Salary`?
5. What command re-enables a disabled login named `OldUser`?

*(Answers at the end of this module guide.)*

---

## Lab 05: Create a Login, Map a User & Test Access Control

> **Scenario — Giving Sari the Right Level of Access**
>
> Sari needs to query the `Employee` and `Department` tables to produce headcount reports — but she must never be able to accidentally change or delete data.
> Agus (Warehouse Supervisor) will also need write access later, but today's task is to model the **read-only** pattern first.
> You will create a SQL login named `LabReader` (representing Sari's service account), map it to the `NovaMart` database, assign `db_datareader`, and then _test the boundary_ — verify that a SELECT works and that an INSERT is correctly denied.

### Goal
Create a SQL Server login named `LabReader`, map it to a database user in `NovaMart`, assign database roles, and verify that the correct operations succeed and fail when connected as `LabReader`.

### Prerequisites
- `NovaMart` database with `Department` and `Employee` tables (from Module 04 Lab)
- SQL Server running in **Mixed Mode** (verify with `SELECT SERVERPROPERTY('IsIntegratedSecurityOnly')` — must return 0)
- SSMS connected with sysadmin rights

### Estimated Time
~45 minutes

### Required Roles
sysadmin on the instance

---

### Steps

**Part A — Enable Mixed Mode (if needed)**

1. In SSMS Object Explorer, right-click the instance → **Properties**.
2. Click the **Security** page.
3. If **Windows Authentication mode** is selected, change it to **SQL Server and Windows Authentication mode**.
4. Click **OK**.
5. **Restart the SQL Server service** in SQL Server Configuration Manager.

> Skip Part A if the query `SELECT SERVERPROPERTY('IsIntegratedSecurityOnly')` returns 0.

---

**Part B — Create the Login via T-SQL**

6. In SSMS, open a new query window and run:

```sql
-- Verify Mixed Mode is active (must return 0)
SELECT SERVERPROPERTY('IsIntegratedSecurityOnly') AS WindowsAuthOnly;
```

7. Create the login:

```sql
CREATE LOGIN LabReader
WITH PASSWORD      = 'LabReader!2024',
     CHECK_POLICY  = ON,
     CHECK_EXPIRATION = OFF,
     DEFAULT_DATABASE = NovaMart;
```

8. Verify the login exists:

```sql
SELECT name, type_desc, is_disabled, default_database_name
FROM   sys.server_principals
WHERE  name = 'LabReader';
```

   **Expected result:** One row — `LabReader`, `SQL_LOGIN`, `is_disabled = 0`.

---

**Part C — Create the Database User**

9. Switch to `NovaMart` and create the user:

```sql
USE NovaMart;
GO

CREATE USER LabReader FOR LOGIN LabReader;
```

10. Assign the `db_datareader` role:

```sql
ALTER ROLE db_datareader ADD MEMBER LabReader;
```

11. Verify role membership:

```sql
SELECT  r.name AS RoleName, m.name AS MemberName
FROM    sys.database_role_members rm
JOIN    sys.database_principals   r ON rm.role_principal_id   = r.principal_id
JOIN    sys.database_principals   m ON rm.member_principal_id = m.principal_id
WHERE   m.name = 'LabReader';
```

   **Expected result:** One row — `db_datareader`, `LabReader`.

---

**Part D — Test as LabReader (Read Only)**

12. Open a **second SSMS connection**:
    - File → Connect Object Explorer  
      — or —  
    - Open a new query window → click the connection dropdown → **Change Connection**

13. In the connection dialog:
    | Field | Value |
    |---|---|
    | Server name | `.\` or the server name |
    | Authentication | SQL Server Authentication |
    | Login | `LabReader` |
    | Password | `LabReader!2024` |

14. Run a SELECT query:

```sql
USE NovaMart;
SELECT * FROM dbo.Employee;
```

   **Expected result:** All rows returned successfully.

15. Attempt an INSERT:

```sql
INSERT INTO dbo.Department (DeptID, DeptName) VALUES (99, 'TestDept');
```

   **Expected result:** Error — *"The INSERT permission was denied on the object 'Department'"*

---

**Part E — Grant Write Permission**

16. Switch back to your **sysadmin connection** and grant write:

```sql
USE NovaMart;
GO

ALTER ROLE db_datawriter ADD MEMBER LabReader;
```

17. In the **LabReader connection**, retry the INSERT:

```sql
INSERT INTO dbo.Department (DeptID, DeptName) VALUES (99, 'TestDept');
```

   **Expected result:** `(1 row affected)` — INSERT now succeeds.

18. Confirm it was written:

```sql
SELECT * FROM dbo.Department;
```

   **Expected result:** `TestDept` row appears.

---

**Part F — Verify Role Membership via T-SQL**

19. In the **LabReader connection**, run:

```sql
SELECT IS_MEMBER('db_datareader') AS IsReader,
       IS_MEMBER('db_datawriter') AS IsWriter;
```

   **Expected result:** Both return `1`.

---

**Part G — Cleanup**

20. Switch back to the **sysadmin connection** and clean up:

```sql
-- Remove the test row
USE NovaMart;
DELETE FROM dbo.Department WHERE DeptID = 99;

-- Drop the user from the database
DROP USER LabReader;

-- Drop the login from the instance
USE master;
DROP LOGIN LabReader;
```

21. Verify the login is gone:

```sql
SELECT name FROM sys.server_principals WHERE name = 'LabReader';
```

   **Expected result:** Zero rows.

---

### Validation Checklist

| Check | Pass? |
|---|---|
| `LabReader` login created and visible in `sys.server_principals` | ☐ |
| `LabReader` database user created in `NovaMart` | ☐ |
| SELECT succeeds when connected as `LabReader` | ☐ |
| INSERT fails when `LabReader` only has `db_datareader` | ☐ |
| INSERT succeeds after adding `db_datawriter` | ☐ |
| `IS_MEMBER` returns 1 for both roles after grant | ☐ |
| Login and user dropped cleanly after cleanup | ☐ |

---

### Troubleshooting

| Problem | Likely Cause | Fix |
|---|---|---|
| Login failed for `LabReader` | Mixed Mode not enabled, or service not restarted after enabling | Enable Mixed Mode in Server Properties → Security, then restart the service |
| `CREATE LOGIN` fails: "Password validation failed" | Password does not meet complexity requirements | Use a password with upper, lower, digit, and special character (e.g., `LabReader!2024`) |
| `CREATE USER` fails: "The login already has an account under a different name" | A user for this login exists under a different name | Check `sys.database_principals` and drop the conflicting user |
| INSERT still denied after adding `db_datawriter` | LabReader session still connected with old permissions | Close and reopen the LabReader connection in SSMS |
| `DROP USER` fails: "The database principal owns a schema" | The user was made owner of a schema (db_owner scenario) | Reassign schema ownership first: `ALTER AUTHORIZATION ON SCHEMA::dbo TO dbo;` |
| `DROP LOGIN` fails: "Cannot drop the login, because it is currently logged in" | LabReader session still open | Disconnect the LabReader SSMS session first, then drop |

---

## Day 1 Summary

Congratulations — you have completed all five Day 1 modules. Here is what you can now do:

| Module | You can now… |
|---|---|
| 01 — Architecture | Explain editions, components, instances, system databases, and auth modes |
| 02 — Installation | Configure services, enable TCP/IP, and verify remote connectivity |
| 03 — Databases | Create, modify, and delete databases with correct file settings |
| 04 — Tables & Data | Design tables, apply constraints, and run INSERT/UPDATE/DELETE/SELECT |
| 05 — Security | Create logins, map users, assign roles, and verify access control |

Day 2 covers: Backup & Restore, Index Maintenance, SQL Server Agent, Monitoring, Troubleshooting, and Data Import/Export.

---

## Knowledge Check — Answers

1. **No** — a login without a database user cannot access the database. The login authenticates to the instance, but authorisation inside the database requires a mapped user.
2. **`dbcreator`** — allows creating and restoring databases without server-config or security management rights.
3. **`db_datareader`** — grants SELECT on all tables and views in the database.
4. **No** — `DENY` overrides all `GRANT` entries, including those inherited via role membership.
5. `ALTER LOGIN OldUser ENABLE;`
