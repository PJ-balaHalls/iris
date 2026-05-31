// web/src/components/onboarding/utils.ts
export function getAccountScopeFromEmail(email: string): "internal" | "external" {
  const domain = email.split("@")[1]?.toLowerCase().trim();
  return domain === "iris.com" ? "internal" : "external";
}

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase().replace(/^@/, "").replace(/[^a-z0-9_]/g, "");
}

export function onlyDigits(value: string | undefined): string {
  return (value ?? "").replace(/\D/g, "");
}

export function formatCpf(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return digits.slice(0, 3) + "." + digits.slice(3);
  if (digits.length <= 9) {
    return digits.slice(0, 3) + "." + digits.slice(3, 6) + "." + digits.slice(6);
  }

  return (
    digits.slice(0, 3) +
    "." +
    digits.slice(3, 6) +
    "." +
    digits.slice(6, 9) +
    "-" +
    digits.slice(9)
  );
}

export function formatCnpj(value: string): string {
  const digits = onlyDigits(value).slice(0, 14);

  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return digits.slice(0, 2) + "." + digits.slice(2);
  if (digits.length <= 8) {
    return digits.slice(0, 2) + "." + digits.slice(2, 5) + "." + digits.slice(5);
  }
  if (digits.length <= 12) {
    return (
      digits.slice(0, 2) +
      "." +
      digits.slice(2, 5) +
      "." +
      digits.slice(5, 8) +
      "/" +
      digits.slice(8)
    );
  }

  return (
    digits.slice(0, 2) +
    "." +
    digits.slice(2, 5) +
    "." +
    digits.slice(5, 8) +
    "/" +
    digits.slice(8, 12) +
    "-" +
    digits.slice(12)
  );
}

export function formatCep(value: string): string {
  const digits = onlyDigits(value).slice(0, 8);

  if (digits.length <= 5) return digits;

  return digits.slice(0, 5) + "-" + digits.slice(5);
}

export function calculateAge(birthDate: string | undefined): number | null {
  if (!birthDate) return null;

  const date = new Date(birthDate + "T00:00:00");

  if (Number.isNaN(date.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  const dayDiff = today.getDate() - date.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age;
}

export function getPasswordChecks(password: string, confirmPassword: string) {
  return [
    {
      key: "length",
      label: "Pelo menos 8 caracteres",
      valid: password.length >= 8,
    },
    {
      key: "lower",
      label: "Uma letra minúscula",
      valid: /[a-z]/.test(password),
    },
    {
      key: "upper",
      label: "Uma letra maiúscula",
      valid: /[A-Z]/.test(password),
    },
    {
      key: "number",
      label: "Um número",
      valid: /[0-9]/.test(password),
    },
    {
      key: "match",
      label: "As senhas precisam ser iguais",
      valid: password.length > 0 && password === confirmPassword,
    },
  ];
}
