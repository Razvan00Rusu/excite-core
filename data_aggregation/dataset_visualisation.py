import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import sys
import time

print(f"Number of command line args: {len(sys.argv)}")
print(f"Args: {sys.argv}")

semantic_scholar_path = sys.argv[1]
oh_my_papers_path = sys.argv[2]
fig_path = sys.argv[3]

big_source_papers = set(())
big_referenced_papers = set(())
big_total = set(())
big_ref_count = dict()

big_start = time.perf_counter()

chunks = pd.read_csv(semantic_scholar_path, on_bad_lines="warn", chunksize=10000000)

for chunk in chunks:
    for row in chunk.itertuples(index=True):
        big_source_papers.add(getattr(row, 'citing_id'))
        big_referenced_papers.add(getattr(row, 'cited_id'))
        big_total.add(getattr(row, 'citing_id'))
        big_total.add(getattr(row, 'cited_id'))

        ref_id = getattr(row, 'cited_id')
        if ref_id in big_ref_count:
            big_ref_count[ref_id] += 1
        else:
            big_ref_count[ref_id] = 1



big_counts = dict()

for value in big_ref_count.values():
    if value in big_counts:
        big_counts[value] += 1
    else:
        big_counts[value] = 1

big_counts = dict(sorted(big_counts.items()))

big_product_sum = 0

for key, value in big_counts.items():
    big_product_sum += key * value

big_end = time.perf_counter()
print(f"Time taken: {big_end-big_start:0.4f}")
print(f"big Source: {len(big_source_papers)}")
print(f"big Referenced: {len(big_referenced_papers)}")
print(f"big Total: {len(big_total)}")
print(f"big Ref Counts: {len(big_ref_count)}")
print(f"big Counts: {big_counts}")
print(f"big Sum of Counts: {big_product_sum}")

small_start = time.perf_counter()
small_df = pd.read_csv(oh_my_papers_path, on_bad_lines="warn")
print(small_df)
print(small_df.columns)

small_source_papers = set(())
small_referenced_papers = set(())
small_total = set(())
small_ref_count = dict()

for row in small_df.itertuples(index=True):
    small_source_papers.add(getattr(row, 'src_id'))
    small_referenced_papers.add(getattr(row, 'ref_id'))
    small_total.add(getattr(row, 'src_id'))
    small_total.add(getattr(row, 'ref_id'))

    ref_id = getattr(row, 'ref_id')
    if ref_id in small_ref_count:
        small_ref_count[ref_id] += 1
    else:
        small_ref_count[ref_id] = 1

small_counts = dict()

for value in small_ref_count.values():
    if value in small_counts:
        small_counts[value] += 1
    else:
        small_counts[value] = 1

small_counts = dict(sorted(small_counts.items()))

small_product_sum = 0

for key, value in small_counts.items():
    small_product_sum += key * value

small_end = time.perf_counter()
print(f"Time taken: {small_end-small_start:0.4f}")
print(f"small Source: {len(small_source_papers)}")
print(f"small Referenced: {len(small_referenced_papers)}")
print(f"small Total: {len(small_total)}")
print(f"small Ref Counts: {len(small_ref_count)}")
print(f"small Counts: {small_counts}")
print(f"small Sum of Counts: {small_product_sum}")

arr1 = np.array(list(big_counts.values()))
arr2 = np.array(list(small_counts.values()))

num_bin = 100
bin_lims = np.linspace(0, 1, num_bin+1)
bin_centers = 0.5 * (bin_lims[:-1]+bin_lims[1:])
bin_widths = bin_lims[1:]-bin_lims[:-1]

hist1, _ = np.histogram(arr1, bins=bin_lims)
hist2, _ = np.histogram(arr2, bins=bin_lims)

hist1b = hist1/np.max(hist1)
hist2b = hist2/np.max(hist2)

small_counts_np = np.array(list(small_counts.values()))
big_counts_np = np.array(list(big_counts.values()))

small_counts_norm = np.divide(small_counts_np, np.max(small_counts_np))
big_counts_norm = np.divide(big_counts_np, np.max(big_counts_np))

plt.bar(list(small_counts.keys()), small_counts_norm, label="Oh-My-Papers")
plt.bar(list(big_counts.keys()), big_counts_norm, label="Semantic Scholar Citation API")
plt.xlim(0, 200)
plt.xlabel("Number of appearances as a referenced document")
plt.ylabel("Normalised Frequency")
plt.title("Comparing the occurances of reference documents in the Oh-My-Papers dataset compared to the Semantic Scholar Citation API")
plt.legend()
plt.savefig(fig_path)
