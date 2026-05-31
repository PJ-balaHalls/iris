// fix-iris-mobile-typecheck.cjs
const fs = require("node:fs");
const path = require("node:path");
const cp = require("node:child_process");

const cwd = process.cwd();

function exists(targetPath) {
  return fs.existsSync(targetPath);
}

function resolveAppRoot() {
  if (
    exists(path.join(cwd, "package.json")) &&
    exists(path.join(cwd, "app")) &&
    exists(path.join(cwd, "src"))
  ) {
    return cwd;
  }

  if (
    exists(path.join(cwd, "mobile", "package.json")) &&
    exists(path.join(cwd, "mobile", "app")) &&
    exists(path.join(cwd, "mobile", "src"))
  ) {
    return path.join(cwd, "mobile");
  }

  console.error("Não encontrei o app mobile. Rode na raiz do projeto ou dentro de /mobile.");
  process.exit(1);
}

const appRoot = resolveAppRoot();

function write(relativePath, content) {
  const filePath = path.join(appRoot, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content.trimStart(), "utf8");
  console.log("✓", relativePath);
}

function patch(relativePath, updater) {
  const filePath = path.join(appRoot, relativePath);

  if (!exists(filePath)) {
    console.log("↳ ignorado, arquivo não existe:", relativePath);
    return;
  }

  const before = fs.readFileSync(filePath, "utf8");
  const after = updater(before);

  if (before !== after) {
    fs.writeFileSync(filePath, after, "utf8");
    console.log("✓ patch", relativePath);
  } else {
    console.log("↳ sem mudanças:", relativePath);
  }
}

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("IRIS Mobile Typecheck Fix");
console.log("App mobile:", appRoot);
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

write(
  "src/components/onboarding/OnboardingProgress.tsx",
  `
import { Text, View, type DimensionValue } from "react-native";

type OnboardingProgressProps = {
  current: number;
  total: number;
};

export function OnboardingProgress({
  current,
  total
}: OnboardingProgressProps) {
  const percent = Math.max(8, (current / total) * 100);
  const progressWidth = \`\${percent}%\` as DimensionValue;

  return (
    <View>
      <View className="flex-row items-center justify-between">
        <Text className="text-detail font-semibold text-foreground-muted">
          etapa {current}/{total}
        </Text>

        <Text className="text-detail text-foreground-muted">
          conta oficial
        </Text>
      </View>

      <View className="mt-3 h-[3px] overflow-hidden rounded-full bg-border">
        <View
          className="h-full rounded-full bg-foreground"
          style={{ width: progressWidth }}
        />
      </View>
    </View>
  );
}
`
);

patch("app/(auth)/private-login/[slug].tsx", (source) => {
  let output = source;

  if (!output.includes("type DimensionValue")) {
    output = output.replace(
      /from "react-native";/,
      'from "react-native";'
    );

    output = output.replace(
      /import \{\n([\s\S]*?)\n\} from "react-native";/,
      (match) => {
        if (match.includes("DimensionValue")) return match;

        return match.replace(
          /\n\} from "react-native";/,
          ",\n  type DimensionValue\n} from \"react-native\";"
        );
      }
    );
  }

  output = output.replace(
    /const progressWidth = questions\.length\s*\?\s*`\$\{Math\.max\(8, \(selectedCount \/ questions\.length\) \* 100\)\}%`\s*:\s*"8%";/,
    `const progressPercent = questions.length
    ? Math.max(8, (selectedCount / questions.length) * 100)
    : 8;

  const progressWidth = \`\${progressPercent}%\` as DimensionValue;`
  );

  output = output.replace(
    /style=\{\{ width: progressWidth \}\}/g,
    "style={{ width: progressWidth }}"
  );

  return output;
});

patch("src/schemas/private-login.schemas.ts", (source) => {
  return source.replaceAll(
    "z.record(z.unknown()).optional().default({})",
    "z.record(z.string(), z.unknown()).optional().default({})"
  );
});

patch("setup-iris-mobile-official-onboarding.cjs", (source) => {
  let output = source;

  output = output.replace(
    'import { Text, View } from "react-native";\\n\\n',
    'import { Text, View, type DimensionValue } from "react-native";\\n\\n'
  );

  output = output.replace(
    'const width = String(Math.max(8, (current / total) * 100)) + "%";',
    'const percent = Math.max(8, (current / total) * 100);\\n  const progressWidth = `${percent}%` as DimensionValue;'
  );

  output = output.replace(
    'style={{ width }}',
    'style={{ width: progressWidth }}'
  );

  output = output.replaceAll(
    "z.record(z.unknown()).optional().default({})",
    "z.record(z.string(), z.unknown()).optional().default({})"
  );

  return output;
});

console.log("");
console.log("Rodando typecheck...");
cp.execSync("npm run typecheck", {
  cwd: appRoot,
  stdio: "inherit",
  shell: true
});

console.log("");
console.log("✓ Typecheck corrigido.");