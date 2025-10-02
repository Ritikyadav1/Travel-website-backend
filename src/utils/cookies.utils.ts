import { Response } from 'express';

// Function to set a cookie
export const setCookie = (
  res: Response,
  name: string,
  value: string,
  options: {
    httpOnly: boolean;
    secure: boolean;
    maxAge: number;
    sameSite?: 'strict' | 'lax' | 'none' | undefined;
    path: string;
  },
) => {
  res.cookie(name, value, options);
};

// Function to clear a cookie
export const clearCookie = (
  res: Response,
  name: string,
  options: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none' | undefined;
    path?: string;
  } = {},
) => {
  const defaultOptions: any = {
    httpOnly: options.httpOnly,
    secure: options.secure,
    sameSite: options.sameSite,
    path: options.path,
  };
  res.clearCookie(name, defaultOptions);
};
