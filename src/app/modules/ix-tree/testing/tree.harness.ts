import { HarnessPredicate } from '@angular/cdk/testing';
import {
  MatTreeHarness, MatTreeNodeHarness, TreeHarnessFilters, TreeNodeHarnessFilters,
} from '@angular/material/tree/testing';

export class TreeHarness extends MatTreeHarness {
  static override hostSelector = '.ix-tree';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a tree with specific attributes.
   * @param options Options for narrowing the search
   * @return a `HarnessPredicate` configured with the given options.
   */
  static override with(options: TreeHarnessFilters = {}): HarnessPredicate<TreeHarness> {
    return new HarnessPredicate(TreeHarness, options);
  }

  override async getNodes(filter: TreeNodeHarnessFilters | undefined = {}): Promise<MatTreeNodeHarness[]> {
    return this.locatorForAll(MatTreeNodeHarness.with(filter))();
  }
}
