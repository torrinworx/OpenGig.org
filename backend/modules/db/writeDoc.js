const isObj = v => v && typeof v === 'object' && !Array.isArray(v);

const splitPath = (p) => {
  if (Array.isArray(p)) return p.map(String);
  if (typeof p === 'string') return p.split('.').filter(Boolean);
  throw new Error('path must be a string like "a.b.c" or an array of keys');
};

const toKey = (k) => {
  // support numeric array indexes passed as strings: "0", "1", ...
  if (typeof k === 'string' && /^\d+$/.test(k)) return Number(k);
  return k;
};

const getParentAndKey = (root, path) => {
  const parts = splitPath(path);
  if (parts.length === 0) throw new Error('empty path');
  let cur = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = toKey(parts[i]);
    if (cur == null) throw new Error(`path "${parts.slice(0, i + 1).join('.')}" is null/undefined`);
    cur = cur[key];
  }
  return { parent: cur, key: toKey(parts[parts.length - 1]) };
};

const applySet = (root, path, value) => {
  const { parent, key } = getParentAndKey(root, path);
  if (Array.isArray(parent) && typeof key === 'number' && key === parent.length) {
    parent.push(value);
  } else {
    parent[key] = value;
  }
};

const applyUnset = (root, path) => {
  const { parent, key } = getParentAndKey(root, path);
  if (Array.isArray(parent) && typeof key === 'number') {
    parent.splice(key, 1);
  } else {
    delete parent[key];
  }
};

export default () => {
  return {
    onMsg: async (props, { user, DB }) => {
      const { table, query, patch, flush = true, upsert = false, returnDoc = false } = props || {};

      if (user?.query?.role !== 'admin') {
        return { error: 'forbidden' };
      }

      if (typeof table !== 'string' || !table.trim()) {
        throw new Error('props.table (string) is required');
      }

      if (!isObj(query)) {
        throw new Error('props.query (object) is required');
      }

      if (!isObj(patch)) {
        throw new Error('props.patch (object) is required');
      }

      const setOps = isObj(patch.set) ? patch.set : {};
      const unsetOps = Array.isArray(patch.unset) ? patch.unset : [];

      // Find doc
      let querySection = await DB.query(table, query);
      let store = null;

      if (!querySection) {
        if (!upsert) return { error: 'not_found' };
        store = await DB.reuse(table, query);
      } else {
        store = await DB.instance(querySection, table);
      }

      // Apply patch
      for (const [p, v] of Object.entries(setOps)) applySet(store, p, v);
      for (const p of unsetOps) applyUnset(store, p);

      if (flush) await DB.flush(store);

      if (!returnDoc) {
        return { ok: true };
      }

	  return {
        ok: true,
      };
    }
  };
};