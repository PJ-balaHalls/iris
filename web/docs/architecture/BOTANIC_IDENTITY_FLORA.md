# IRÍS — Botanic Identity / Motor Flora

O Motor Flora é a camada global de identidade, permissão e roteamento cognitivo do ecossistema IRÍS.

A taxonomia botânica é interna ao sistema, banco, APIs, JWT e moderação. A interface final deve traduzir essa estrutura para nomes humanos e simples.

## Assinatura Flora

Formato oficial:

[ESPECIE]-[ESTAGIO]-[INCLINACAO]-[ACCOUNT_PREFIX]/[ACCOUNT_NUMBER]-[REGION]/[COUNTRY]

Exemplo:

LOTUS-FLORESCENCIA-SIMBIOTICA-IRS/000001-SP/BRA

## Códigos iniciais

Espécies: IRIS, TULIPA, ORQUIDEA, LOTUS, DENTEDELEAO.

Estágios: DORMENTE, BROTO, FLORESCENCIA, BIOMA.

Inclinações: NULO, INTROSPECTIVA, SIMBIOTICA, CULTURAL.

## Decisões técnicas

- Botanic Identity é global, não apenas Admin.
- Não usamos enum rígido como estrutura principal.
- Usamos tabelas de referência para permitir expansão futura.
- IRIS é a espécie fundadora sob Root Governance.
- IRIS-BIOMA-NULO representa poder supremo, mas nunca quebra Zero-Knowledge/E2EE.
- Chaves internas de criação são hashadas, auditadas e validadas apenas no servidor.
- Foto de perfil e capa usam o bucket iris-profile-assets.
