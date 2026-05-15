# Module 02: Installing & Configuring SQL Server

**Duration:** 120 minutes  
**Day:** 1 — Morning  
**Delivery:** Instructor-led; lab uses a pre-installed instance or guided installation on a VM

---

## Learning Objectives

By the end of this module you will be able to:

- [ ] Identify the hardware, storage, and collation requirements before installation
- [ ] Describe the key choices made during the SQL Server installation wizard
- [ ] Configure the SQL Server service startup type and service account
- [ ] Enable TCP/IP in SQL Server Configuration Manager
- [ ] Verify remote connectivity to a SQL Server instance from another machine

---

## Prerequisites

- Module 01 completed
- A Windows Server 2019/2022 VM with at least 4 GB RAM and 40 GB free disk  
- Administrator rights on the VM  
- SQL Server 2022 installation media (ISO or folder)

> **Lab note:** If the training VM already has SQL Server installed, you will skip the installation steps and start at Part B of the lab.

---

## 2.1 Pre-Installation Planning

Taking time to plan before running the installer prevents difficult-to-fix mistakes later.

### Hardware Guidelines

| Resource | Minimum (lab) | Recommended (production) |
|---|---|---|
| CPU | 1.4 GHz, 1 core | 2+ GHz, 4+ cores |
| RAM | 1 GB (Express), 4 GB (others) | 16 GB+ |
| OS disk | 6 GB for SQL Server binaries | SSD, separate from data |
| Data disk | Enough for databases | Fast SSD, separate from OS and log |
| Log disk | — | Separate spindle or SSD from data |
| TempDB disk | — | Separate high-speed disk |

Separating the OS, data files, log files, and tempdb onto different disks prevents I/O contention.

### Collation

**Collation** defines how SQL Server sorts and compares character data (case sensitivity, accent sensitivity, language).

- Set at the **instance level** during installation (applies to system databases and any database that does not override it).
- Can also be set per **database** or per **column**.

| Collation setting | Meaning |
|---|---|
| `SQL_Latin1_General_CP1_CI_AS` | Case-insensitive, accent-sensitive (Windows legacy) |
| `Latin1_General_CI_AS` | Case-insensitive, accent-sensitive (Windows binary) |
| `Latin1_General_BIN2` | Binary comparison; most precise |
| `Indonesian_CI_AS` | Case-insensitive, accent-sensitive for Indonesian |

> **Warning:** Changing instance collation after installation is complex and requires rebuilding system databases. Choose carefully.

### Service Accounts

Each SQL Server component runs under a Windows service account. Best practice:

| Service | Recommended account |
|---|---|
| SQL Server Database Engine | **Virtual Account** (`NT SERVICE\MSSQLSERVER`) or a dedicated domain service account |
| SQL Server Agent | **Virtual Account** (`NT SERVICE\SQLSERVERAGENT`) or same domain service account as the Engine |
| SQL Server Browser | **Local Service** built-in account |

Do **not** run SQL Server services as `Local System` or a domain admin account — it violates least-privilege principles.

### Features to Select

A typical DBA installation includes:

- ✅ Database Engine Services
- ✅ SQL Server Replication (if replication is needed)
- ✅ Full-Text and Semantic Extractions for Search (if full-text search is needed)
- ✅ SQL Server Management Tools (install SSMS separately now)
- ❌ Analysis Services (separate install if needed)
- ❌ Reporting Services (separate install if needed)

---

## 2.2 Installation Process

### Installation steps walkthrough

1. Mount the ISO or open the installation folder → run **`Setup.exe`**.
2. Click **Installation** in the left menu → **New SQL Server stand-alone installation**.
3. **Product key / edition selection** — enter your key or choose Developer/Evaluation.
4. **License terms** — accept to proceed.
5. **Global Rules** — the installer checks prerequisites (Windows Installer version, .NET Framework).
6. **Microsoft Update** — optional; include SQL Server updates in Windows Update.
7. **Install Setup Files** — the installer copies its own support files.
8. **Install Rules** — checks for known blockers (e.g., pending restarts, domain controller).  
   Fix any **errors** before continuing. **Warnings** can usually be noted and bypassed.
9. **Azure extension** — skip unless you need Azure Arc integration.
10. **Feature Selection** — choose Database Engine Services, SQL Server Agent, and Full-Text Search.
11. **Instance Configuration** — choose **Default instance** (or name a named instance).
12. **Server Configuration** — set service accounts and startup type (Automatic for Engine and Agent).
13. **Database Engine Configuration** — critical page:
    - **Authentication Mode**: choose Windows or Mixed Mode; add current account to sysadmin.
    - **Data Directories**: change the default data, log, and backup directories if required.
    - **TempDB**: set the number of TempDB files (rule of thumb: number of logical processors, max 8).
14. **Ready to Install** — review the summary; click **Install**.
15. Installation takes 5–20 minutes. A green tick next to each component means success.

---

## 2.3 Instance Configuration After Installation

After installation, several server-level settings should be verified or adjusted.

### Maximum Server Memory

By default, SQL Server will consume as much RAM as the OS allows, which can starve the OS.

```sql
-- View current setting
EXEC sp_configure 'max server memory (MB)';

-- Set maximum memory (example: leave 4 GB for the OS on a 16 GB server)
EXEC sp_configure 'max server memory (MB)', 12288;  -- 12 GB
RECONFIGURE;
```

Rule of thumb: **Leave 10–15% of RAM (or at least 4 GB) for the OS**.

### Max Degree of Parallelism (MAXDOP)

Controls how many CPU cores can be used for a single query.

```sql
EXEC sp_configure 'max degree of parallelism', 4;
RECONFIGURE;
```

Guidance (SQL Server 2019+): use `ALTER SERVER CONFIGURATION SET MAXDOP` or the installer default recommendation.

### Cost Threshold for Parallelism

SQL Server only uses parallelism when the estimated query cost exceeds this threshold (default: 5 — too low).

```sql
EXEC sp_configure 'cost threshold for parallelism', 50;
RECONFIGURE;
```

### Verify Current Configuration

```sql
-- Show all configuration options
EXEC sp_configure;

-- Show only non-default settings
EXEC sp_configure 'show advanced options', 1;
RECONFIGURE;
EXEC sp_configure;
```

### @@SERVERNAME

Verify the server name SQL Server knows itself by:

```sql
SELECT @@SERVERNAME;
SELECT SERVERPROPERTY('MachineName');
```

If these differ (e.g., after a VM rename), the `@@SERVERNAME` must be corrected:

```sql
EXEC sp_dropserver 'OldName';
EXEC sp_addserver 'NewName', 'local';
-- Then restart the SQL Server service
```

---

## 2.4 SQL Server Configuration Manager

**SQL Server Configuration Manager** (SSCM) is the tool for managing SQL Server services and network protocols. It is **separate from SSMS**.

Open it via:
- Start → search `SQL Server Configuration Manager`
- Or: `Win+R` → `SQLServerManager16.msc` (SQL Server 2022)
- Or: `Win+R` → `SQLServerManager15.msc` (SQL Server 2019)

### SQL Server Services

| Panel | What you can do |
|---|---|
| **SQL Server Services** | Start, stop, restart services; change service account; set startup type |
| **SQL Server Network Configuration** | Enable/disable protocols per instance |
| **SQL Native Client Configuration** | Configure client-side protocols |

### Startup Types

| Type | Behaviour |
|---|---|
| Automatic | Starts automatically when Windows boots |
| Automatic (Delayed Start) | Starts a short time after Windows boots |
| Manual | Must be started manually |
| Disabled | Cannot be started |

For production: set **Database Engine** and **SQL Server Agent** to **Automatic**.

### Enabling TCP/IP

By default, TCP/IP may be disabled for named instances.

1. In SSCM, expand **SQL Server Network Configuration**.
2. Click **Protocols for MSSQLSERVER** (or your instance name).
3. Right-click **TCP/IP** → **Enable**.
4. Right-click **TCP/IP** → **Properties** → **IP Addresses** tab.
5. Scroll to **IPALL** at the bottom:
   - Set **TCP Dynamic Ports** to blank (clear it).
   - Set **TCP Port** to `1433` (default instance) or your chosen port.
6. Click **OK**.
7. Restart the SQL Server service for the change to take effect.

### Windows Firewall

After enabling TCP/IP, open the firewall port on the server:

```powershell
# Allow SQL Server default port through Windows Firewall
New-NetFirewallRule -DisplayName "SQL Server 1433" `
    -Direction Inbound -Protocol TCP -LocalPort 1433 -Action Allow

# Allow SQL Server Browser (for named instance discovery)
New-NetFirewallRule -DisplayName "SQL Server Browser" `
    -Direction Inbound -Protocol UDP -LocalPort 1434 -Action Allow
```

Or via GUI: **Windows Defender Firewall → Advanced Settings → Inbound Rules → New Rule → Port → TCP 1433**.

---

## Knowledge Check

1. What is the recommended practice for separating SQL Server files on disk?
2. During installation, you choose **Mixed Mode** authentication. What additional step must you take to enable the `sa` login to be usable?
3. After enabling TCP/IP in SQL Server Configuration Manager, what must you do for the change to take effect?
4. A server has 16 GB RAM. What is a reasonable `max server memory` setting?
5. `@@SERVERNAME` returns a name that doesn't match the actual computer name. What procedure do you use to correct it?

*(Answers at the end of this module guide.)*

---

## Lab 02: Configure Services, Protocols & Remote Connectivity

> **Scenario — Opening the Door for Remote Users**
>
> Sari (HR Manager) and Dian (Finance Analyst) both work from separate workstations on the company network.
> They need to connect to SQL Server from their machines — but right now TCP/IP is disabled and the firewall is blocking port 1433.
> Your job: configure the server so remote SSMS connections work, and verify that the services start automatically after a reboot.

### Goal
Verify and configure SQL Server services, enable TCP/IP, confirm the firewall port is open, and test remote connectivity from SSMS.

### Prerequisites
- SQL Server 2019 or 2022 installed on the training VM
- Administrator rights on the VM
- A second machine or a second SSMS session available to test remote connection

### Estimated Time
~45 minutes

### Required Roles
Local Administrator on the Windows server; sysadmin on the SQL Server instance

---

### Steps

**Part A — Check Service Startup Types**

1. Open **SQL Server Configuration Manager**.  
   Start menu → search `SQL Server Configuration Manager`.

2. Click **SQL Server Services** in the left tree.

3. Confirm:
   - **SQL Server (MSSQLSERVER)** — State: Running, Start Mode: Automatic
   - **SQL Server Agent (MSSQLSERVER)** — State: Running, Start Mode: Automatic
   - **SQL Server Browser** — State: Running, Start Mode: Automatic

4. If SQL Server Agent is stopped, right-click it → **Start**.  
   If the Start Mode is not Automatic, right-click → **Properties** → **Service** tab → change Start Mode to **Automatic** → OK.

---

**Part B — Enable TCP/IP**

5. In SSCM, expand **SQL Server Network Configuration** → click **Protocols for MSSQLSERVER**.

6. Check the **Enabled** column for each protocol:

   | Protocol | Required setting |
   |---|---|
   | Shared Memory | Enabled (local connections) |
   | Named Pipes | Enabled or Disabled (site policy) |
   | TCP/IP | **Enabled** |

7. If TCP/IP is **Disabled**, right-click it → **Enable**.  
   A message states the change takes effect after the service is restarted.

8. Right-click **TCP/IP** → **Properties**.

9. Click the **IP Addresses** tab. Scroll to the **IPALL** section at the bottom.
   - Clear **TCP Dynamic Ports** (delete any value in the field).
   - Set **TCP Port** = `1433`.
   - Click **OK**.

10. Right-click **SQL Server (MSSQLSERVER)** in the Services list → **Restart**.  
    Wait for the service to return to Running state.

---

**Part C — Open the Firewall Port**

11. Open **PowerShell as Administrator**.

12. Check whether port 1433 is already allowed:

```powershell
Get-NetFirewallRule | Where-Object { $_.DisplayName -like '*SQL*' } |
    Select-Object DisplayName, Enabled, Direction
```

13. If no SQL Server firewall rule exists, create one:

```powershell
New-NetFirewallRule -DisplayName "SQL Server 1433" `
    -Direction Inbound -Protocol TCP -LocalPort 1433 -Action Allow
```

14. Verify the port is now listening:

```powershell
netstat -ano | findstr 1433
```

   **Expected result:** A line showing `0.0.0.0:1433` or `:::1433` with state `LISTENING`.

---

**Part D — Test Remote Connectivity**

15. On the **same machine**, open a second SSMS window.  
    (Or use a second machine if available.)

16. In **Connect to Server**, use the **full machine name** or IP address rather than `.\`:

   | Field | Value |
   |---|---|
   | Server name | `192.168.x.x` or `VMNAME` (the actual hostname) |
   | Authentication | Windows Authentication |

17. Click **Connect**.  
    **Expected result:** Object Explorer connects and shows the instance.

18. Open a new query and run:

```sql
SELECT @@SERVERNAME, @@VERSION;
```

   Confirm the server name and version match the training VM.

---

**Part E — Verify Instance Configuration**

19. In SSMS, open a new query and run:

```sql
EXEC sp_configure 'show advanced options', 1;
RECONFIGURE;

EXEC sp_configure 'max server memory (MB)';
EXEC sp_configure 'max degree of parallelism';
EXEC sp_configure 'cost threshold for parallelism';
```

20. Note the `run_value` column for each setting.  
    If max server memory is still at `2147483647` (unlimited), set it appropriately:

```sql
-- Example: server has 8 GB RAM; leave 2 GB for OS
EXEC sp_configure 'max server memory (MB)', 6144;
RECONFIGURE;
```

---

### Validation Checklist

| Check | Pass? |
|---|---|
| SQL Server and SQL Server Agent services are Running and set to Automatic | ☐ |
| TCP/IP protocol is Enabled with port 1433 | ☐ |
| `netstat -ano` shows port 1433 LISTENING | ☐ |
| SSMS connects using the server's IP address or hostname | ☐ |
| `SELECT @@SERVERNAME` returns the correct name | ☐ |

---

### Troubleshooting

| Problem | Likely Cause | Fix |
|---|---|---|
| TCP/IP shows Enabled but port 1433 is not in netstat | Service not restarted after enabling | Restart SQL Server service in SSCM |
| SSMS can connect locally but not remotely | Firewall blocking port 1433 | Add the firewall rule (Step 13) |
| Remote connection times out | SQL Server Browser not running | Start SQL Server Browser in SSCM |
| Login failed when connecting by IP | Authentication mode is Windows-only but using a SQL login | Enable Mixed Mode in Server Properties → Security, or use Windows credentials |
| `sp_configure` changes don't persist | RECONFIGURE not run | Run `RECONFIGURE;` after every `sp_configure` call |

---

### Cleanup

No objects were created. Configuration changes made in this lab remain in place and are required for later modules.

---

## Knowledge Check — Answers

1. OS, data files, log files, and TempDB on **separate disks** (separate I/O paths)
2. Set a **strong password for `sa`** and enable it (it is disabled by default even in Mixed Mode)
3. **Restart the SQL Server service**
4. `12288` MB (12 GB — leaves approximately 4 GB for the OS)
5. `sp_dropserver` (old name) then `sp_addserver` (new name, 'local'), then restart the SQL Server service
