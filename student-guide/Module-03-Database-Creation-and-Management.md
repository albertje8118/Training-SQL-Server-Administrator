# Module 03: Database Creation & Management

**Duration:** 90 minutes  
**Day:** 1 — After break  
**Delivery:** Instructor-led with live SSMS demonstration

---

## Learning Objectives

By the end of this module you will be able to:

- [ ] Describe the purpose of each SQL Server database file type (MDF, NDF, LDF)
- [ ] Create a database using both SSMS GUI and T-SQL
- [ ] Modify a database's file size and auto-growth settings
- [ ] Explain what filegroups are and when they are useful
- [ ] View and change database properties, including the recovery model

---

## Prerequisites

- Modules 01 and 02 completed
- SQL Server instance running and accessible in SSMS
- sysadmin rights on the instance

---

## 3.1 Database File Structure

Every SQL Server database consists of at least **two physical files** on disk.

### Primary Data File (.mdf)

- Contains the **database schema** (tables, indexes, views, stored procedures) and data.
- Every database has **exactly one** primary data file.
- Extension: `.mdf` by convention (not enforced).

### Secondary Data File (.ndf)

- Optional additional data files used to spread data across multiple disks or filegroups.
- A database can have **zero or many** secondary data files.
- Extension: `.ndf` by convention.

### Transaction Log File (.ldf)

- Records every transaction before it is written to the data file.
- SQL Server uses the log for **recovery** (rolling back uncommitted transactions) and for **log shipping / Always On replication**.
- Every database has **at least one** log file; more are rarely needed.
- Extension: `.ldf` by convention.

### How SQL Server writes data

SQL Server does **not** write directly to the data file for every transaction. Instead:

1. The transaction is written to the **transaction log** first (write-ahead logging).
2. A lazy background process called the **checkpoint** later flushes dirty pages to the data file.
3. If the instance crashes before a checkpoint, SQL Server **replays** the log during recovery.

This is why the log file's disk speed matters as much as the data file's.

---

## 3.2 Recovery Models

The **recovery model** controls how much transaction log is retained and what backup/restore options are available.

| Model | Log retained | Backups supported | Point-in-time restore |
|---|---|---|---|
| **Simple** | Log truncated at each checkpoint | Full + Differential only | No |
| **Full** | Log retained until a log backup is taken | Full + Differential + Log | Yes |
| **Bulk-Logged** | Minimal logging for bulk operations | Full + Differential + Log (mostly) | Limited |

> **For new databases in a production environment:** start with **Full** recovery model and set up regular log backups. For development or non-critical databases, **Simple** is sufficient.

View and change recovery model:

```sql
-- View current recovery model
SELECT name, recovery_model_desc
FROM   sys.databases
WHERE  name = 'YourDatabase';

-- Change recovery model
ALTER DATABASE YourDatabase SET RECOVERY SIMPLE;
ALTER DATABASE YourDatabase SET RECOVERY FULL;
```

---

## 3.3 Creating a Database via SSMS

### Using the New Database wizard

1. In Object Explorer, right-click **Databases** → **New Database**.

2. Fill in the **General** page:
   - **Database name:** `NovaMart_Test`
   - The logical file names and paths are auto-populated.

3. In the **Database files** grid, review the two default rows:
   - `NovaMart_Test` — Primary data file (MDF)
   - `NovaMart_Test_log` — Transaction log (LDF)

4. Click the **...** button in the **Path** column to change the file location if required.

5. Set **Initial Size** for the data file to `100` MB and for the log to `50` MB.

6. Click the **Autogrowth** column button (`...`) for the data file:
   - Growth type: **By percent**, `10%`  
     — or —  
   - Growth type: **In megabytes**, `64 MB` (preferred; avoids unpredictable growth)
   - Maximum file size: Unlimited or a specific cap

7. Click **OK** to create the database.

8. Refresh Object Explorer: right-click **Databases** → **Refresh**.  
   `NovaMart_Test` should appear in the list.

---

## 3.4 Creating a Database via T-SQL

The `CREATE DATABASE` statement gives you full control and is repeatable.

### Minimal syntax

```sql
CREATE DATABASE NovaMart;
```

SQL Server creates files in the default data directory using the `model` database settings.

### Full syntax with explicit file placement

```sql
CREATE DATABASE NovaMart
ON PRIMARY
(
    NAME        = 'NovaMart',           -- Logical file name
    FILENAME    = 'C:\SQLData\NovaMart.mdf',
    SIZE        = 100 MB,
    MAXSIZE     = UNLIMITED,
    FILEGROWTH  = 64 MB
)
LOG ON
(
    NAME        = 'NovaMart_log',
    FILENAME    = 'C:\SQLLog\NovaMart_log.ldf',
    SIZE        = 50 MB,
    MAXSIZE     = 500 MB,
    FILEGROWTH  = 32 MB
);
```

### Key keywords

| Keyword | Purpose |
|---|---|
| `ON PRIMARY` | Places file in the PRIMARY filegroup |
| `NAME` | Logical name (used in T-SQL, not the file path) |
| `FILENAME` | Full physical path including file name and extension |
| `SIZE` | Initial file size |
| `MAXSIZE` | Maximum allowed size (`UNLIMITED` = no cap) |
| `FILEGROWTH` | How much to grow when the file fills up |

> **Best practice:** Always specify `FILEGROWTH` in MB, not percent. Percentage-based growth means large files grow by huge amounts unpredictably.

### Verify the database was created

```sql
SELECT name, physical_name, size * 8 / 1024 AS size_MB, state_desc
FROM   sys.master_files
WHERE  database_id = DB_ID('NovaMart');
```

---

## 3.5 Modifying a Database

### Change file size and growth settings

```sql
-- Change auto-growth for the data file
ALTER DATABASE NovaMart
MODIFY FILE (NAME = 'NovaMart', FILEGROWTH = 128 MB);

-- Add space immediately (manual grow)
ALTER DATABASE NovaMart
MODIFY FILE (NAME = 'NovaMart', SIZE = 200 MB);
```

### Add a secondary data file

```sql
ALTER DATABASE NovaMart
ADD FILE
(
    NAME     = 'NovaMart_2',
    FILENAME = 'C:\SQLData\NovaMart_2.ndf',
    SIZE     = 100 MB,
    FILEGROWTH = 64 MB
);
```

### Change the database name

```sql
-- Rename (must be in single-user mode to avoid blocking)
ALTER DATABASE NovaMart SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
ALTER DATABASE NovaMart MODIFY NAME = NovaMart_New;
ALTER DATABASE NovaMart_New SET MULTI_USER;
```

---

## 3.6 Filegroups

A **filegroup** is a named logical container for data files. They are used to:

- Place different tables or indexes on different physical disks for I/O distribution.
- Manage partial backups — back up only the filegroups containing changed data.
- Archive older data to a separate, read-only filegroup on cheaper storage.

### Filegroup types

| Type | Description |
|---|---|
| **PRIMARY** | Default filegroup; contains the primary data file and system objects |
| **User-defined** | Named filegroup for user data; can contain one or more NDF files |
| **FILESTREAM** | Stores binary large objects (BLOBs) in the file system |

### Create a database with multiple filegroups

```sql
CREATE DATABASE NovaMart_FG
ON PRIMARY
(
    NAME = 'NovaMart_FG_primary',
    FILENAME = 'C:\SQLData\NovaMart_FG.mdf',
    SIZE = 100 MB
),
FILEGROUP FG_Archive
(
    NAME = 'NovaMart_FG_archive',
    FILENAME = 'C:\SQLData\NovaMart_FG_archive.ndf',
    SIZE = 200 MB
)
LOG ON
(
    NAME = 'NovaMart_FG_log',
    FILENAME = 'C:\SQLLog\NovaMart_FG_log.ldf',
    SIZE = 50 MB
);
```

### Create a table in a specific filegroup

```sql
CREATE TABLE dbo.ArchiveOrders
(
    OrderID   INT           NOT NULL,
    OrderDate DATE          NOT NULL,
    Amount    DECIMAL(10,2) NOT NULL
)
ON FG_Archive;   -- <-- places this table in the FG_Archive filegroup
```

---

## 3.7 Database Properties Reference

Right-click a database → **Properties** in SSMS to access these pages:

| Page | Key settings |
|---|---|
| **General** | Owner, status, date created, last backup date |
| **Files** | File names, paths, sizes, auto-growth settings |
| **Filegroups** | List of filegroups; set default filegroup |
| **Options** | Recovery model, compatibility level, collation, AUTO_CLOSE, AUTO_SHRINK |
| **Permissions** | Database-level permissions |

### Important Options settings

| Option | Recommendation |
|---|---|
| `AUTO_CLOSE` | Set to **False** — AUTO_CLOSE forces cold-starts and hurts performance |
| `AUTO_SHRINK` | Set to **False** — AUTO_SHRINK causes fragmentation and unpredictable I/O |
| `AUTO_UPDATE_STATISTICS` | Set to **True** — keeps query plans accurate |
| `Compatibility Level` | Match to your SQL Server version unless a specific app requires lower |

---

## 3.8 Deleting a Database

### Via SSMS

Right-click the database → **Delete** → check **Close existing connections** → **OK**.

### Via T-SQL

```sql
USE master;   -- Must not be in the database you are dropping
GO

DROP DATABASE NovaMart_Test;
```

> **Warning:** `DROP DATABASE` is **irreversible** without a backup. Always confirm you are dropping the correct database and have a recent backup before proceeding.

---

## Knowledge Check

1. What is the minimum number of files that every SQL Server database must have?
2. Which recovery model must you use if you need point-in-time restore?
3. What does the `FILEGROWTH` parameter control?
4. Why is `AUTO_SHRINK` considered a bad practice?
5. You want to create a table in a secondary filegroup named `FG_History`. Write the `ON` clause you would add to the `CREATE TABLE` statement.

*(Answers at the end of this module guide.)*

---

## Lab 03: Create, Modify & Delete Databases

> **Scenario — Creating the NovaMart Production Database**
>
> It is time to create the database that will hold all of NovaMart's business data.
> Budi has given you a specification: the database must be named `NovaMart`, start with 100 MB of data space, use 64 MB autogrowth, and run in the **Full** recovery model so you can do point-in-time restores.
> You will also create a throw-away test database (`NovaMart_Test`) via the SSMS GUI to practice the wizard — then delete it at the end.

### Goal
Create two databases (one via SSMS GUI, one via T-SQL), modify file sizes and growth settings, explore database properties, and safely delete a test database.

### Prerequisites
- SQL Server instance running
- SSMS connected to the instance
- sysadmin rights

### Estimated Time
~45 minutes

### Required Roles
sysadmin (or a login with `dbcreator` server role)

---

### Steps

**Part A — Create a Database via SSMS GUI**

1. In Object Explorer, expand your instance.
2. Right-click **Databases** → **New Database**.
3. In the **Database name** field, type: `NovaMart_Test`
4. In the **Database files** grid, change the **Initial Size** values:
   - Row 1 (Data file): `100` MB
   - Row 2 (Log file): `50` MB
5. Click the **...** button in the **Autogrowth** column for the data file row.
   - Select **In megabytes**.
   - Set value to `64`.
   - Click **OK**.
6. Click **OK** to create the database.
7. In Object Explorer, right-click **Databases** → **Refresh**.  
   **Expected result:** `NovaMart_Test` appears in the list.

---

**Part B — Create a Database via T-SQL**

8. Click **New Query** in SSMS toolbar.

9. Type and execute the following (adjust the path to match where SQL Server data files are stored on your VM):

```sql
-- First find the default data directory
SELECT SERVERPROPERTY('InstanceDefaultDataPath') AS DataPath,
       SERVERPROPERTY('InstanceDefaultLogPath')  AS LogPath;
```

10. Note the returned paths. Now create the database using those paths:

```sql
CREATE DATABASE NovaMart
ON PRIMARY
(
    NAME       = 'NovaMart',
    FILENAME   = 'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\NovaMart.mdf',
    SIZE       = 100 MB,
    MAXSIZE    = UNLIMITED,
    FILEGROWTH = 64 MB
)
LOG ON
(
    NAME       = 'NovaMart_log',
    FILENAME   = 'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\NovaMart_log.ldf',
    SIZE       = 50 MB,
    MAXSIZE    = 500 MB,
    FILEGROWTH = 32 MB
);
```

> **Note:** Replace the path with the actual path from Step 9.

11. Refresh Object Explorer and confirm `NovaMart` appears.

---

**Part C — Query Database File Information**

12. Run the following query to see both databases' files:

```sql
SELECT  d.name           AS DatabaseName,
        mf.name          AS LogicalName,
        mf.physical_name AS FilePath,
        mf.size * 8 / 1024 AS SizeMB,
        mf.growth,
        mf.is_percent_growth,
        mf.type_desc
FROM    sys.databases  d
JOIN    sys.master_files mf ON d.database_id = mf.database_id
WHERE   d.name IN ('NovaMart_Test','NovaMart')
ORDER   BY d.name, mf.type;
```

   **Expected result:** 4 rows — 2 files (data + log) for each database.

---

**Part D — Modify File Properties**

13. Increase the initial size of `NovaMart`'s data file to 200 MB:

```sql
ALTER DATABASE NovaMart
MODIFY FILE (NAME = 'NovaMart', SIZE = 200 MB);
```

14. Change the auto-growth of the log file to 64 MB:

```sql
ALTER DATABASE NovaMart
MODIFY FILE (NAME = 'NovaMart_log', FILEGROWTH = 64 MB);
```

15. Verify the changes:

```sql
SELECT  name, size * 8 / 1024 AS SizeMB, growth, is_percent_growth
FROM    sys.master_files
WHERE   database_id = DB_ID('NovaMart');
```

---

**Part E — Check and Change Database Properties**

16. In Object Explorer, right-click **NovaMart** → **Properties**.

17. On the **Options** page, note:
    - **Recovery model** (likely Simple)
    - **AUTO_CLOSE** (should be False)
    - **AUTO_SHRINK** (should be False)

18. Change the **Recovery model** to **Full** in the dropdown → click **OK**.

19. Confirm via T-SQL:

```sql
SELECT name, recovery_model_desc
FROM   sys.databases
WHERE  name = 'NovaMart';
```

   **Expected result:** `FULL`

---

**Part F — Delete a Test Database**

20. Create a temporary database to delete:

```sql
CREATE DATABASE TestDropDB;
```

21. Delete it via T-SQL:

```sql
USE master;
DROP DATABASE TestDropDB;
```

22. Refresh Object Explorer and confirm `TestDropDB` is gone.

---

### Validation Checklist

| Check | Pass? |
|---|---|
| `NovaMart_Test` created via SSMS wizard with 100 MB data / 50 MB log | ☐ |
| `NovaMart` created via T-SQL with correct file paths | ☐ |
| File sizes and growth show correctly in `sys.master_files` | ☐ |
| `ALTER DATABASE MODIFY FILE` increases size to 200 MB | ☐ |
| Recovery model changed to FULL and confirmed via T-SQL | ☐ |
| `TestDropDB` successfully dropped | ☐ |

---

### Troubleshooting

| Problem | Likely Cause | Fix |
|---|---|---|
| `CREATE DATABASE` fails with "path not found" | Folder does not exist or SQL Server service account lacks write permission | Use the path from `SERVERPROPERTY('InstanceDefaultDataPath')`, or create the folder and grant write permission to the SQL Server service account |
| Refresh in SSMS doesn't show new database | Cached Object Explorer | Right-click **Databases** → **Refresh** (not just F5) |
| `ALTER DATABASE MODIFY FILE` fails with "new size must be larger" | Trying to shrink a file with this statement | Use `DBCC SHRINKFILE` to shrink; `MODIFY FILE SIZE` can only grow |
| `DROP DATABASE` fails: "Cannot drop the currently open database" | A query window is currently using that database | Run `USE master` first, then drop |
| Recovery model change doesn't persist | `ALTER DATABASE` not committed | No `COMMIT` is needed — `ALTER DATABASE` is auto-committed; check with `sys.databases` |

---

### Cleanup

Keep `NovaMart_Test` and `NovaMart` — they are used in Module 04 labs.

---

## Knowledge Check — Answers

1. **Two files** — one data file (MDF) and one log file (LDF)
2. **Full** recovery model
3. How much the file grows each time it needs more space
4. AUTO_SHRINK repeatedly shrinks and regrows files, causing heavy **fragmentation** and unnecessary I/O overhead
5. `ON FG_History;` — appended at the end of the `CREATE TABLE` statement
