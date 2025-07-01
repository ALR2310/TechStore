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
