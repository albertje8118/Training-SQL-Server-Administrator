# Training Scenario — NovaMart Digital Transformation

**Role:** Database Administrator (New Hire)  
**Company:** NovaMart  
**Duration:** 2-Day SQL Server Administration Course

---

## The Company

**NovaMart** is a growing retail chain with 8 stores across the region, more than 200 employees, and a product catalog of over 5,000 items. The company sells consumer electronics, home appliances, and daily necessities.

Despite its growth, NovaMart's IT infrastructure has not kept pace. Critical business data is stored in a mix of Excel spreadsheets and an aging Microsoft Access database that lives on a single shared laptop.

---

## The Problem

Last year, NovaMart experienced a critical data loss incident: a hard drive failure destroyed 3 months of sales records and the entire product catalog. The company spent two weeks manually reconstructing data from paper receipts and supplier invoices.

Since then, the management team has approved a budget for a proper database infrastructure. They need:

- A reliable SQL Server instance with a backup strategy
- Structured, consistent data with enforced business rules
- Controlled access — not everyone should be able to edit everything
- Automated maintenance so the database stays healthy without manual effort
- A migration path to move existing Excel data into the new system

---

## Your Role

You have just been hired as **NovaMart's first dedicated Database Administrator**. You report to **Budi** (IT Manager), who has given you a clear mandate: build, configure, secure, and maintain the SQL Server environment — and do it this week.

You will be working alongside three key business users whose needs you must satisfy:

| Person | Role | Database Need |
|---|---|---|
| **Budi** | IT Manager | Full administrative control; needs the system fully documented |
| **Sari** | HR Manager | Read-only access to employee and department data |
| **Agus** | Warehouse Supervisor | Read and write access to product and inventory data |
| **Dian** | Finance Analyst | Read-only access; runs monthly reports — performance matters |

---

## The Project Plan (2 Days)

### Day 1 — Build the Foundation

| Module | Your Task |
|---|---|
| **M01** | First day at the office. Budi walks you through the server room. Connect to the existing SQL Server instance and get familiar with the environment. |
| **M02** | The production server needs proper configuration. Enable remote access so Sari and Dian can connect from their workstations. Harden the service startup settings. |
| **M03** | Create the `NovaMart` production database with correct file sizing and recovery model. Also create a test database for safe experimentation. |
| **M04** | Build the first core tables: `Department` and `Employee`. Insert sample data and verify that the business rules (foreign keys, constraints) are enforced. |
| **M05** | Set up user access. Sari gets read-only. Agus gets read/write. Test that neither can exceed their permissions. |

### Day 2 — Protect, Automate, and Operate

| Module | Your Task |
|---|---|
| **M06** | Design and implement a backup strategy for `NovaMart`. Run a full backup, a differential backup, and simulate a disaster recovery scenario. |
| **M07** | After a week of data entry, queries are slowing down. Rebuild indexes, update statistics, and run `DBCC CHECKDB` to confirm data integrity. |
| **M08** | Budi wants zero manual intervention for backups. Create a SQL Server Agent job that runs a full backup every night at 11:00 PM. |
| **M09** | Dian's monthly report query takes over 5 minutes. Use Activity Monitor and DMVs to find what's blocking performance. |
| **M10** | Monday morning. Three support tickets arrive at once. Work through each failure: a login error, a slow server, and a remote connection problem. |
| **M11** | Migration day. Import NovaMart's legacy product catalog from a CSV file into SQL Server. Export the Employee table to Excel for Sari's HR audit. |

---

## The Database We Are Building

By the end of Day 1, the `NovaMart` database will contain:

```
NovaMart (database)
├── dbo.Department     — HR reference data (DeptID, DeptName, Location)
└── dbo.Employee       — Employee records (EmpID, Name, DeptID, Salary, HireDate)
```

Day 2 labs will work with this same database — adding backup jobs, running maintenance, monitoring queries, and importing additional data.

---

## Training Database Naming

Throughout the labs you will create two databases:

| Database | Purpose |
|---|---|
| `NovaMart` | The main production-equivalent database — used for all scenario work |
| `NovaMart_Test` | A throwaway database created via the SSMS GUI to practice the wizard — safely deleted at the end of Lab 03 |

> **Note:** In a real organization `NovaMart` would live on a production server protected by change control. In this training environment, you are the sysadmin and can work freely. Think of it as a pre-production environment.

---

## A Note on Learning Progression

Each lab advances the NovaMart story. Objects created in earlier labs are used in later labs:

```
Lab 03 — CREATE DATABASE NovaMart
    └── Lab 04 — CREATE TABLE Department, Employee (inside NovaMart)
            └── Lab 05 — CREATE LOGIN/USER LabReader; test on NovaMart tables
                    └── Lab 06 — BACKUP DATABASE NovaMart
                            └── Lab 07 — DBCC CHECKDB, index rebuild on NovaMart
                                    └── Lab 08 — Schedule backup job for NovaMart
                                            └── Lab 09 — Monitor NovaMart queries
                                                    └── Lab 11 — Import data INTO NovaMart
```

**Do not skip labs.** If you fall behind, ask your instructor for the restore script so you can catch up with the right objects in place.

---

## Scenario Summary Card

Keep this handy during the training:

```
┌─────────────────────────────────────────────────────┐
│  NOVAMART — DBA QUICK REFERENCE                     │
│                                                     │
│  Server    : SQLSERVER01 (or your training VM)      │
│  Instance  : Default (MSSQLSERVER)                  │
│  Database  : NovaMart                               │
│  Auth Mode : Mixed Mode (SQL + Windows)             │
│                                                     │
│  Key Logins Created in Labs:                        │
│    sa          → sysadmin (use with care)           │
│    LabReader   → db_datareader on NovaMart          │
│    (your Windows login) → sysadmin                  │
│                                                     │
│  Key Tables (created Day 1, Lab 04):               │
│    NovaMart.dbo.Department                          │
│    NovaMart.dbo.Employee                            │
│                                                     │
│  Backup folder : C:\SQLBackups\                     │
└─────────────────────────────────────────────────────┘
```
