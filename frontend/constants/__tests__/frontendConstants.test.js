const { adjustColors, mapColors } = require('frontend/constants/utils');

describe('frontend constants', () => {
  describe('color mapping / adjusting', () => {
    const numAdjustments = 4;
    let testColors;
    let adjustments;

    beforeEach(() => {
      testColors = {
        color1: [95, 95, 95],
        color2: [135, 135, 135],
        color3: [165, 165, 165],
      };
      adjustments = [
        {
          color1: 'rgb(95, 95, 95)',
          color2: 'rgb(135, 135, 135)',
          color3: 'rgb(165, 165, 165)',
        }, {
          color1: 'rgb(135, 135, 135)',
          color2: 'rgb(165, 165, 165)',
          color3: 'rgb(187, 187, 187)',
        }, {
          color1: 'rgb(175, 175, 175)',
          color2: 'rgb(195, 195, 195)',
          color3: 'rgb(210, 210, 210)',
        }, {
          color1: 'rgb(215, 215, 215)',
          color2: 'rgb(225, 225, 225)',
          color3: 'rgb(232, 232, 232)',
        }, {
          color1: 'rgb(255, 255, 255)',
          color2: 'rgb(255, 255, 255)',
          color3: 'rgb(255, 255, 255)',
        },
      ];
    });

    test('adjusts colors', () => {
      adjustments.forEach((adjustment, num) => (
        expect(adjustColors(testColors, num, numAdjustments)).toEqual(adjustment)
      ));
    });

    test('maps colors', () => {
      expect(mapColors(testColors, numAdjustments)).toEqual([...adjustments]);
    });
  });
});
