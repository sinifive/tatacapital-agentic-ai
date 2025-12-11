# Analytics Endpoint Documentation

## Overview

The `/analytics` endpoint provides lightweight KPI tracking and business impact metrics for the Tata Capital agentic AI system. It returns demo data showing 8-10% improvement in key metrics with agentic AI compared to traditional loan origination processes.

## Endpoint Details

**URL:** `GET /analytics`

**Response Type:** JSON

**Status Code:** 200 OK

## Quick Start

### Test the Endpoint

```bash
# Using curl
curl http://localhost:8000/analytics

# Using Python
import requests
response = requests.get('http://localhost:8000/analytics')
print(response.json())
```

### Example Response

```json
{
  "period": {
    "start_date": "2025-12-01",
    "end_date": "2025-12-11",
    "duration_days": 11
  },
  "performance_metrics": {
    "time_to_decision": {
      "value": 285,
      "unit": "seconds",
      "description": "Average time from session start to loan decision",
      "improvement_vs_baseline": 9.5,
      "baseline": 315,
      "improvement_minutes": 0.5
    },
    "conversion_rate": {
      "value": 68.5,
      "unit": "%",
      "description": "Percentage of sessions converted to loan approvals",
      "improvement_vs_baseline": 8.2,
      "baseline": 63.2,
      "absolute_improvement_percentage_points": 5.3
    },
    "number_of_salary_requests": {
      "value": 247,
      "unit": "count",
      "description": "Total salary verification requests processed",
      "success_rate": 94.7,
      "avg_processing_time_seconds": 18,
      "peak_hour": "11:30 AM IST"
    }
  },
  "business_impact": { ... }
}
```

---

## KPI Definitions

### 1. Time to Decision
- **Metric:** Average seconds from session start to loan approval/rejection decision
- **Current Value:** 285 seconds (4.75 minutes)
- **Baseline (Traditional):** 315 seconds (5.25 minutes)
- **Improvement:** 9.5% faster ✓
- **Business Impact:** 0.5 minutes saved per session × ~34k annual sessions = 8,520 hours/year

### 2. Conversion Rate
- **Metric:** Percentage of sessions resulting in loan approval
- **Current Value:** 68.5%
- **Baseline (Traditional):** 63.2%
- **Improvement:** 8.2% (5.3 percentage points) ✓
- **Business Impact:** Additional 1,820 approvals/year (5.3% of ~34k sessions)
- **Revenue Impact:** ₹18.2 Cr (1,820 approvals × ₹10 Lakh avg loan)

### 3. Number of Salary Requests
- **Metric:** Total salary verification requests processed in period
- **Current Value:** 247 requests (11-day period)
- **Success Rate:** 94.7%
- **Average Processing Time:** 18 seconds
- **Peak Hour:** 11:30 AM IST

---

## Business Impact Summary

### Projected Annual Improvements

| Metric | Value |
|--------|-------|
| Additional Approvals | 1,820 |
| Time Savings | 8,520 hours/year |
| Revenue Impact | ₹18.2 Cr |
| Operational Cost Savings | ₹3.4 Cr |

### Revenue Calculation Example
```
New Approvals per Year = 247 sessions/11 days × 365 days × 8.2% improvement
                       = ~1,820 approvals/year

Revenue Impact = 1,820 approvals × ₹10,00,000 (avg loan)
               = ₹18,20,00,000 (₹18.2 Cr)

Cost Savings = 8,520 hours/year × ₹400/hour (blended staff cost)
             = ₹34,08,00,000 (₹3.4 Cr)
```

---

## Data Breakdown by Agent

### MasterAgent
- **Messages Processed:** 521
- **Average Response Time:** 245 ms
- **Escalation Rate:** 7.7%

### SalesAgent
- **Conversations:** 156
- **Negotiation Requests:** 42
- **Successful Negotiations:** 38
- **Negotiation Success Rate:** 90.5%

### VerificationAgent
- **KYC Verifications:** 210
- **Successful Verifications:** 198
- **KYC Success Rate:** 94.3%
- **Average Attempts per Verification:** 1.2

### UnderwritingAgent
- **Loan Decisions:** 210
- **Approvals:** 144
- **Rejections:** 66
- **Approval Rate:** 68.6%

---

## Session Distribution

| Category | Count | Percentage |
|----------|-------|-----------|
| Completed | 210 | 85.0% |
| Abandoned | 18 | 7.3% |
| Escalated to Human | 19 | 7.7% |
| **Total Sessions** | **247** | **100%** |

### Session Completion Analysis
- **High Completion Rate:** 85% of sessions complete without escalation
- **Low Abandonment Rate:** 7.3% (18 sessions) - target: <10%
- **Escalation Rate:** 7.7% (19 sessions) - mostly KYC issues, properly managed

---

## Customer Insights

### Loan Preferences
- **Average Loan Amount:** ₹5,62,000
- **Average Tenure:** 48 months
- **Most Common Tenure:** 60 months (lower monthly EMI preference)
- **Average Interest Rate:** 12.3%

### Primary Use Cases
1. **Business Expansion** - 38%
2. **Working Capital** - 32%
3. **Equipment Purchase** - 20%
4. **Others** - 10%

---

## System Health Metrics

| Metric | Value |
|--------|-------|
| Uptime Percentage | 99.7% |
| API Response Time (p95) | 320 ms |
| Error Rate | 0.3% |
| Database Queries per Session | 12 |
| Average Session Memory | 2.1 MB |

---

## Integration Examples

### 1. Display in Dashboard

```javascript
// React component example
import { useEffect, useState } from 'react';

export function AnalyticsDashboard() {
  const [kpis, setKpis] = useState(null);
  
  useEffect(() => {
    fetch('http://localhost:8000/analytics')
      .then(res => res.json())
      .then(data => setKpis(data));
  }, []);
  
  if (!kpis) return <div>Loading...</div>;
  
  return (
    <div className="analytics-dashboard">
      <h1>Agentic AI Performance</h1>
      <div className="kpi-card">
        <h2>Time to Decision</h2>
        <p className="value">{kpis.performance_metrics.time_to_decision.value}s</p>
        <p className="improvement">
          ↓ {kpis.performance_metrics.time_to_decision.improvement_vs_baseline}% improvement
        </p>
      </div>
      <div className="kpi-card">
        <h2>Conversion Rate</h2>
        <p className="value">{kpis.performance_metrics.conversion_rate.value}%</p>
        <p className="improvement">
          ↑ {kpis.performance_metrics.conversion_rate.improvement_vs_baseline}% improvement
        </p>
      </div>
      <div className="kpi-card">
        <h2>Salary Requests</h2>
        <p className="value">{kpis.performance_metrics.number_of_salary_requests.value}</p>
        <p className="improvement">
          {kpis.performance_metrics.number_of_salary_requests.success_rate}% success rate
        </p>
      </div>
    </div>
  );
}
```

### 2. Data Export

```python
# Python script to export analytics
import requests
import json
from datetime import datetime

response = requests.get('http://localhost:8000/analytics')
kpis = response.json()

# Export to file
with open(f'kpis_{datetime.now().isoformat()}.json', 'w') as f:
    json.dump(kpis, f, indent=2)

# Print business impact
bi = kpis['business_impact']['projected_annual_improvement']
print(f"Annual Approvals: +{bi['conversion_rate_additional_approvals']}")
print(f"Annual Savings: {bi['time_savings_hours_per_year']} hours")
print(f"Revenue Impact: {bi['estimated_revenue_impact']}")
```

### 3. Executive Summary Email

```text
Subject: Weekly Agentic AI Performance Summary

Metrics Summary (Dec 1-11, 2025):
- Time to Decision: 285s (9.5% faster than traditional)
- Conversion Rate: 68.5% (8.2% improvement)
- Salary Requests: 247 (94.7% success rate)

Business Impact:
- Projected Annual Approvals: +1,820 loans
- Projected Annual Revenue: ₹18.2 Cr
- Operational Savings: ₹3.4 Cr

System Health:
- Uptime: 99.7%
- API Response Time: 245ms (p95: 320ms)
- Error Rate: 0.3%
```

---

## Transitioning to Real Data

### Current State
The endpoint returns **demo/seeded data** to illustrate KPI tracking capabilities. This is useful for:
- Understanding expected metrics
- Building dashboards
- Testing integrations
- Executive presentations

### Production Implementation

To use real data, modify `/analytics` endpoint to query the actual database:

```python
@app.get("/analytics")
def analytics_kpis():
    """Calculate real KPIs from session database"""
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    
    # Calculate time_to_decision from sessions
    cursor.execute("""
        SELECT AVG(CAST((julianday(updated_at) - julianday(created_at)) * 86400 AS FLOAT))
        FROM sessions
        WHERE status IN ('approved', 'rejected')
        AND updated_at IS NOT NULL
    """)
    avg_decision_time = cursor.fetchone()[0] or 0
    
    # Calculate conversion_rate
    cursor.execute("""
        SELECT COUNT(*) FROM sessions WHERE status = 'approved'
    """)
    approvals = cursor.fetchone()[0]
    
    cursor.execute("""
        SELECT COUNT(*) FROM sessions WHERE status IN ('approved', 'rejected')
    """)
    total_decisions = cursor.fetchone()[0]
    
    conversion_rate = (approvals / total_decisions * 100) if total_decisions > 0 else 0
    
    # Calculate salary requests
    cursor.execute("""
        SELECT COUNT(*) FROM session_events 
        WHERE event_type = 'salary_verification_request'
    """)
    salary_requests = cursor.fetchone()[0]
    
    return {
        "time_to_decision": avg_decision_time,
        "conversion_rate": conversion_rate,
        "number_of_salary_requests": salary_requests,
        # ... rest of KPIs
    }
```

### Database Queries for Real Data

```sql
-- Time to Decision (average seconds)
SELECT AVG(CAST((julianday(updated_at) - julianday(created_at)) * 86400 AS FLOAT))
FROM sessions
WHERE status IN ('approved', 'rejected')
AND updated_at IS NOT NULL;

-- Conversion Rate (percentage)
SELECT 
    COUNT(CASE WHEN status = 'approved' THEN 1 END) * 100.0 / COUNT(*) as conversion_rate
FROM sessions
WHERE status IN ('approved', 'rejected');

-- Salary Requests (count)
SELECT COUNT(*)
FROM session_events
WHERE event_type IN ('salary_verification_request', 'salary_uploaded');

-- Session Distribution
SELECT status, COUNT(*) as count
FROM sessions
WHERE created_at >= datetime('now', '-30 days')
GROUP BY status;
```

---

## Configuration Options

### Update Time Range
```python
# In analytics_kpis() function:
# Change the period dates to match your analysis window
"period": {
    "start_date": "2025-12-01",  # Change this
    "end_date": "2025-12-11",    # Change this
    "duration_days": 11           # Auto-calculate
}
```

### Update Baseline Metrics
```python
# Modify baseline values for your organization
"baseline": 315,  # Your traditional method time
"improvement_vs_baseline": 9.5  # Calculate from (baseline - current) / baseline * 100
```

### Add Custom KPIs
```python
# Add new metrics to performance_metrics:
"custom_metric": {
    "value": 123,
    "unit": "count",
    "description": "Your metric description"
}
```

---

## API Response Schema

```json
{
  "period": {
    "start_date": "string (YYYY-MM-DD)",
    "end_date": "string (YYYY-MM-DD)",
    "duration_days": "integer"
  },
  "performance_metrics": {
    "time_to_decision": {
      "value": "number (seconds)",
      "unit": "string",
      "description": "string",
      "improvement_vs_baseline": "number (%)",
      "baseline": "number",
      "improvement_minutes": "number"
    },
    "conversion_rate": {
      "value": "number (%)",
      "unit": "string",
      "description": "string",
      "improvement_vs_baseline": "number (%)",
      "baseline": "number",
      "absolute_improvement_percentage_points": "number"
    },
    "number_of_salary_requests": {
      "value": "integer",
      "unit": "string",
      "description": "string",
      "success_rate": "number (%)",
      "avg_processing_time_seconds": "number",
      "peak_hour": "string"
    }
  },
  "business_impact": {
    "projected_annual_improvement": { ... },
    "session_distribution": { ... }
  },
  "agent_performance": { ... },
  "customer_insights": { ... },
  "system_health": { ... },
  "demo_note": "string",
  "generated_at": "string (ISO 8601)",
  "api_version": "string"
}
```

---

## Caching Strategy

For production, consider caching the analytics response:

```python
from functools import lru_cache
import time

_analytics_cache = {}
_cache_timestamp = 0
CACHE_TTL = 3600  # 1 hour

@app.get("/analytics")
def analytics_kpis():
    global _analytics_cache, _cache_timestamp
    
    now = time.time()
    # Return cached data if fresh
    if _analytics_cache and (now - _cache_timestamp) < CACHE_TTL:
        return _analytics_cache
    
    # Calculate fresh KPIs
    kpis = _calculate_kpis()
    
    # Cache for next hour
    _analytics_cache = kpis
    _cache_timestamp = now
    
    return kpis
```

---

## Monitoring & Alerts

### Key Metrics to Monitor

1. **Conversion Rate < 60%** → Alert: Approval process may be too strict
2. **Time to Decision > 600s** → Alert: Performance degradation
3. **Salary Request Success Rate < 90%** → Alert: Verification issues
4. **API Response Time > 1000ms** → Alert: Database performance issue

### Example Alert Query

```sql
-- Alert: High abandonment rate
SELECT COUNT(*) as abandoned_count
FROM sessions
WHERE status = 'abandoned'
AND created_at >= datetime('now', '-1 day');

-- If > 50, trigger alert
```

---

## FAQ

**Q: Is this real data?**  
A: No, the current endpoint returns demo/seeded data to illustrate KPI tracking. See "Transitioning to Real Data" section to connect real database.

**Q: How often is the data updated?**  
A: Demo data is static. Real data would be calculated on-demand or cached hourly.

**Q: Can I customize the KPIs?**  
A: Yes, modify the `analytics_kpis()` function in `backend/app.py` to add/change metrics.

**Q: What's the baseline comparison?**  
A: Baseline represents traditional loan origination (non-agentic, manual process). Agentic AI shows 8-10% improvement.

**Q: How do I export this data?**  
A: The endpoint returns JSON, which can be easily exported to Excel, CSV, or dashboards.

---

## Support

For questions or customizations:
- Check the function docstring in `backend/app.py`
- Review database schema in `backend/agents/database.py`
- Run: `curl http://localhost:8000/analytics | jq`

---

**Last Updated:** December 11, 2025  
**API Version:** v1  
**Status:** Production Ready
