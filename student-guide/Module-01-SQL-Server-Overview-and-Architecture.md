# Module 01: SQL Server Overview & Architecture

**Duration:** 90 minutes  
**Day:** 1 — Morning  
**Delivery:** Instructor-led with SSMS demonstration

---

## Learning Objectives

By the end of this module you will be able to:

- [ ] Identify the main SQL Server editions and state when to use each
- [ ] Describe the key components of a SQL Server installation
- [ ] Explain the relationship between an instance, a database, and a database object
- [ ] Name the four system databases and their purpose
- [ ] Distinguish between Windows Authentication and SQL Server Authentication

---

## Prerequisites

- Windows Server 2019/2022 or Windows 10/11 (64-bit) with SQL Server already installed  
- SQL Server Management Studio (SSMS) 19 or later installed  
- A local or network SQL Server instance available to connect to  
- User account with sysadmin rights on the instance (for lab exercises)

---

## 1.1 SQL Server Editions

SQL Server ships in several editions. Understanding the differences helps you choose the right licence for each workload.

| Edition | Target Use | Key Limits |
|---|---|---|
| **Express** | Small apps, learning, development | 10 GB database size, 1 GB RAM for the engine, 1 socket/4 cores |
| **Standard** | Departmental workloads | 128 GB RAM, 24 cores |
| **Enterprise** | Mission-critical, large-scale | Unlimited memory and cores; all features enabled |
| **Developer** | Development and testing only | Same features as Enterprise; **not for production** |
| **Evaluation** | 180-day full-feature trial | Expires; not for production |

> **Tip for the lab environment:** The training VM uses Developer Edition. You will see "Developer" in the window title bar and in `SELECT @@VERSION`.

### Feature highlights by edition

- **Always On Availability Groups** — Enterprise only  
- **Partitioning** — Enterprise only  
- **Advanced SSIS connectors** — Enterprise only  
- **Basic Always On** (two nodes, single database) — Standard  
- **Transparent Data Encryption (TDE)** — Standard and Enterprise

---

## 1.2 SQL Server Components

A full SQL Server installation can include several independent components. Not all are installed by default.

| Component | Purpose | Installed by default? |
|---|---|---|
| **Database Engine** | Core relational engine; stores and processes data | Yes |
| **SQL Server Agent** | Scheduled jobs, alerts, and notifications | Yes (requires Database Engine) |
| **SQL Server Browser** | Resolves instance names on the network | Optional |
| **Integration Services (SSIS)** | ETL — extract, transform, load data | Optional |
| **Reporting Services (SSRS)** | Web-based reports | Optional |
| **Analysis Services (SSAS)** | OLAP cubes and data mining | Optional |
| **Full-Text Search** | Advanced text indexing and search | Optional |

In this course we focus on the **Database Engine** and **SQL Server Agent**. These two components handle all core administration tasks.

---

## 1.3 Instances

An **instance** is a complete, independent copy of the SQL Server Database Engine running on a server.

### Default instance vs. named instance

| | Default instance | Named instance |
|---|---|---|
| **Connect string** | `SERVERNAME` or `.` | `SERVERNAME\INSTANCENAME` |
| **TCP/IP port** | 1433 (default) | Dynamic or manually assigned |
| **Windows service name** | `MSSQLSERVER` | `MSSQL$INSTANCENAME` |
| **When to use** | Single instance per server | Multiple instances on one server |

You can run **multiple instances** on a single server. Each instance has its own:
- Memory allocation
- SQL Server Agent
- System databases
- Login store

### Connecting to an instance in SSMS

1. Open SSMS.
2. In the **Connect to Server** dialog, type:
   - Default instance: `.\` or `localhost`
   - Named instance: `.\SQLEXPRESS` or `SERVER01\PROD2019`
3. Choose your **Authentication** type (covered in Section 1.5).
4. Click **Connect**.

---

## 1.4 System Databases

Every SQL Server instance includes four **system databases**. You must never modify these directly unless instructed by Microsoft support.

### master

- Contains **instance-level metadata**: logins, linked servers, server configuration, endpoint definitions.
- If `master` is damaged and there is no backup, the instance cannot start.
- **Back up `master` whenever you add logins, create databases, or change server configuration.**

### model

- Acts as the **template** for all new user databases.
- Any object or setting you add to `model` will appear in every database created afterward.
- If you change `AUTO_SHRINK` or add a startup stored procedure to `model`, every new database inherits it.

### msdb

- Used by **SQL Server Agent** to store jobs, schedules, alerts, and job history.
- Also stores backup/restore history and Database Mail configuration.
- Back up `msdb` regularly if you rely on SQL Server Agent jobs.

### tempdb

- A **shared scratch space** for temporary tables (`#temp`), table variables, row versioning, and sort operations.
- **Recreated from scratch every time the instance starts** — never back up `tempdb`.
- Heavy `tempdb` contention is a common performance issue; multiple data files help.

### Viewing system databases in SSMS

In **Object Explorer**, expand:  
`SERVERNAME → Databases → System Databases`

---

## 1.5 Authentication Modes

SQL Server supports two authentication modes. The mode is set at the instance level.

### Windows Authentication

- Uses the operating system's existing identity (Active Directory account or local Windows account).  
- SQL Server trusts the Windows token — **no separate SQL password** is stored.  
- Generally considered more secure because it leverages Kerberos/NTLM and Windows password policies.  
- Ideal for domain-joined environments where all users have AD accounts.

```
Connection string example:
Server=SQLSERVER01;Database=AdventureWorks;Integrated Security=True;
```

### SQL Server Authentication (Mixed Mode)

- SQL Server stores its **own username and password** (a "SQL login").  
- Required when:
  - Clients are not on the same Windows domain.
  - Applications connect from non-Windows platforms.
  - You need a specific application service account without an AD identity.
- **Mixed Mode** = both Windows Authentication and SQL Server Authentication are accepted.

```
Connection string example:
Server=SQLSERVER01;Database=AdventureWorks;User Id=AppUser;Password=Str0ng!Pass;
```

### How to check (and change) the authentication mode

1. In SSMS Object Explorer, right-click the instance → **Properties**.
2. Click the **Security** page.
3. Under **Server authentication**, the current mode is shown.
4. To change to Mixed Mode: select **SQL Server and Windows Authentication mode** → click **OK**.
5. **Restart the SQL Server service** for the change to take effect.

> **Best practice:** Use Windows Authentication wherever possible. Enable Mixed Mode only when necessary, and apply strong passwords to all SQL logins.

---

## 1.6 SQL Server Management Studio (SSMS) Orientation

SSMS is the primary GUI tool for SQL Server administration. Key areas:

| Area | Location | Purpose |
|---|---|---|
| **Object Explorer** | Left panel | Navigate instances, databases, objects |
| **Query Editor** | Centre pane | Write and run T-SQL statements |
| **Results pane** | Below query editor | Shows query output: grid, messages, execution plan |
| **Activity Monitor** | Right-click instance → Activity Monitor | Live view of processes, waits, I/O |
| **Template Explorer** | View menu | Pre-written T-SQL script templates |
| **SQL Server Profiler** | Tools menu | Capture and analyse query trace events |

### Useful keyboard shortcuts

| Shortcut | Action |
|---|---|
| `F5` or `Ctrl+E` | Execute selected query (or all if nothing selected) |
| `Ctrl+K, Ctrl+C` | Comment selected lines |
| `Ctrl+K, Ctrl+U` | Uncomment selected lines |
| `Ctrl+L` | Display estimated execution plan |
| `Ctrl+M` | Toggle actual execution plan |
| `Ctrl+R` | Show/hide results pane |

---

## Knowledge Check

Answer these questions before proceeding to the lab.

1. What is the maximum database size for SQL Server **Express** Edition?
2. Which system database must be backed up whenever you create a new SQL Server login?
3. You need to connect two application servers on a separate Windows domain to a SQL Server instance. Which authentication mode must you enable?
4. What is the name of the Windows service for a **default** SQL Server instance?
5. What happens to data in `tempdb` when the SQL Server service restarts?

*(Answers at the end of this module guide.)*

---

## Lab 01: Explore SSMS & Connect to an Instance

> **Scenario — Your First Day at NovaMart**
>
> Budi (IT Manager) walks you through the server room. There is a Windows Server with SQL Server 2022 already installed.
> Your job today: open SSMS for the first time, connect to the instance, and understand what you are working with.
> By end of day you should be able to answer Budi's question: _"What version are we running and which system databases are on this server?"_

### Goal
Connect to the training SQL Server instance in SSMS, explore the Object Explorer, and identify the system databases and server properties.

### Prerequisites
- SQL Server Developer Edition installed on the training VM (or a lab instance provided by the instructor)
- SSMS 19 installed
- The account you are logged in with has sysadmin rights on the instance

### Estimated Time
~30 minutes

### Required Roles
sysadmin (or a login provided by the instructor)

---

### Steps

**Part A — Connect to the Instance**

1. Open **SQL Server Management Studio** from the Start menu.

2. The **Connect to Server** dialog opens automatically.  
   If it does not, click **File → Connect Object Explorer**.

3. Set the following fields:
   | Field | Value |
   |---|---|
   | Server type | Database Engine |
   | Server name | `.\` (dot-backslash) for a local default instance, or `.\MSSQLSERVER` |
   | Authentication | Windows Authentication |

4. Click **Connect**.  
   **Expected result:** The Object Explorer panel shows your server name with a green connected icon.

---

**Part B — Explore Object Explorer**

5. In Object Explorer, expand your server node.  
   You should see: Databases, Security, Server Objects, Replication, Always On High Availability, Management, SQL Server Agent.

6. Expand **Databases**.  
   You should see a **System Databases** folder and any user databases.

7. Expand **System Databases**.  
   Confirm you can see: `master`, `model`, `msdb`, `tempdb`.

8. Right-click **master** → **Properties**.  
   Note the **Files** page — observe the `.mdf` and `.ldf` file paths.  
   Click **Cancel** to close.

---

**Part C — Query the Instance Version**

9. Click **New Query** (toolbar) to open a Query Editor window.

10. Type and execute the following:

```sql
SELECT @@VERSION;
```

   **Expected result:** A single row containing the SQL Server version string, e.g.:  
   `Microsoft SQL Server 2022 (RTM-CU...) ... Developer Edition (64-bit)`

11. Run the following to list all databases on the instance:

```sql
SELECT name, database_id, state_desc, recovery_model_desc
FROM   sys.databases
ORDER  BY database_id;
```

   **Expected result:** At least 4 rows (master, tempdb, model, msdb) with `state_desc = ONLINE`.

---

**Part D — Check Server Properties**

12. In Object Explorer, right-click your server → **Properties**.

13. On the **General** page, note:
    - Product version
    - Operating system
    - Platform

14. Click the **Security** page.  
    Observe the current **Server authentication** mode.

15. Click the **Memory** page.  
    Note the **Maximum server memory (MB)** value (default is 2,147,483,647 — unlimited).

16. Click **Cancel** to close without changes.

---

**Part E — Identify Authentication Mode via T-SQL**

17. In the Query Editor, run:

```sql
SELECT SERVERPROPERTY('IsIntegratedSecurityOnly') AS WindowsAuthOnly;
-- Returns 1 = Windows Auth only, 0 = Mixed Mode
```

18. Run the following to see which logins currently exist:

```sql
SELECT name, type_desc, is_disabled
FROM   sys.server_principals
WHERE  type IN ('S','U','G')   -- SQL login, Windows user, Windows group
ORDER  BY type_desc, name;
```

   **Expected result:** You should see at least `sa` (SQL login) and your Windows account.

---

### Validation Checklist

| Check | Pass? |
|---|---|
| SSMS connects to the instance without error | ☐ |
| System Databases folder shows all four system DBs | ☐ |
| `SELECT @@VERSION` returns a SQL Server 2019 or 2022 result | ☐ |
| `sys.databases` query returns at least 4 rows, all ONLINE | ☐ |
| Server Properties dialog shows Security page with current auth mode | ☐ |

---

### Troubleshooting

| Problem | Likely Cause | Fix |
|---|---|---|
| "Cannot connect to .\\" error | SQL Server service not running | Open **Services** (Win+R → `services.msc`), start **SQL Server (MSSQLSERVER)** |
| Login failed for user | Account not mapped to a SQL login | Connect using an account that is a local Windows admin (auto-mapped to sysadmin) |
| Object Explorer shows only one database | SQL Server Browser service not running | Start **SQL Server Browser** in services.msc |
| `SELECT @@VERSION` returns an error | Query editor not connected | Check the connection indicator in the bottom bar of SSMS |
| Server Properties page is greyed out | Insufficient permissions | Ensure the connected login has sysadmin role membership |

---

### Cleanup

No cleanup required — this lab is read-only.

---

## Knowledge Check — Answers

1. **10 GB** per database  
2. **master**  
3. **Mixed Mode** (SQL Server and Windows Authentication)  
4. **MSSQLSERVER**  
5. All data in `tempdb` is **lost** — tempdb is recreated from `model` on every service start
