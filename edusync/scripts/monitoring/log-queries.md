# CloudWatch Logs Insights — Useful Queries for EduSync

Save these queries in CloudWatch Logs Insights for quick access during incidents.

---

## 1. Error Rate Over Time
```
fields @timestamp, @message
| filter @message like /ERROR|error|failed|Failed/
| stats count() as ErrorCount by bin(5m)
```

## 2. Slow Responses (Duration > 1s)
```
fields @timestamp, @message
| filter @message like /duration/
| parse @message '"duration":*,' as duration
| filter duration > 1000
| stats avg(duration) as AvgMs, max(duration) as MaxMs, count() as SlowRequests by bin(5m)
```

## 3. Authentication Failures
```
fields @timestamp, @message
| filter @message like /INVALID_TOKEN|AUTH_FAILED|NO_TOKEN|TOO_MANY_AUTH/
| stats count() as AuthFailures by bin(5m)
```

## 4. Database Connection Issues
```
fields @timestamp, @message
| filter @message like /ECONNREFUSED|connection refused|pool exhausted|timeout/
| stats count() as ConnectionErrors by bin(1m)
```

## 5. API Endpoints by Error Rate
```
fields @timestamp, @message
| filter @message like /status.*[45]\d\d/
| parse @message '"path":"*"' as endpoint
| stats count() as Errors by endpoint
| sort Errors desc
| limit 20
```

## 6. Top 10 Error Messages
```
fields @message
| filter @message like /ERROR|error/
| stats count() as Count by @message
| sort Count desc
| limit 10
```

## 7. Rate Limited Requests
```
fields @timestamp, @message
| filter @message like /RATE_LIMITED|TOO_MANY|429/
| stats count() as RateLimitedCount by bin(5m)
```

## 8. Admin Actions Audit Trail
```
fields @timestamp, @message
| filter @message like /admin_action/
| parse @message '"admin_uid":"*"' as admin
| parse @message '"action_type":"*"' as action
| stats count() as ActionCount by admin, action
| sort ActionCount desc
```

## 9. Memory & CPU Warnings
```
fields @timestamp, @message
| filter @message like /memory|heap|OOM|cpu/i
| stats count() as ResourceWarnings by bin(5m)
```

## 10. Successful vs Failed Requests
```
fields @timestamp, @message
| stats count(*) as Total,
        sum(strcontains(@message, '"status":2')) as Success2xx,
        sum(strcontains(@message, '"status":4')) as Client4xx,
        sum(strcontains(@message, '"status":5')) as Server5xx
  by bin(5m)
```

---

## Usage

1. Open **CloudWatch → Logs Insights**
2. Select log group: `/ecs/edusync-prod`
3. Paste any query above
4. Set time range (e.g., Last 1 hour)
5. Click **Run query**

## Scheduled Queries (Recommended)

Set up these as **Scheduled Queries** for daily reports:
- Error Rate Over Time (daily digest)
- Authentication Failures (security alert)
- Slow Responses (performance report)
