export const jwtConstants = {
  secret: '960efcd21a3de84bcf2e5f64780d20f6',
};

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
