import bcrypt from 'bcryptjs'

const encrypt = async (textPlain: string): Promise<string> => {
  const hash = await bcrypt.hash(textPlain, 10);
  return hash;
}

const compare = async (pass: string, passHash: string): Promise<boolean> => {
  return await bcrypt.compare(pass, passHash);
}

export { encrypt, compare };