# Microsoft SQL Server Administration (2 Days)

**Audience:** Junior-Mid DB Administrators / IT Staff  
**Format:** Instructor-led + Hands-on Labs  
**Environment:** SQL Server 2019/2022 + SSMS

## Day 1 - Installation, Configuration & Core Database Management

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

### Module 4: Tables & Data Management

**Duration:** 2 hours

**Lessons:**
- Table design basics
- Data types
- Constraints (PK, FK, UNIQUE)
- Basic CRUD operations

**Lab:**
- Create tables
- Insert/update/delete data
- Apply constraints
- Query data using SELECT

### Module 5: SQL Server Security & User Management

**Duration:** 1.5 hours

**Lessons:**
- Logins vs Users
- Roles (Server roles, Database roles)
- Authentication modes

**Lab:**
- Create SQL login
- Map user to database
- Assign roles (db_owner, db_datareader)
- Test access control

## Day 2 - Maintenance, Performance & Operations

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

### Module 7: Database Maintenance

**Duration:** 1.5 hours

**Lessons:**
- Index maintenance (rebuild/reorganize)
- Statistics update
- Integrity check (DBCC CHECKDB)

**Lab:**
- Rebuild index
- Update statistics
- Run DBCC CHECKDB

### Module 8: SQL Server Agent & Automation

**Duration:** 1.5 hours

**Lessons:**
- SQL Server Agent overview
- Jobs, schedules, alerts

**Lab:**
- Create scheduled backup job
- Automate maintenance task
- Monitor job execution

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

### Module 11: Data Import/Export

**Duration:** 1 hour

**Lessons:**
- Import/Export Wizard
- CSV/Excel integration
- Basic ETL concept

**Lab:**
- Import CSV to table
- Export table to Excel

## Outcome

By the end of the training, participants will be able to:

- Install and configure SQL Server
- Create and manage databases
- Manage users and permissions securely
- Perform backup, restore, and maintenance
- Monitor and troubleshoot basic issues