interface ResetToken {
  email: string;
  token: string;
  expire: Date;
}

interface TokenInfo {
  email: string;
  tokenExpiry: Date;
}

export { ResetToken, TokenInfo }