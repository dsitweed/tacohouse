export enum VerificationIdentifierType {
  VERIFY = 'verify',
  RESET = 'reset',
}

type ParsedVerificationIdentifier = {
  type: VerificationIdentifierType;
  email: string;
};

export class VerificationIdentifier {
  static create(type: VerificationIdentifierType, email: string) {
    if (!email) {
      throw new Error('Verification identifier email is required');
    }

    return `${type}:${email}`;
  }

  static prefix(type: VerificationIdentifierType) {
    return `${type}:`;
  }

  static parse(identifier: string): ParsedVerificationIdentifier {
    const separatorIndex = identifier.indexOf(':');
    const type = identifier.slice(0, separatorIndex);
    const email = identifier.slice(separatorIndex + 1);

    if (
      !email ||
      !Object.values(VerificationIdentifierType).includes(
        type as VerificationIdentifierType,
      )
    ) {
      throw new Error('Invalid verification identifier');
    }

    return {
      type: type as VerificationIdentifierType,
      email,
    };
  }
}
