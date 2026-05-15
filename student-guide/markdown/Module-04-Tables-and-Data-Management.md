# Module 04: Tables & Data Management

**Duration:** 90 minutes  
**Day:** 1 — Afternoon  
**Delivery:** Instructor-led with live T-SQL demonstration

---

## Learning Objectives

By the end of this module you will be able to:

- [ ] Choose the appropriate SQL Server data type for common column requirements
- [ ] Create tables with primary key, foreign key, unique, and NOT NULL constraints
- [ ] Insert rows using single-row and multi-row `INSERT` statements
- [ ] Update and delete rows safely using `WHERE` clauses
- [ ] Write `SELECT` queries with filters, sorts, and a basic `JOIN`

---

## Prerequisites

- Modules 01–03 completed
- `NovaMart` database exists on the instance (created in Module 03 Lab)
- SSMS connected with sysadmin rights

---

## 4.1 Table Design Basics

A **table** is the fundamental unit of storage in a relational database. Good table design prevents data quality problems from the start.

### Design principles

| Principle | Description |
|---|---|
| **Atomic columns** | Each column holds one piece of information (e.g., separate `FirstName` and `LastName` — not `FullName`) |
| **Choose the smallest sufficient data type** | `TINYINT` for 0–255, not `INT` — saves space and memory |
| **Every table should have a primary key** | Ensures each row is uniquely identifiable |
| **Avoid storing calculated values** | Store raw data; compute in queries or views |
| **NULL only where truly optional** | Mark columns `NOT NULL` if a value is always required |

---

## 4.2 Data Types

### Integer types

| Type | Storage | Range |
|---|---|---|
| `TINYINT` | 1 byte | 0 to 255 |
| `SMALLINT` | 2 bytes | -32,768 to 32,767 |
| `INT` | 4 bytes | -2.1 billion to 2.1 billion |
| `BIGINT` | 8 bytes | ±9.2 × 10¹⁸ |

Use `INT` as the default for surrogate primary keys. Use `BIGINT` for row-count columns that may exceed 2 billion.

### Character types

| Type | Unicode? | Storage |
|---|---|---|
| `VARCHAR(n)` | No | n bytes (variable-length) |
| `NVARCHAR(n)` | Yes | 2n bytes (variable-length) |
| `CHAR(n)` | No | n bytes (fixed-length — always pads with spaces) |
| `NCHAR(n)` | Yes | 2n bytes (fixed-length) |
| `NVARCHAR(MAX)` | Yes | Up to 2 GB — stored off-row |

**Use `NVARCHAR` for most text columns** unless you are certain no Unicode characters will ever be stored.

### Numeric types

| Type | Description |
|---|---|
| `DECIMAL(p, s)` | Exact numeric; `p` = total digits, `s` = digits after decimal point |
| `NUMERIC(p, s)` | Synonym for `DECIMAL` |
| `FLOAT` | Approximate; do **not** use for money |
| `REAL` | Approximate; 4-byte float |
| `MONEY` | 4 decimal places; 8 bytes; SQL Server-specific |

**Use `DECIMAL(p,s)` for money** — it is exact. `FLOAT` can introduce rounding errors.

### Date and time types

| Type | Range | Precision | Notes |
|---|---|---|---|
| `DATE` | 0001-01-01 to 9999-12-31 | Day | No time component |
| `TIME(n)` | 00:00:00 to 23:59:59.9999999 | 100 ns | No date component |
| `DATETIME` | 1753-01-01 to 9999-12-31 | ~3.33 ms | Legacy; prefer DATETIME2 |
| `DATETIME2(n)` | 0001-01-01 to 9999-12-31 | 100 ns | **Preferred** |
| `DATETIMEOFFSET` | Like DATETIME2 | 100 ns | Includes timezone offset |

### Other useful types

| Type | Description |
|---|---|
| `BIT` | 0, 1, or NULL — used for boolean flags |
| `UNIQUEIDENTIFIER` | 16-byte GUID — globally unique; useful for distributed systems |
| `VARBINARY(n)` | Binary data — files, hashes, raw bytes |
| `XML` | Stores XML documents; supports XQuery |

---

## 4.3 Constraints

**Constraints** are rules SQL Server enforces on data entering a table. They are the primary defence against invalid data.

### PRIMARY KEY

- Uniquely identifies each row.
- A table can have **only one** primary key.
- Automatically creates a **clustered index** (unless you specify `NONCLUSTERED`).
- Columns in a PK cannot be NULL.

```sql
-- Single-column primary key
CREATE TABLE dbo.Department
(
    DeptID   INT          NOT NULL,
    DeptName NVARCHAR(100) NOT NULL,
    CONSTRAINT PK_Department PRIMARY KEY (DeptID)
);

-- Or inline (shorthand)
DeptID INT NOT NULL PRIMARY KEY,
```

### IDENTITY — auto-incrementing PK

```sql
DeptID INT IDENTITY(1,1) NOT NULL,
-- IDENTITY(seed, increment) — starts at 1, increases by 1
```

Use `IDENTITY` to let SQL Server generate PK values automatically. Never insert a value into an IDENTITY column without `SET IDENTITY_INSERT ON`.

### FOREIGN KEY

- Ensures a value in one table's column exists in a referenced table.
- Prevents **orphan rows** (rows in a child table with no matching parent).

```sql
CREATE TABLE dbo.Employee
(
    EmployeeID INT           IDENTITY(1,1) NOT NULL,
    FirstName  NVARCHAR(50)  NOT NULL,
    LastName   NVARCHAR(50)  NOT NULL,
    DeptID     INT           NOT NULL,
    HireDate   DATE          NOT NULL,
    Salary     DECIMAL(10,2) NOT NULL,
    CONSTRAINT PK_Employee    PRIMARY KEY (EmployeeID),
    CONSTRAINT FK_Emp_Dept    FOREIGN KEY (DeptID) REFERENCES dbo.Department(DeptID)
);
```

### UNIQUE

- Enforces uniqueness on one or more columns **other than the primary key**.
- Unlike PK, allows a single `NULL`.

```sql
CONSTRAINT UQ_Employee_Email UNIQUE (Email)
```

### NOT NULL

- Prevents a column from accepting a `NULL` value.
- Applied inline during `CREATE TABLE`:

```sql
FirstName NVARCHAR(50) NOT NULL,
```

### CHECK

- Validates that a column value satisfies a boolean expression.

```sql
CONSTRAINT CHK_Salary CHECK (Salary > 0),
CONSTRAINT CHK_HireDate CHECK (HireDate >= '2000-01-01')
```

### DEFAULT

- Provides an automatic value when no value is supplied during `INSERT`.

```sql
CreatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
IsActive    BIT        NOT NULL DEFAULT 1
```

---

## 4.4 INSERT — Adding Data

### Single row

```sql
USE NovaMart;
GO

INSERT INTO dbo.Department (DeptID, DeptName)
VALUES (1, 'Engineering');
```

### Multiple rows (one statement — more efficient)

```sql
INSERT INTO dbo.Department (DeptID, DeptName)
VALUES
    (2, 'Marketing'),
    (3, 'Finance'),
    (4, 'Operations');
```

### INSERT from another table

```sql
-- Copy data from a source table
INSERT INTO dbo.EmployeeArchive (EmployeeID, FirstName, LastName, DeptID)
SELECT EmployeeID, FirstName, LastName, DeptID
FROM   dbo.Employee
WHERE  IsActive = 0;
```

### INSERT and retrieve the generated IDENTITY value

```sql
INSERT INTO dbo.Employee (FirstName, LastName, DeptID, HireDate, Salary)
VALUES ('Alice', 'Smith', 1, '2023-03-15', 85000.00);

SELECT SCOPE_IDENTITY();  -- Returns the identity value just generated
```

---

## 4.5 UPDATE — Changing Data

```sql
-- Give everyone in DeptID=1 a 5% raise
UPDATE dbo.Employee
SET    Salary = Salary * 1.05
WHERE  DeptID = 1;

-- Update multiple columns at once
UPDATE dbo.Employee
SET    DeptID  = 3,
       Salary  = 92000.00
WHERE  EmployeeID = 5;
```

> **Critical habit:** Always run a `SELECT` with the **same `WHERE` clause** before running `UPDATE`. Confirm the correct rows are returned before you change anything.

```sql
-- Step 1: Preview
SELECT EmployeeID, DeptID, Salary
FROM   dbo.Employee
WHERE  DeptID = 1;

-- Step 2: If the result looks correct, run the update
UPDATE dbo.Employee
SET    Salary = Salary * 1.05
WHERE  DeptID = 1;
```

### Safe update pattern using a transaction

```sql
BEGIN TRANSACTION;

UPDATE dbo.Employee
SET    Salary = Salary * 1.05
WHERE  DeptID = 1;

-- Check @@ROWCOUNT before committing
SELECT @@ROWCOUNT AS RowsAffected;

-- If correct: COMMIT TRANSACTION;
-- If wrong:   ROLLBACK TRANSACTION;
```

---

## 4.6 DELETE — Removing Data

```sql
-- Delete specific rows
DELETE FROM dbo.Employee
WHERE  EmployeeID = 10;

-- Delete all rows in a table (keep the table structure)
DELETE FROM dbo.Employee;

-- Faster alternative for clearing all rows (non-transactional, no triggers)
TRUNCATE TABLE dbo.Employee;
```

> **Warning:** `DELETE` without a `WHERE` clause deletes **every row**. Always double-check before running. Use the same safe-transaction pattern as with `UPDATE`.

### TRUNCATE vs DELETE

| | TRUNCATE | DELETE |
|---|---|---|
| Removes all rows | Yes | Yes (without WHERE) |
| Can filter rows | **No** | Yes |
| Fires triggers | No | Yes |
| Transaction log | Minimal | Full |
| Resets IDENTITY | Yes | No |
| Can be rolled back | Yes (if in transaction) | Yes |

---

## 4.7 SELECT — Querying Data

### Basic SELECT

```sql
SELECT EmployeeID, FirstName, LastName, Salary
FROM   dbo.Employee;
```

### Filter with WHERE

```sql
SELECT *
FROM   dbo.Employee
WHERE  Salary > 70000
  AND  DeptID = 1;
```

### Sort results

```sql
SELECT FirstName, LastName, Salary
FROM   dbo.Employee
ORDER  BY Salary DESC;   -- ASC = ascending (default), DESC = descending
```

### Limit results

```sql
SELECT TOP 10 FirstName, LastName, Salary
FROM   dbo.Employee
ORDER  BY Salary DESC;
```

### Aggregate functions

```sql
SELECT  DeptID,
        COUNT(*)          AS EmployeeCount,
        AVG(Salary)       AS AvgSalary,
        MAX(Salary)       AS MaxSalary,
        MIN(Salary)       AS MinSalary
FROM    dbo.Employee
GROUP   BY DeptID
HAVING  COUNT(*) > 2;   -- filter after grouping
```

### JOIN — combine tables

```sql
-- INNER JOIN: only rows with a match in both tables
SELECT  e.FirstName,
        e.LastName,
        d.DeptName,
        e.Salary
FROM    dbo.Employee   e
INNER JOIN dbo.Department d ON e.DeptID = d.DeptID
WHERE   e.Salary > 60000
ORDER   BY e.LastName;
```

### LEFT JOIN — include unmatched rows from the left table

```sql
-- Show all departments, even those with no employees
SELECT  d.DeptName,
        COUNT(e.EmployeeID) AS EmployeeCount
FROM    dbo.Department d
LEFT JOIN dbo.Employee e ON d.DeptID = e.DeptID
GROUP   BY d.DeptName
ORDER   BY d.DeptName;
```

---

## Knowledge Check

1. You need to store a product price with two decimal places and exact accuracy. Which data type should you use?
2. What is the difference between `DELETE` and `TRUNCATE`?
3. Write a `SELECT` statement that returns the `EmployeeID`, `FirstName`, and `Salary` of all employees earning more than 80,000, sorted by `Salary` descending.
4. You accidentally run `UPDATE dbo.Employee SET Salary = 0` without a `WHERE` clause — but you wrapped it in a transaction. What do you type to undo it?
5. What constraint would you add to prevent a row from being deleted from `dbo.Department` if rows in `dbo.Employee` reference it?

*(Answers at the end of this module guide.)*

---

## Lab 04: Create Tables, Apply Constraints & Run CRUD

> **Scenario — Building the HR Module for Sari**
>
> Sari (HR Manager) has provided the data requirements for the employee roster.
> She needs two tables: `Department` (for the 8 company divisions) and `Employee` (for all 200+ staff records).
> Business rules from Sari: every employee must belong to a department, salary cannot be negative, and the HR department code is fixed — do not allow duplicates.
> After building the tables, you will insert some sample data and confirm the constraints block bad data before the real migration happens in Lab 11.

### Goal
Create a `Department` table and an `Employee` table with correct data types, primary keys, a foreign key, and check constraints. Insert data, run updates, verify constraint violations, delete rows, and query with a JOIN.

### Prerequisites
- `NovaMart` database exists (from Module 03 Lab)
- SSMS connected with sysadmin rights

### Estimated Time
~60 minutes

### Required Roles
sysadmin or `db_owner` on `NovaMart`

---

### Steps

**Part A — Create the Tables**

1. In SSMS, click **New Query** and switch to the correct database:

```sql
USE NovaMart;
GO
```

2. Create the `Department` table:

```sql
CREATE TABLE dbo.Department
(
    DeptID   INT           NOT NULL,
    DeptName NVARCHAR(100) NOT NULL,
    CONSTRAINT PK_Department PRIMARY KEY (DeptID)
);
```

3. Create the `Employee` table:

```sql
CREATE TABLE dbo.Employee
(
    EmployeeID INT            IDENTITY(1,1) NOT NULL,
    FirstName  NVARCHAR(50)   NOT NULL,
    LastName   NVARCHAR(50)   NOT NULL,
    DeptID     INT            NOT NULL,
    HireDate   DATE           NOT NULL,
    Salary     DECIMAL(10,2)  NOT NULL,
    IsActive   BIT            NOT NULL DEFAULT 1,
    CONSTRAINT PK_Employee    PRIMARY KEY (EmployeeID),
    CONSTRAINT FK_Emp_Dept    FOREIGN KEY (DeptID) REFERENCES dbo.Department(DeptID),
    CONSTRAINT CHK_Salary     CHECK (Salary > 0)
);
```

4. Verify both tables exist:

```sql
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'dbo';
```

   **Expected result:** `Department` and `Employee` in the list.

---

**Part B — Insert Data**

5. Insert three departments:

```sql
INSERT INTO dbo.Department (DeptID, DeptName)
VALUES (1, 'Engineering'),
       (2, 'Marketing'),
       (3, 'Finance');
```

6. Insert five employees:

```sql
INSERT INTO dbo.Employee (FirstName, LastName, DeptID, HireDate, Salary)
VALUES
    ('Alice',   'Smith',   1, '2021-06-01', 85000.00),
    ('Bob',     'Jones',   2, '2022-03-15', 62000.00),
    ('Carol',   'Lee',     1, '2020-01-10', 91000.00),
    ('David',   'Brown',   3, '2023-07-20', 74000.00),
    ('Eva',     'Garcia',  2, '2021-11-05', 67000.00);
```

7. Verify:

```sql
SELECT * FROM dbo.Employee ORDER BY EmployeeID;
```

   **Expected result:** 5 rows.

---

**Part C — Query with ORDER BY and Aggregate**

8. Retrieve all employees, ordered by salary descending:

```sql
SELECT EmployeeID, FirstName, LastName, Salary
FROM   dbo.Employee
ORDER  BY Salary DESC;
```

9. Get average salary per department:

```sql
SELECT d.DeptName, COUNT(*) AS Headcount, AVG(e.Salary) AS AvgSalary
FROM   dbo.Employee   e
JOIN   dbo.Department d ON e.DeptID = d.DeptID
GROUP  BY d.DeptName
ORDER  BY AvgSalary DESC;
```

---

**Part D — UPDATE**

10. Give all Engineering employees (DeptID=1) a 10% salary raise:

```sql
-- Preview first
SELECT EmployeeID, FirstName, Salary
FROM   dbo.Employee
WHERE  DeptID = 1;
```

11. If the result looks correct, run the update:

```sql
UPDATE dbo.Employee
SET    Salary = Salary * 1.10
WHERE  DeptID = 1;
```

12. Confirm the change:

```sql
SELECT EmployeeID, FirstName, Salary
FROM   dbo.Employee
WHERE  DeptID = 1;
```

   **Expected result:** Alice's and Carol's salaries are now 10% higher.

---

**Part E — Test Constraint Violations**

13. Try inserting an employee with a non-existent `DeptID`:

```sql
INSERT INTO dbo.Employee (FirstName, LastName, DeptID, HireDate, Salary)
VALUES ('Test', 'User', 99, '2024-01-01', 50000.00);
```

   **Expected result:** Error — *"The INSERT statement conflicted with the FOREIGN KEY constraint"*

14. Try inserting an employee with a negative salary:

```sql
INSERT INTO dbo.Employee (FirstName, LastName, DeptID, HireDate, Salary)
VALUES ('Bad', 'Data', 1, '2024-01-01', -500.00);
```

   **Expected result:** Error — *"The INSERT statement conflicted with the CHECK constraint"*

---

**Part F — DELETE**

15. Delete the last employee (check the ID first):

```sql
SELECT EmployeeID, FirstName, LastName FROM dbo.Employee;
```

16. Delete by ID (replace 5 with the actual last EmployeeID if different):

```sql
DELETE FROM dbo.Employee
WHERE  EmployeeID = 5;
```

17. Verify the row count:

```sql
SELECT COUNT(*) AS RemainingEmployees FROM dbo.Employee;
```

   **Expected result:** 4

---

**Part G — JOIN query**

18. Show each employee's full name, department name, and salary:

```sql
SELECT  e.FirstName + ' ' + e.LastName AS FullName,
        d.DeptName,
        e.Salary,
        e.HireDate
FROM    dbo.Employee   e
JOIN    dbo.Department d ON e.DeptID = d.DeptID
ORDER   BY e.LastName;
```

---

### Validation Checklist

| Check | Pass? |
|---|---|
| `Department` and `Employee` tables created without errors | ☐ |
| 5 employee rows inserted successfully | ☐ |
| FK violation raises a descriptive error message | ☐ |
| CHECK violation raises a descriptive error message | ☐ |
| Salary UPDATE changes correct rows (DeptID=1 only) | ☐ |
| DELETE reduces row count from 5 to 4 | ☐ |
| JOIN query returns employee + department name in the same row | ☐ |

---

### Troubleshooting

| Problem | Likely Cause | Fix |
|---|---|---|
| `CREATE TABLE` fails: "There is already an object named..." | Table already exists | Drop it first: `DROP TABLE dbo.Employee; DROP TABLE dbo.Department;` — note order (Employee first, due to FK) |
| `INSERT` into Employee fails: "Cannot insert explicit value for identity column" | Accidentally included `EmployeeID` in the column list | Remove `EmployeeID` from the INSERT column list |
| `UPDATE` changes every row | Missing or wrong `WHERE` clause | Use `BEGIN TRAN ... ROLLBACK` to undo; always preview with `SELECT` first |
| `DELETE` on Department fails: FK violation | Employee rows still reference that DeptID | Delete or reassign employee rows first, then delete the department |
| JOIN returns no rows | No matching DeptID between tables | Verify the employee DeptID values match existing departments with `SELECT * FROM dbo.Department` |

---

### Cleanup

Keep both tables and their data. They are used in **Module 05 Lab** for security and access-control testing.

---

## Knowledge Check — Answers

1. `DECIMAL(10, 2)` — exact precision with 2 decimal places
2. `TRUNCATE` removes all rows fast with minimal logging and resets IDENTITY; `DELETE` can filter rows, fires triggers, and logs each row individually
3. `SELECT EmployeeID, FirstName, Salary FROM dbo.Employee WHERE Salary > 80000 ORDER BY Salary DESC;`
4. `ROLLBACK TRANSACTION;`
5. The `FOREIGN KEY` constraint on `dbo.Employee.DeptID` referencing `dbo.Department.DeptID` prevents this automatically — you cannot delete a department that has employees referencing it
