import {
  createHash,
} from "node:crypto";

function requireIdentifier(
  value: string,
  name: string,
): string {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    throw new Error(
      `内部ユーザーIDを生成できません: ${name}`,
    );
  }

  return normalizedValue;
}

export function createInternalUserId(
  channelId: string,
  verifiedSubject: string,
): string {
  const normalizedChannelId =
    requireIdentifier(
      channelId,
      "LINE_CHANNEL_ID",
    );
  const normalizedSubject =
    requireIdentifier(
      verifiedSubject,
      "sub",
    );

  return createHash("sha256")
    .update(
      `${normalizedChannelId}:${normalizedSubject}`,
      "utf8",
    )
    .digest("hex");
}
