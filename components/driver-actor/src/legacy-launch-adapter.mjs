const queues = new WeakMap();

export function withLegacyLaunchSerialization(runtime) {
  let proxy;
  proxy = new Proxy(runtime, {
    get(target, property) {
      if (property === 'launch') {
        return (functionToken, options) => {
          const previous = queues.get(proxy) ?? Promise.resolve();
          const current = previous.catch(() => undefined).then(() => target.launch(functionToken, options));
          queues.set(proxy, current.catch(() => undefined));
          return current;
        };
      }
      const value = Reflect.get(target, property, target);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
  queues.set(proxy, Promise.resolve());
  return proxy;
}
