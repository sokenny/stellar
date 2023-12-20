import { MainElements } from './types';
import { ElementHandle } from 'puppeteer';
import tryOrReturn from './helpers/tryOrReturn';

export const websitesToTest: string[] = [
  'https://lengaswear.com',
  'https://www.dipseastories.com/',
  'https://pinklabel.tv/',
  'https://www.bitstamp.net/', // has issues
  'https://wallet.uphold.com/',
  'https://www.gemini.com/share/vrnwe6s8',
  'https://bitcoinira.com/',
  'https://www.apartments.com/', // has issues
  'https://www.lemonade.com/car',
  'https://clearcover.com/',
  'https://www.autooptimize.ai/',
];

export const loginCtas: string[] = [
  'login',
  'log in',
  'sign in',
  'iniciar sesion',
  'iniciar sesión',
  'ingresar',
];

export const registerCtas: string[] = [
  'register',
  'sign up',
  'create account',
  'crear cuenta',
  'registrarse',
  'registrate',
  'create an account',
  'get started',
  'open account',
];

export const otherIrrelevantCtas: string[] = [
  'got it',
  'ok',
  'close',
  'cancel',
  'x',
];

export const buttonClasses: string[] = ['btn', 'button', 'cta'];
