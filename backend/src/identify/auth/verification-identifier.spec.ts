import {
  VerificationIdentifier,
  VerificationIdentifierType,
} from './verification-identifier';

describe('VerificationIdentifier', () => {
  it('creates and parses a verification identifier', () => {
    const identifier = VerificationIdentifier.create(
      VerificationIdentifierType.VERIFY,
      'user@example.com',
    );

    expect(identifier).toBe('verify:user@example.com');
    expect(VerificationIdentifier.parse(identifier)).toEqual({
      type: VerificationIdentifierType.VERIFY,
      email: 'user@example.com',
    });
  });

  it('keeps the rest of the identifier intact after the first separator', () => {
    const identifier = VerificationIdentifier.create(
      VerificationIdentifierType.RESET,
      'quoted:local@example.com',
    );

    expect(VerificationIdentifier.parse(identifier).email).toBe(
      'quoted:local@example.com',
    );
  });

  it.each(['invalid:user@example.com', 'verify:', 'malformed'])(
    'rejects malformed identifier %s',
    (identifier) => {
      expect(() => VerificationIdentifier.parse(identifier)).toThrow(
        'Invalid verification identifier',
      );
    },
  );
});
