import { Throttle, SkipThrottle } from '@nestjs/throttler';

// 5 req/min — brute-force protection for login & signup
export const AuthThrottle = () => Throttle({ auth: { limit: 5, ttl: 60_000 } });

// 10 req/min — for token refresh
export const RefreshThrottle = () =>
  Throttle({ auth: { limit: 10, ttl: 60_000 } });

export { SkipThrottle };
