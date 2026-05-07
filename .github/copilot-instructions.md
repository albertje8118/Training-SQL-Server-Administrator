# Copilot Instructions — Microsoft SQL Server Administration Training Course

## Project Overview
This repository is for a 2-day instructor-led Microsoft SQL Server Administration course with hands-on labs. The target audience is junior to mid-level database administrators and IT staff. Course materials should align with SQL Server 2019/2022 and SQL Server Management Studio (SSMS).

## Source Course Scope
Use the attached course outline as the authoritative scope for this repository. The course is organized into 11 modules across 2 days.

### Day 1 — Installation, Configuration, and Core Database Management
1. **SQL Server Overview and Architecture**
  - SQL Server editions and components
  - Instance, database, and engine architecture
  - Windows vs SQL authentication modes
  - Lab: explore SSMS, connect to an instance, identify system databases
2. **Installing and Configuring SQL Server**
  - Installation planning: hardware, storage, collation
  - SQL Server installation process
  - Instance configuration
  - SQL Server Configuration Manager
  - Lab: install SQL Server or use a prebuilt VM, configure services and startup type, enable TCP/IP, connect remotely
3. **Database Creation and Management**
  - Database structure: data files and log files
  - Creating databases with GUI and T-SQL
  - Intro to filegroups
  - Database properties
  - Lab: create databases in SSMS and T-SQL, modify file size and growth, delete and restore a test database
4. **Tables and Data Management**
  - Table design basics
  - Data types
  - Constraints: primary key, foreign key, unique
  - Basic CRUD operations
  - Lab: create tables, insert/update/delete data, apply constraints, query with SELECT
5. **SQL Server Security and User Management**
  - Logins vs users
  - Server roles and database roles
  - Authentication modes
  - Lab: create a SQL login, map a user to a database, assign roles such as `db_owner` and `db_datareader`, test access control

### Day 2 — Maintenance, Performance, and Operations
6. **Backup and Restore**
  - Full, differential, and log backups
  - Simple and full recovery models
  - Backup strategies
  - Lab: perform full and differential backups, restore a database, simulate failure and recovery
7. **Database Maintenance**
  - Index rebuild and reorganize
  - Update statistics
  - `DBCC CHECKDB`
  - Lab: rebuild indexes, update statistics, run `DBCC CHECKDB`
8. **SQL Server Agent and Automation**
  - SQL Server Agent overview
  - Jobs, schedules, and alerts
  - Lab: create a scheduled backup job, automate a maintenance task, monitor job execution
9. **Monitoring and Performance Basics**
  - Activity Monitor
  - Dynamic Management Views (DMVs)
  - Intro to blocking and deadlocks
  - Lab: monitor active queries, identify a slow query, view resource usage
10. **Basic Troubleshooting**
  - Common connection and login issues
  - Error logs
  - Performance bottlenecks
  - Lab: read SQL Server logs, simulate login failure, troubleshoot a connection issue
11. **Data Import and Export**
  - Import and Export Wizard
  - CSV and Excel integration
  - Basic ETL concepts
  - Lab: import CSV into a table, export a table to Excel

## Authoring Guidance
- Keep content at an introductory to intermediate administration level. Do not drift into advanced architecture topics unless the request explicitly expands the syllabus.
- Prefer practical administration workflows in SSMS and T-SQL over abstract theory.
- When covering a task that can be done in both GUI and T-SQL, include both approaches if the outline calls for them.
- Treat SQL Server 2019/2022 and SSMS as the default environment unless the user requests a different version.
- Use accurate SQL Server terminology: instance, database, login, user, server role, database role, recovery model, backup type, DMV, and SQL Server Agent job.
- Keep troubleshooting content focused on baseline operational issues such as connection failures, authentication problems, backup/restore mistakes, and simple performance bottlenecks.

## Lab Design Rules
- Labs should be hands-on, step-oriented, and safe to repeat on a training instance or VM.
- Prefer tasks that validate observable results, such as confirming connectivity, verifying permissions, checking backup files, or reviewing job history.
- Call out required tooling when relevant, especially SSMS, SQL Server Configuration Manager, and SQL Server Agent.
- State when a lab assumes a prebuilt VM versus a fresh installation.
- Use realistic administration tasks: creating databases, assigning permissions, running maintenance commands, reviewing logs, and importing/exporting data.

## Course Outcomes
By the end of the training, participants should be able to:
- Install and configure SQL Server
- Create and manage databases
- Manage users and permissions securely
- Perform backup, restore, and maintenance tasks
- Monitor and troubleshoot basic SQL Server issues

## Constraints
- Do not introduce SharePoint, Microsoft 365, tenant administration, or Microsoft Graph assumptions into this repository.
- Do not invent repo-specific pipelines, scripts, or file conventions unless those files actually exist in the workspace.
- When extending course material, stay within the documented 2-day SQL Server administration scope unless the user explicitly asks to broaden it.
