// web/src/lib/botanic/identity.ts
import type {
  BotanicInclinationCode,
  BotanicSpeciesCode,
  BotanicStageCode,
} from "@/schemas/botanic/botanic-identity.schema";

type TranslatedBotanicIdentityInput = {
  speciesCode: BotanicSpeciesCode | string;
  stageCode: BotanicStageCode | string;
  inclinationCode: BotanicInclinationCode | string;
  governanceRoleCode?: string | null;
  rootGovernanceEnabled?: boolean;
};

export function translateBotanicIdentityToUi(input: TranslatedBotanicIdentityInput) {
  const speciesLabelMap: Record<string, string> = {
    IRIS: "Fundador / Direção",
    TULIPA: "Equipe IRÍS",
    ORQUIDEA: "Criador Verificado",
    LOTUS: "Assinante Ativo",
    DENTEDELEAO: "Conta Gratuita / Visitante",
  };

  const stageLabelMap: Record<string, string> = {
    DORMENTE: "Leitura restrita",
    BROTO: "Início limitado",
    FLORESCENCIA: "Uso completo",
    BIOMA: "Governança global",
  };

  const inclinationLabelMap: Record<string, string> = {
    NULO: "Sem foco definido",
    INTROSPECTIVA: "Introspecção e diários",
    SIMBIOTICA: "Memórias compartilhadas",
    CULTURAL: "Cultura e descobertas",
  };

  return {
    speciesLabel: speciesLabelMap[input.speciesCode] ?? "Identidade IRÍS",
    stageLabel: stageLabelMap[input.stageCode] ?? "Status protegido",
    inclinationLabel: inclinationLabelMap[input.inclinationCode] ?? "Foco não definido",
    isRootGovernance: Boolean(input.rootGovernanceEnabled && input.speciesCode === "IRIS"),
    governanceLabel:
      input.governanceRoleCode === "founder"
        ? "Fundador"
        : input.governanceRoleCode === "director"
          ? "Direção"
          : input.governanceRoleCode ?? null,
  };
}
