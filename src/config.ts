import getConfig from 'next/config';

const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();

export const SERVER_BASEURL =
  publicRuntimeConfig.SERVER_BASEURL || 'http://localhost:3000';
export const API_BASEURL = `${SERVER_BASEURL}/api`;
