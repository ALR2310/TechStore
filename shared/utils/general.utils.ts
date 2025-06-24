export function UniqueId() {
  const timestamp = Date.now().toString(16);
  const randomPart = Math.random().toString(16).slice(2, 16);
  return (timestamp + randomPart).slice(0, 24);
}

export function isNullOrEmpty(value: string | null | undefined): boolean {
  return value === null || value === undefined || value.trim() === '';
}