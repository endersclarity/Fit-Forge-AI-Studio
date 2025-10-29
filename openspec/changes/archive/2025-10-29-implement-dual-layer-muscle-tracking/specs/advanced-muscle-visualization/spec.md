# Capability: Advanced Muscle Visualization

## Overview

Provide optional detailed muscle view for power users showing breakdown of 40+ muscles including stabilizers and muscle heads.

**Related Capabilities:**
- `detailed-muscle-tracking` - Provides data to display
- `recovery-dashboard-screen` - Dashboard where toggle appears

---

## ADDED Requirements

### Requirement: System SHALL provide settings toggle for detail level

User settings must include option to switch between simple (13 muscles) and detailed (40+ muscles) visualization.

#### Scenario: Default to simple view

**Given:** New user or existing user without preference set
**When:** User views dashboard
**Then:** System displays 13 simple muscle cards
**And:** Setting `muscleDetailLevel = 'simple'`

#### Scenario: User enables detailed view

**Given:** User opens Settings > Display
**When:** User selects "Detailed (40+ specific muscles)"
**And:** Saves settings
**Then:** Dashboard reloads showing detailed muscle breakdowns
**And:** Setting persists across sessions

---

### Requirement: Detailed view SHALL show primary, secondary, and stabilizer muscles

When detailed view enabled, each muscle card must display grouped breakdown of muscles by role.

#### Scenario: Display Deltoids with all subdivisions

**Given:** User has detailed view enabled
**And:** Detailed muscle states exist for Deltoids group
**When:** User views Deltoids card
**Then:** Card shows:

**Primary Movers:**
- Anterior Deltoid: 80%
- Medial Deltoid: 40%
- Posterior Deltoid: 20%

**Stabilizers:** (collapsible)
- Infraspinatus: 60%
- Supraspinatus: 45%
- Teres Minor: 30%
- Subscapularis: 25%

#### Scenario: Stabilizers are collapsible

**Given:** Detailed view showing Deltoids
**When:** Card initially renders
**Then:** Stabilizers section is collapsed by default
**When:** User clicks "Stabilizers (4)" header
**Then:** Section expands to show all 4 stabilizer muscles

---

### Requirement: Simple view SHALL remain unchanged

When setting is simple, dashboard must display exactly as it does today with no visual changes.

#### Scenario: Simple view shows aggregate only

**Given:** User has `muscleDetailLevel = 'simple'`
**When:** User views dashboard
**Then:** Each muscle card shows single percentage
**And:** No breakdown of detailed muscles visible
**And:** UI identical to pre-implementation state

---

*Spec Version: 1.0*
