function isObject(value: unknown) {
  if (value === null) { return false;}
  return ( (typeof value === 'function') || (typeof value === 'object') ) && !Array.isArray(value);
}

export function signal<T extends Object>(target: T) {
  return signalImpl(target);
}

export type Effect = (value: any) => any;

const depsMap = new Map<SimpleObject, Effect[]>();
const proxyMap = new Map<SimpleObject, any>();

export type SimpleObject = { [key: string | symbol]: any }

function signalImpl<T extends SimpleObject>(target: T): T {
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }

  const targetClone: SimpleObject = Object.assign({}, target);

  Object.keys(target).forEach((key) => {
    if (isObject(target[key])) {
      targetClone[key] = signalImpl(target[key]);
    }
  })

  const newProxy = new Proxy(targetClone, {
    get(target, prop, receiver) {
      return Reflect.get(target, prop, receiver);
    },
    set(target, prop, value, receiver) {
      const deps = depsMap.get(receiver);
      const result = Reflect.set(target, prop, value, receiver);

      deps?.forEach(dep => dep(value));

      return result
    }
  });

  proxyMap.set(target, newProxy);

  return newProxy as T;
}

export function watch(dep: SimpleObject, cb: Effect) {
  depend(dep, cb);
}

export function depend(dep: SimpleObject, cb: Effect) {
  let depsArray = depsMap.get(dep);

  if (!depsArray) {
    depsArray = [];
    depsMap.set(dep, depsArray);
  }

  if (!depsArray.includes(cb)) {
    depsArray.push(cb);
  }
}

export type SystemEvent = {
  name: string;
  cb: () => any;
}
