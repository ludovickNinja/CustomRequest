/**
 * Production factories the admin can assign references to.
 *
 * The canonical list lives in the framework-neutral repo-root
 * `Data/factories.json` (alongside accounts + submissions). Each factory is
 * either `in-house` (a local CrownRing team) or `external`. The (future)
 * factory view will be scoped to one of these the same way the customer
 * view is scoped to a store.
 */
import factories from '../../../Data/factories.json';

export { factories };

export function findFactory(id) {
  if (!id) return null;
  return factories.find((f) => f.id === id) || null;
}

export function factoryName(id) {
  return findFactory(id)?.name || 'Unassigned';
}
