export interface viewedStatsResponse {
  totalView: number;
  viewCount: [{ label: string; value: number }];
  viewByProduct: [{ time: string; name: string; count: number }];
}
