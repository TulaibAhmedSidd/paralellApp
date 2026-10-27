import { ParallelClone } from '../src/native/ParallelClone';

describe('Parallel Space Isolation & Cloning Engine (rcosteira79/android-skills spec)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('successfully discovers installed applications on device', async () => {
    const apps = await ParallelClone.getInstalledApps();
    expect(Array.isArray(apps)).toBe(true);
    expect(apps.length).toBeGreaterThan(0);
    expect(apps[0]).toHaveProperty('packageName');
    expect(apps[0]).toHaveProperty('name');
  });

  test('clones Muzz (com.muzmatch.muzmatchapp) with isolated container ID', async () => {
    const muzzPackage = 'com.muzmatch.muzmatchapp';
    const cloneResult = await ParallelClone.cloneApp(muzzPackage, 'Muzz Account #2');

    expect(cloneResult.success).toBe(true);
    expect(cloneResult.cloneId).toBeDefined();

    const clones = await ParallelClone.getClonedApps();
    const clonedMuzz = clones.find(c => c.cloneId === cloneResult.cloneId);

    expect(clonedMuzz).toBeDefined();
    expect(clonedMuzz?.packageName).toBe(muzzPackage);
    expect(clonedMuzz?.cloneName).toBe('Muzz Account #2');
    expect(clonedMuzz?.isFrozen).toBe(false);
  });

  test('supports multiple isolated clones of the same app (Multi-Account)', async () => {
    const muzzPackage = 'com.muzmatch.muzmatchapp';

    // Clone 1 (Personal / Work Account 1)
    const clone1 = await ParallelClone.cloneApp(muzzPackage, 'Muzz Profile A');
    // Clone 2 (Alternative / Second Account 2)
    const clone2 = await ParallelClone.cloneApp(muzzPackage, 'Muzz Profile B');

    expect(clone1.cloneId).not.toEqual(clone2.cloneId);

    const clones = await ParallelClone.getClonedApps();
    const matches = clones.filter(c => c.packageName === muzzPackage);
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  test('toggles freeze/unfreeze state to hibernate background processes', async () => {
    const muzzPackage = 'com.muzmatch.muzmatchapp';
    const { cloneId } = await ParallelClone.cloneApp(muzzPackage, 'Muzz Freeze Test');

    // Freeze clone
    const frozenState = await ParallelClone.toggleFreezeApp(cloneId, true);
    expect(frozenState).toBe(true);

    let clones = await ParallelClone.getClonedApps();
    let target = clones.find(c => c.cloneId === cloneId);
    expect(target?.isFrozen).toBe(true);

    // Unfreeze clone
    const unfrozenState = await ParallelClone.toggleFreezeApp(cloneId, false);
    expect(unfrozenState).toBe(false);

    clones = await ParallelClone.getClonedApps();
    target = clones.find(c => c.cloneId === cloneId);
    expect(target?.isFrozen).toBe(false);
  });

  test('removes cloned instance and cleans up container registry', async () => {
    const testPackage = 'com.test.dummyapp';
    const { cloneId } = await ParallelClone.cloneApp(testPackage, 'Temp Clone');

    let clones = await ParallelClone.getClonedApps();
    expect(clones.some(c => c.cloneId === cloneId)).toBe(true);

    // Remove
    const removed = await ParallelClone.removeClonedApp(cloneId);
    expect(removed).toBe(true);

    clones = await ParallelClone.getClonedApps();
    expect(clones.some(c => c.cloneId === cloneId)).toBe(false);
  });

  test('launches isolated cloned application safely', async () => {
    const muzzPackage = 'com.muzmatch.muzmatchapp';
    const { cloneId } = await ParallelClone.cloneApp(muzzPackage, 'Muzz Launch Test');
    const launchResult = await ParallelClone.launchClone(cloneId);
    expect(launchResult).toBeTruthy();
  });
});
