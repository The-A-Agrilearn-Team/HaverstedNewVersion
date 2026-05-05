class Client {
  constructor() {}
  createRun() { return Promise.resolve(); }
  updateRun() { return Promise.resolve(); }
  readRun() { return Promise.resolve(null); }
  listRuns() { return Promise.resolve([]); }
}
class RunTree {
  constructor(config = {}) { Object.assign(this, config); }
  createChild() { return new RunTree(); }
  end() { return Promise.resolve(); }
  postRun() { return Promise.resolve(); }
  patchRun() { return Promise.resolve(); }
}
function traceable(fn) { return fn; }
function getCurrentRunTree() { return null; }
function isTraceableFunction() { return false; }
function overrideFetchImplementation() {}
function getDefaultProjectName() { return "default"; }
function isAsyncIterable(x) {
  return x != null && typeof x[Symbol.asyncIterator] === "function";
}

module.exports = {
  Client,
  RunTree,
  traceable,
  getCurrentRunTree,
  isTraceableFunction,
  overrideFetchImplementation,
  getDefaultProjectName,
  isAsyncIterable,
  __esModule: true,
  default: { Client, RunTree, traceable },
};
