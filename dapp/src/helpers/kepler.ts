import { Kepler, getOrbitId } from 'kepler-sdk';

export const addToKepler = async (
  kepler: Kepler,
  orbit: string,
  pkh: string,
  ...obj: Array<any>
) => {
  obj.forEach((o) => console.log(o));
  if (kepler) {
    // Get around the error of possibly passing nothing.
    let f = obj.pop();
    if (!f) {
      throw new Error('Empty array passed to saveToKepler');
    }

    const res = await kepler.put(orbit, f, ...obj);
    console.log('RES', res);
    if (res.status === 404) {
      await saveToKepler(kepler, pkh, ...[f, ...obj]);
    }
    if (!res.ok || res.status !== 200) {
      throw new Error(`Failed to create orbit: ${res.statusText}`);
    }

    const addresses = await res.text();

    return addresses.split('\n');
  }

  throw new Error('No Kepler integration found');
};

export const saveToKepler = async (
  kepler: Kepler,
  pkh: string,
  ...obj: Array<any>
) => {
  obj.forEach((o) => console.log(o));
  if (kepler) {
    // Get around the error of possibly passing nothing.
    let f = obj.pop();
    if (!f) {
      throw new Error('Empty array passed to saveToKepler');
    }

    try {
      const res = await kepler.createOrbit(f, ...obj);
      if (!res.ok || res.status !== 200) {
        throw new Error(`Failed to create orbit: ${res.statusText}`);
      }
      const addresses = await res.text();

      return addresses.split('\n');
    } catch (e) {
      console.warn(
        `Failed in create new orbit with error: ${
          e?.message || JSON.stringify(e)
        }`
      );
      console.warn('Trying existing orbit');
      try {
        let id = await getOrbitId(pkh, {
          domain: process.env.KEPLER_URL,
          index: 0,
        });
        return await addToKepler(kepler, id, pkh, ...[f, ...obj]);
      } catch (err) {
        throw err;
      }
    }
  }

  throw new Error('No Kepler integration found');
};
