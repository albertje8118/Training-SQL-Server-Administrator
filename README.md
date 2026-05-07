# Microsoft SQL Server Administration

> **2-Day Instructor-Led Training with Hands-On Labs**

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-orange?logo=github)](https://albertje8118.github.io/Training-SQL-Server-Administrator/)
![SQL Server](https://img.shields.io/badge/SQL%20Server-2019%20%2F%202022-blue?logo=microsoftsqlserver)
![SSMS](https://img.shields.io/badge/Tool-SSMS-steelblue)
![Level](https://img.shields.io/badge/Level-Beginner--Intermediate-green)

**Audience:** Junior–Mid Database Administrators / IT Staff  
**Format:** Instructor-led + Hands-on Labs  
**Environment:** SQL Server 2019 / 2022 + SQL Server Management Studio (SSMS)

📖 **[Read the course online → GitHub Pages](https://albertje8118.github.io/Training-SQL-Server-Administrator/)**

---

## Course Outline

### Day 1 — Installation, Configuration & Core Database Management

| # | Module | Duration |
|---|--------|----------|
| 01 | [SQL Server Overview & Architecture](#module-1-sql-server-overview--architecture) | 1 hour |
| 02 | [Installing & Configuring SQL Server](#module-2-installing--configuring-sql-server) | 2 hours |
| 03 | [Database Creation & Management](#module-3-database-creation--management) | 2 hours |
| 04 | [Tables & Data Management](#module-4-tables--data-management) | 2 hours |
| 05 | [SQL Server Security & User Management](#module-5-sql-server-security--user-management) | 1.5 hours |

### Day 2 — Maintenance, Performance & Operations

| # | Module | Duration |
|---|--------|----------|
| 06 | [Backup & Restore](#module-6-backup--restore) | 2 hours |
| 07 | [Database Maintenance](#module-7-database-maintenance) | 1.5 hours |
| 08 | [SQL Server Agent & Automation](#module-8-sql-server-agent--automation) | 1.5 hours |
| 09 | [Monitoring & Performance Basics](#module-9-monitoring--performance-basics) | 1.5 hours |
| 10 | [Basic Troubleshooting](#module-10-basic-troubleshooting) | 1 hour |
| 11 | [Data Import / Export](#module-11-data-import--export) | 1 hour |

---

## Day 1 — Module Details

### Module 1: SQL Server Overview & Architecture

**Duration:** 1 hour

**Lessons:**
- SQL Server Editions & Components
- SQL Server Architecture (Instance, Database, Engine)
- Authentication Modes (Windows vs SQL)

**Lab:**
- Explore SQL Server Management Studio (SSMS)
- Connect to instance
- Identify system databases

---

### Module 2: Installing & Configuring SQL Server

**Duration:** 2 hours

**Lessons:**
- Installation planning (hardware, storage, collation)
- SQL Server installation process
- Instance configuration
- SQL Server Configuration Manager

**Lab:**
- Install SQL Server (or use prebuilt VM)
- Configure services & startup type
- Enable TCP/IP protocol
- Connect remotely

---

### Module 3: Database Creation & Management

**Duration:** 2 hours

**Lessons:**
- Database structure (data files, log files)
- Creating databases (GUI & T-SQL)
- Filegroups (intro)
- Database properties

**Lab:**
- Create database using SSMS
- Create database using T-SQL
- Modify file size and growth
- Delete and restore test DB

---

### Module 4: Tables & Data Management

**Duration:** 2 hours

**Lessons:**
- Table design basics
- Data types
- Constraints (PK, FK, UNIQUE)
- Basic CRUD operations

**Lab:**
- Create tables
- Insert / update / delete data
- Apply constraints
- Query data using SELECT

---

### Module 5: SQL Server Security & User Management

**Duration:** 1.5 hours

**Lessons:**
- Logins vs Users
- Roles (Server roles, Database roles)
- Authentication modes

**Lab:**
- Create SQL login
- Map user to database
- Assign roles (`db_owner`, `db_datareader`)
- Test access control

---

## Day 2 — Module Details

### Module 6: Backup & Restore

**Duration:** 2 hours

**Lessons:**
- Backup types (Full, Differential, Log)
- Recovery models (Simple, Full)
- Backup strategies

**Lab:**
- Perform full backup
- Perform differential backup
- Restore database
- Simulate failure & recovery

---

### Module 7: Database Maintenance

**Duration:** 1.5 hours

**Lessons:**
- Index maintenance (rebuild / reorganize)
- Statistics update
- Integrity check (`DBCC CHECKDB`)

**Lab:**
- Rebuild index
- Update statistics
- Run `DBCC CHECKDB`

---

### Module 8: SQL Server Agent & Automation

**Duration:** 1.5 hours

**Lessons:**
- SQL Server Agent overview
- Jobs, schedules, alerts

**Lab:**
- Create scheduled backup job
- Automate maintenance task
- Monitor job execution

---

### Module 9: Monitoring & Performance Basics

**Duration:** 1.5 hours

**Lessons:**
- Activity Monitor
- DMVs (Dynamic Management Views)
- Blocking & deadlocks (intro)

**Lab:**
- Monitor active queries
- Identify slow query
- View resource usage

---

### Module 10: Basic Troubleshooting

**Duration:** 1 hour

**Lessons:**
- Common issues (connection, login failure)
- Error logs
- Performance bottlenecks

**Lab:**
- Read SQL Server logs
- Simulate login failure
- Troubleshoot connection issue

---

### Module 11: Data Import / Export

**Duration:** 1 hour

**Lessons:**
- Import/Export Wizard
- CSV / Excel integration
- Basic ETL concept

**Lab:**
- Import CSV to table
- Export table to Excel

---

## Learning Outcomes

By the end of this training, participants will be able to:

- ✅ Install and configure SQL Server
- ✅ Create and manage databases
- ✅ Manage users and permissions securely
- ✅ Perform backup, restore, and maintenance
- ✅ Monitor and troubleshoot basic issues

---

## Repository Structure

```
docs/               # GitHub Pages site (HTML course materials)
student-guide/      # Markdown source for each module
contents/           # Presentation slides (.pptx)
```

## Prerequisites

- Windows Server or Windows 10/11 (training VM recommended)
- SQL Server 2019 or 2022 installed (or use supplied VM image)
- SQL Server Management Studio (SSMS) 19+
- Basic Windows administration knowledge
