export const widgets = {
  functionMachine: () => import('./functionMachine.js'),
  mappingDiagram: () => import('./mappingDiagram.js'),
  representations: () => import('./representations.js'),
  grapher: () => import('./grapher.js'),
  verticalLine: () => import('./verticalLine.js'),
  piecewise: () => import('./piecewise.js'),
  symmetry: () => import('./symmetry.js'),
  monotonic: () => import('./monotonic.js'),
};
