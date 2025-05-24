export default {
  port: 9000,
  log: {
    level: 'silly',
    disabled: false,
  },
  cors: {
    origins: ['http://localhost:5173'],
    maxAge: 3 * 60 * 60,
  },
  auth: {
    maxDelay: 5000, // ms (5 seconds)
    argon: {
      hashLength: 32,
      timeCost: 6,
      memoryCost: 2 ** 17,
    },
    jwt: {
      audience: 'budget.hogent.be',
      issuer: 'budget.hogent.be',
      expirationInterval: 60 * 60,
      secret: 'eenveeltemoeilijksecretdatniemandooitzalradenandersisdesitegehacked',
    },
  },
};
  