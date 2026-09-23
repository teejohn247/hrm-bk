# AceERP Architecture: Modules, Subscriptions, Roles & Permissions

## System Overview

```mermaid
flowchart TB
    subgraph Global["🌐 GLOBAL (System-Wide)"]
        Modules[("Modules Collection\n(Template)")]
        Plans[("SubscriptionPlan\nCollection")]
        
        Modules --> |defines| M1[Module: HR]
        Modules --> |defines| M2[Module: OM]
        Modules --> |defines| M3[Module: Settings]
        
        M1 --> |contains| F1[Feature: Employee Mgmt]
        M1 --> |contains| F2[Feature: Payroll]
        M1 --> |contains| F3[Feature: Recruitment]
        
        F1 --> |defines| P1[Permission: View]
        F1 --> |defines| P2[Permission: Create]
    end

    subgraph Company["🏢 COMPANY (Per Company)"]
        CompanyDoc[("Company Document")]
        
        subgraph Subscription["Subscription"]
            SubStatus[subscriptionStatus\nisActive, plan, cycle\ndates, userRange]
        end
        
        subgraph CompanyModules["companyFeatures.modules"]
            CMod[Enabled modules\nwith permission values]
        end
        
        subgraph Roles["systemRoles"]
            R1[Super Admin]
            R2[Manager]
            R3[Staff]
            R4[External]
        end
    end

    subgraph Subscriptions["Subscription Records"]
        SubRecord[("Subscriptions\nCollection")]
    end

    Plans --> |used by| SubRecord
    SubRecord --> |links to| CompanyDoc
    Modules --> |synced to| CompanyModules
    CompanyModules --> |basis for| Roles
    SubStatus --> |reflects| SubRecord
```

---

## Hierarchy: Modules → Features → Permissions

```mermaid
flowchart TD
    subgraph Module["📦 MODULE (e.g. HR Module)"]
        direction TB
        
        subgraph Features["Module Features"]
            F1[Employee Management]
            F2[Payroll Management]
            F3[Leave Management]
            F4[Recruitment Management]
        end
        
        subgraph F1Perms["Employee Management Permissions"]
            P1a[View Employee]
            P1b[Create Employee]
            P1c[Edit Employee]
        end
        
        subgraph F2Perms["Payroll Permissions"]
            P2a[View Payroll]
            P2b[Process Payroll]
        end
    end
    
    F1 --> F1Perms
    F2 --> F2Perms
```

---

## Role-Based Access: Permission Assignment

```mermaid
flowchart LR
    subgraph Roles["ROLES"]
        SA[Super Admin]
        MGR[Manager]
        STAFF[Staff]
        EXT[External]
    end

    subgraph Feature["Feature: Employee Management"]
        subgraph Perms["Permissions"]
            V[View Employee]
            C[Create Employee]
        end
    end

    SA --> |✓| V
    SA --> |✓| C
    MGR --> |✓| V
    MGR --> |✓| C
    STAFF --> |✗| V
    STAFF --> |✗| C
    EXT --> |✗| V
    EXT --> |✗| C
```

---

## Data Flow: Template to Company

```mermaid
sequenceDiagram
    participant Admin
    participant Modules as Modules (Template)
    participant Company
    participant Roles as systemRoles

    Note over Modules: Global module definition
    Modules->>Modules: moduleId, key, moduleName<br/>moduleFeatures[] → featurePermissions[]

    Admin->>Company: Subscribe / Activate
    Company->>Company: companyFeatures.subscriptionStatus<br/>isActive, plan, cycle, dates

    Note over Company: Sync modules to company
    Modules->>Company: companyFeatures.modules<br/>(copy with value: false)

    Note over Company: Assign to roles
    Company->>Roles: rolePermissions<br/>(mirrors modules, value: true/false per role)

    Admin->>Company: Toggle permissions
    Company->>Roles: Update featurePermissions.value<br/>per role
```

---

## Entity Relationship

```mermaid
erDiagram
    Modules ||--o{ Module : contains
    Module ||--o{ ModuleFeature : has
    ModuleFeature ||--o{ FeaturePermission : has
    
    Company ||--o| SubscriptionStatus : has
    Company ||--o{ CompanyModule : has
    Company ||--o{ SystemRole : has
    
    SystemRole ||--o{ RolePermission : has
    RolePermission ||--o{ RoleModuleFeature : has
    RoleModuleFeature ||--o{ RoleFeaturePermission : has
    
    SubscriptionPlan ||--o{ Subscription : used_by
    Subscription }o--|| Company : for
    
    Module {
        number moduleId
        string key
        string moduleName
        string value
    }
    
    ModuleFeature {
        number featureId
        string featureKey
        string featureName
    }
    
    FeaturePermission {
        string key
        string name
        string permissionType
    }
    
    Company {
        string companyName
        string email
    }
    
    SubscriptionStatus {
        boolean isActive
        string plan
        string currentCycle
        date startDate
        date endDate
    }
    
    SystemRole {
        string roleName
        string description
    }
    
    RoleFeaturePermission {
        string key
        string name
        string permissionType
        boolean value
    }
```

---

## Models & Collections Summary

| Collection/Path | Purpose |
|-----------------|---------|
| **Modules** | Global template: defines all modules, features, and permission types |
| **SubscriptionPlan** | Available plans (name, price, cycle options) |
| **Subscriptions** | Company subscription records (plan, cycle, companyId) |
| **Company.companyFeatures** | Company's enabled modules + subscription status |
| **Company.companyFeatures.modules** | Copy of Modules template; `value` = enabled per permission |
| **Company.systemRoles** | Roles (Super Admin, Manager, Staff, External) |
| **Company.systemRoles.rolePermissions** | Per-role copy of module structure; `value` = granted per permission |

---

## Key Relationships

1. **Modules** → **Company**: Modules template is synced to `companyFeatures.modules` when a company subscribes or when modules are created/updated.
2. **Subscription** → **Company**: A subscription links a company to a plan and stores billing/cycle info; status is reflected in `companyFeatures.subscriptionStatus`.
3. **Roles** → **Modules**: Each role's `rolePermissions` mirrors the module/feature/permission structure; `value: true/false` indicates if that role has the permission.
4. **Company Modules** → **Role Permissions**: When modules are toggled or updated, both `companyFeatures.modules` and each role's `rolePermissions` are updated to stay in sync.
