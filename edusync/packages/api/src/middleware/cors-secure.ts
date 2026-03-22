import cors from 'cors';

/**
 * Secure CORS configuration
 */
export const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    const allowedOrigins = [
      'https://edusync.io',
      'https://www.edusync.io',
      'https://api.edusync.io',
      'https://admin.edusync.io',
      process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null,
      process.env.NODE_ENV === 'development' ? 'http://localhost:3002' : null,
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Number'],
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200,
};

export const secureCors = cors(corsOptions);
