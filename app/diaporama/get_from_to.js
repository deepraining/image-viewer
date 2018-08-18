export default () => {
  const minScale = Math.random() * 0.2 + 0.7; // 0.7 - 0.9
  const maxScale = 1;
  const fromScaleIsMinScale = Math.floor(Math.random() * 2) === 0;

  const minCenterX = Math.random() * 0.15 + 0.3; // 0.3 - 0.45
  const maxCenterX = 1 - minCenterX; // 0.55 - 0.7
  const fromCenterXIsMinCenterX = Math.floor(Math.random() * 2) === 0;

  const minCenterY = Math.random() * 0.15 + 0.3; // 0.3 - 0.45
  const maxCenterY = 1 - minCenterY; // 0.55 - 0.7
  const fromCenterYIsMinCenterY = Math.floor(Math.random() * 2) === 0;

  return {
    from: [
      fromScaleIsMinScale ? minScale : maxScale,
      [
        fromCenterXIsMinCenterX ? minCenterX : maxCenterX,
        fromCenterYIsMinCenterY ? minCenterY : maxCenterY,
      ]
    ],
    to: [
      !fromScaleIsMinScale ? minScale : maxScale,
      [
        !fromCenterXIsMinCenterX ? minCenterX : maxCenterX,
        !fromCenterYIsMinCenterY ? minCenterY : maxCenterY,
      ]
    ]
  };
};
