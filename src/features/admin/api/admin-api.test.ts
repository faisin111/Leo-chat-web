import { describe, it, expect, vi, beforeEach } from 'vitest';
import { http } from '@/shared/api/http-client';
import { adminApi } from './admin-api';

describe('adminApi.getStatsTimeseries', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('requests daily chart series with clamped days parameter', async () => {
    const mockSeries = {
      from: '2026-11-21',
      to: '2026-11-27',
      days: 7,
      series: {
        users: [{ date: '2026-11-27', value: 4 }],
        conversations: [{ date: '2026-11-27', value: 2 }],
        messages: [{ date: '2026-11-27', value: 38 }],
        reports: [{ date: '2026-11-27', value: 1 }],
      },
    };
    const getSpy = vi.spyOn(http, 'get').mockResolvedValueOnce({ data: mockSeries });

    const res = await adminApi.getStatsTimeseries(7);

    expect(getSpy).toHaveBeenCalledWith('/admin/stats/timeseries', { params: { days: 7 } });
    expect(res.days).toBe(7);
    expect(res.series.messages[0]?.value).toBe(38);
  });

  it('clamps days between 1 and 90', async () => {
    const getSpy = vi.spyOn(http, 'get').mockResolvedValue({ data: {} });

    await adminApi.getStatsTimeseries(0);
    await adminApi.getStatsTimeseries(180);

    expect(getSpy).toHaveBeenNthCalledWith(1, '/admin/stats/timeseries', { params: { days: 1 } });
    expect(getSpy).toHaveBeenNthCalledWith(2, '/admin/stats/timeseries', { params: { days: 90 } });
  });
});
