// Replaces {name} placeholders with params; unknown placeholders stay as-is.
export function format(
  template: string,
  params: Record<string, string | number> = {},
): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}
