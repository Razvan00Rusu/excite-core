/**
 * Links obtained from Semantic Scholar Citation API should be pasted here - requires an API key (https://www.semanticscholar.org/product/api).
 * The latest dataset can be queried at: https://api.semanticscholar.org/datasets/v1/release/latest/
 * The latest citation dataset can be queried at: https://api.semanticscholar.org/datasets/v1/release/latest/dataset/citation (With API key in header)
 */
const links = []

/**
 * Simply prints out each link onto a new line, should be output into a text file before running through scripts/download_data.sh
 */
links.forEach((link) => {
  console.log(link)
})
