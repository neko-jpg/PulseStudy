import { describe, it, expect } from 'vitest';

import { calculateScore } from '../scorer';
import { slew } from '../stabilizer';
import { defaultConfig } from '../../focus-config';

const deg2rad = (deg: number) => (deg * Math.PI) / 180;

const baseFeatures = { headPitch: 0, headYaw: 0, browDown: 0, gazeDev: 0 };

describe('focus meter', () => {
  it('softens reading posture penalty using configured weight', () => {
    const features = { ...baseFeatures, headPitch: deg2rad(-30) };
    const scoreWithAllowance = calculateScore(features, defaultConfig);
    const configNoAllowance = {
      ...defaultConfig,
      reading: { ...defaultConfig.reading, weight: 1 },
    };
    const scoreWithoutAllowance = calculateScore(features, configNoAllowance);

    expect(scoreWithAllowance).toBeGreaterThan(scoreWithoutAllowance);
    expect(scoreWithAllowance).toBeCloseTo(0.925, 3);
  });

  it('limits rate of change via slew configuration', () => {
    const upLimited = slew(
      0,
      1,
      1,
      defaultConfig.slewRate.upPerSec,
      defaultConfig.slewRate.downPerSec,
    );
    expect(upLimited).toBeCloseTo(defaultConfig.slewRate.upPerSec, 6);

    const downLimited = slew(
      0.8,
      0,
      1,
      defaultConfig.slewRate.upPerSec,
      defaultConfig.slewRate.downPerSec,
    );
    expect(downLimited).toBeCloseTo(0.55, 6);
  });
});
