import dayjs from 'dayjs';

export function UniqueId() {
  const timestamp = Date.now().toString(16);
  const randomPart = Math.random().toString(16).slice(2, 16);
  return (timestamp + randomPart).slice(0, 24);
}

export function isNullOrEmpty(value: string | null | undefined): boolean {
  value = value?.toString()?.trim();
  return value === null || value === undefined || value.trim() === '';
}

export function parseSpecs(raw: string): [string, string][] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line)
    .map((line) => {
      const [label, ...rest] = line.split(';');
      return [label.trim(), rest.join(';').trim()] as [string, string];
    });
}

export function stringifySpecs(specs: [string, string][]): string {
  return specs.map(([label, value]) => `${label}; ${value}`).join('\r\n');
}

export function formatToSlug(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatStatValue(value: number, type: 'currency' | 'number') {
  if (type === 'currency') {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)} Tỷ ₫`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)} Triệu ₫`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)} Nghìn ₫`;
    return `${value.toLocaleString('vi-VN')} ₫`;
  }
  return value.toLocaleString('vi-VN');
}

export function builDateFilter(value: [Date | null, Date | null], range: 'day' | 'month' | 'year') {
  const [from, to] = value;
  let startDate: string | undefined, endDate: string | undefined;

  if (range === 'day') {
    startDate = from ? dayjs(from).startOf('day').format('YYYY-MM-DD HH:mm:ss') : undefined;
    endDate = to ? dayjs(to).endOf('day').format('YYYY-MM-DD HH:mm:ss') : undefined;
  } else if (range === 'month') {
    startDate = from ? dayjs(from).startOf('month').format('YYYY-MM-DD HH:mm:ss') : undefined;
    endDate = to ? dayjs(to).endOf('month').format('YYYY-MM-DD HH:mm:ss') : undefined;
  } else {
    startDate = from ? dayjs(from).startOf('year').format('YYYY-MM-DD HH:mm:ss') : undefined;
    endDate = to ? dayjs(to).endOf('year').format('YYYY-MM-DD HH:mm:ss') : undefined;
  }

  return { startDate, endDate };
}

export function generatePastRange(
  timeRange: 'year' | 'month' | 'day',
  rangeValue: [Date | null, Date | null],
): [Date | null, Date | null] {
  const [from, to] = rangeValue;

  if (!from || !to) return [null, null];

  const dayFrom = dayjs(from);
  const dayTo = dayjs(to);

  let diff: number;
  let pastFrom: dayjs.Dayjs;
  let pastTo: dayjs.Dayjs;

  switch (timeRange) {
    case 'day':
      diff = dayTo.diff(dayFrom, 'day') + 1;
      pastFrom = dayFrom.subtract(diff, 'day').startOf('day');
      pastTo = dayFrom.subtract(1, 'day').endOf('day');
      break;

    case 'month':
      diff = dayTo.diff(dayFrom, 'month') + 1;
      pastFrom = dayFrom.subtract(diff, 'month').startOf('month');
      pastTo = dayFrom.subtract(1, 'month').endOf('month');
      break;

    case 'year':
      diff = dayTo.diff(dayFrom, 'year') + 1;
      pastFrom = dayFrom.subtract(diff, 'year').startOf('year');
      pastTo = dayFrom.subtract(1, 'year').endOf('year');
      break;

    default:
      return [null, null];
  }

  return [pastFrom.toDate(), pastTo.toDate()];
}
